import {Controller,Get,Param,Query,Res,Req,UnauthorizedException,BadRequestException,ForbiddenException,Injectable,Module} from '@nestjs/common';
import {Public} from '../../common/public.decorator';
import {PrismaService} from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import {createHash} from 'crypto';
import type {Response} from 'express';

@Injectable()
export class XtreamService {
 constructor(private readonly db:PrismaService){}
 private enabled(){if(process.env.XTREAM_COMPAT_ENABLED!=='true')throw new ForbiddenException('Xtream compatibility disabled');}
 private async access(username:string,password:string){
  this.enabled();
  if(!username||!password)throw new UnauthorizedException('Credentials required');
  const user=await this.db.user.findUnique({where:{email:username.trim().toLowerCase()}});
  if(!user?.isActive||!(await bcrypt.compare(password,user.passwordHash)))throw new UnauthorizedException('Invalid credentials');
  const now=new Date();
  const subscription=await this.db.subscription.findFirst({where:{userId:user.id,status:'ACTIVE',startsAt:{lte:now},endsAt:{gt:now},plan:{isActive:true}},include:{plan:true},orderBy:{endsAt:'desc'}});
  if(!subscription)throw new ForbiddenException('Active subscription required');
  return {user,subscription};
 }
 // Different authorized origins sharing the same contentId represent one title.
 private group(rows:Awaited<ReturnType<XtreamService['sources']>>){
  const byId=new Map<string,typeof rows>();
  for(const row of rows){
   const key=row.kind+':'+row.contentId;
   const group=byId.get(key)||[];
   group.push(row);
   byId.set(key,group);
  }
  return [...byId.values()];
 }
 private numeric(id:string){const bytes=createHash('sha256').update(id).digest();return (bytes.readUInt32BE(0)&0x7fffffff)||1;}
 private async sources(kind?:string){
  const now=new Date();
  return this.db.licensedSource.findMany({where:{isActive:true,allowedCommercialUse:true,territory:'MX',validFrom:{lte:now},validUntil:{gt:now},...(kind?{kind}:{})},orderBy:{createdAt:'asc'}});
 }
 private readonly metadataCache=new Map<string,{expiry:number,value:any}>();
 private async metadata(kind:'movie'|'tv',id:string):Promise<any|null>{
  if(!/^\d+$/.test(id)||!process.env.TMDB_API_KEY)return null;
  const key=kind+':'+id,now=Date.now(),cached=this.metadataCache.get(key);
  if(cached&&cached.expiry>now)return cached.value;
  try{
   const url=new URL('https://api.themoviedb.org/3/'+kind+'/'+id);
   url.searchParams.set('api_key',process.env.TMDB_API_KEY);
   url.searchParams.set('language','es-MX');
   const response=await fetch(url,{signal:AbortSignal.timeout(5500)});
   if(!response.ok)return null;
   const value=await response.json();
   if(this.metadataCache.size>500)this.metadataCache.clear();
   this.metadataCache.set(key,{expiry:now+3600000,value});
   return value;
  }catch{return null;}
 }
 private poster(path?:string){return path?'https://image.tmdb.org/t/p/w500'+path:'';}
 private async decorate(source:{id:string,kind:string,contentId:string},kind:string){
  const item=this.item(source,kind);
  if(kind!=='movie'&&kind!=='tv')return item;
  const m=await this.metadata(kind==='movie'?'movie':'tv',source.contentId);
  if(!m)return item;
  return {...item,name:m.title||m.name||source.contentId,
   ...(kind==='movie'?{stream_icon:this.poster(m.poster_path)}:
   {cover:this.poster(m.poster_path),releaseDate:m.first_air_date||''})};
 }
 private category(kind:string){return [{category_id:'1',category_name:kind==='channel'?'Live TV':kind==='movie'?'Películas':'Series',parent_id:0}];}
 private item(source:{id:string,contentId:string,kind:string},kind:string){
  const id=this.numeric(source.kind+':'+source.contentId);
  if(kind==='channel')return {num:id,name:source.contentId,stream_type:'live',stream_id:id,stream_icon:'',epg_channel_id:'',category_id:'1',added:'0'};
  if(kind==='movie')return {num:id,name:source.contentId,stream_type:'movie',stream_id:id,stream_icon:'',container_extension:'mp4',category_id:'1',added:'0'};
  return {num:id,name:source.contentId,series_id:id,cover:'',category_id:'1',releaseDate:''};
 }
 async player(username:string,password:string,action?:string,params:Record<string,string>={}){
  const {user,subscription}=await this.access(username,password);
  if(!action){
   return {user_info:{username:user.email,password:'',message:'Veyra TV',auth:1,status:'Active',exp_date:String(Math.floor(subscription.endsAt!.getTime()/1000)),is_trial:'0',active_cons:'0',created_at:String(Math.floor(user.createdAt.getTime()/1000)),max_connections:String(subscription.plan.maxConnections),allowed_output_formats:['m3u8','ts','mp4']},server_info:{url:process.env.XTREAM_PUBLIC_HOST||'localhost',port:process.env.XTREAM_PUBLIC_PORT||'3000',https_port:process.env.XTREAM_PUBLIC_HTTPS_PORT||'443',server_protocol:process.env.XTREAM_PUBLIC_PROTOCOL||'http',timezone:'America/Merida'}};
  }
  const type:Record<string,string>={get_live_categories:'channel',get_live_streams:'channel',get_vod_categories:'movie',get_vod_streams:'movie',get_series_categories:'tv',get_series:'tv'};
  const kind=type[action];
  if(kind){
   if(action.endsWith('_categories'))return this.category(kind);
   const rows=await this.sources(kind);
   if(params.category_id&&params.category_id!=='1')return [];
   return Promise.all(this.group(rows).map(group=>this.decorate(group[0],kind)));
  }
  if(action==='get_vod_info'){
   const rows=await this.sources('movie');
   const source=rows.find(s=>this.numeric(s.kind+':'+s.contentId)===Number(params.vod_id));
   if(!source)return {};
   const m=await this.metadata('movie',source.contentId);
   return {info:{name:m?.title||source.contentId,movie_image:this.poster(m?.poster_path),plot:m?.overview||'',rating:String(m?.vote_average||''),releasedate:m?.release_date||''},movie_data:{stream_id:this.numeric(source.kind+':'+source.contentId),name:m?.title||source.contentId,container_extension:'mp4',category_id:'1'}};
  }
  if(action==='get_series_info'){
   const rows=await this.sources('tv');
   const source=rows.find(s=>this.numeric(s.kind+':'+s.contentId)===Number(params.series_id));
   if(!source)return {};
   // Episode contentId convention: SERIES_CONTENT_ID:SEASON:EPISODE.
   // Example: 1399:1:2 is episode 2 of season 1 of series 1399.
   const licensedEpisodes=await this.sources('episode');
   const episodes:Record<string,unknown[]>={};
   const seasons=new Set<number>();
   for(const group of this.group(licensedEpisodes)){
    const item=group[0];
    const match=/^(.*):(\d+):(\d+)$/.exec(item.contentId);
    if(!match||match[1]!==source.contentId)continue;
    const season=Number(match[2]),number=Number(match[3]);
    if(!Number.isSafeInteger(season)||!Number.isSafeInteger(number))continue;
    seasons.add(season);
    (episodes[String(season)] ||= []).push({
     id:String(this.numeric(item.kind+':'+item.contentId)),episode_num:number,
     title:'Episode '+number,container_extension:'mp4',season,
     info:{movie_image:''}
    });
   }
   for(const list of Object.values(episodes))list.sort((a:any,b:any)=>a.episode_num-b.episode_num);
   const m=await this.metadata('tv',source.contentId);
   return {info:{name:m?.name||source.contentId,cover:this.poster(m?.poster_path),plot:m?.overview||'',rating:m?.vote_average||0,releaseDate:m?.first_air_date||''},
    seasons:[...seasons].sort((a,b)=>a-b).map(n=>({season_number:n,name:'Season '+n})),episodes};
  }
  if(action==='get_short_epg')return {epg_listings:[]};
  return [];
 }
 async playlist(username:string,password:string){
  await this.access(username,password);
  const rows=await this.sources('channel');
  const base=(process.env.XTREAM_PUBLIC_URL||'http://localhost:3000').replace(/\/$/,'');
  const lines=['#EXTM3U'];
  for(const group of this.group(rows)){
   const source=group[0];
   lines.push('#EXTINF:-1 group-title="Live TV",'+source.contentId);
   lines.push(base+'/live/'+encodeURIComponent(username)+'/'+encodeURIComponent(password)+'/'+this.numeric(source.kind+':'+source.contentId)+'.ts');
  }
  return lines.join('\n')+'\n';
 }
 async stream(kind:string,username:string,password:string,file:string){
  await this.access(username,password);
  const numeric=Number(file.split('.')[0]);
  if(!Number.isSafeInteger(numeric)||numeric<1)throw new BadRequestException('Invalid stream identifier');
  const mapped:Record<string,string>={live:'channel',movie:'movie',series:'episode'};
  const target=mapped[kind];
  if(!target)throw new BadRequestException('Invalid stream type');
  const sources=await this.sources(target);
  const candidates=sources.filter(s=>this.numeric(s.kind+':'+s.contentId)===numeric);
  if(!candidates.length)throw new ForbiddenException('No authorized stream for this title');
  // Choose the first acceptable configured origin. Other origins remain
  // alternatives when a configuration is invalid, without exposing their URLs.
  for(const source of candidates){
   try{
    const url=new URL(source.playbackUrl);
    if(!['https:','http:'].includes(url.protocol))continue;
    if(process.env.NODE_ENV==='production'&&url.protocol!=='https:')continue;
    if(url.username||url.password)continue;
    return url.toString();
   }catch{continue;}
  }
  throw new ForbiddenException('No acceptable media origin for this title');
 }
}
@Controller()
export class XtreamController{
 constructor(private readonly xtream:XtreamService){}
 @Public() @Get('player_api.php') player(@Query() q:Record<string,string>){return this.xtream.player(q.username,q.password,q.action,q);}
 @Public() @Get('get.php') async playlist(@Query() q:Record<string,string>,@Res() res:Response){
  const result=await this.xtream.playlist(q.username,q.password);
  res.type('application/x-mpegURL').send(result);
 }
 @Public() @Get(['live/:username/:password/:file','movie/:username/:password/:file','series/:username/:password/:file']) async stream(@Param() p:Record<string,string>,@Res() res:Response,@Req() req:Request){
  const kind=String((req as any).path||'').split('/')[1];
  const url=await this.xtream.stream(kind,p.username,p.password,p.file);
  res.redirect(302,url);
 }
}
@Module({controllers:[XtreamController],providers:[XtreamService]})
export class XtreamModule{}
