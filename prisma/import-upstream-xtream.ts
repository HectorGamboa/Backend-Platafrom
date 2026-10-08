import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
import {createHash} from 'crypto';

const db=new PrismaClient();
type Row=Record<string,any>;
const host=(process.env.UPSTREAM_XTREAM_URL||'').replace(/\/$/,'');
const username=process.env.UPSTREAM_XTREAM_USERNAME||'';
const password=process.env.UPSTREAM_XTREAM_PASSWORD||'';
const limit=Math.min(1000,Math.max(1,Number(process.env.UPSTREAM_XTREAM_LIMIT||'100')));
const permitted=process.env.UPSTREAM_XTREAM_REDISTRIBUTION_APPROVED==='true';
const prefix='xtream-'+createHash('sha256').update(host+'|'+username).digest('hex').slice(0,10);
const imported={channels:0,movies:0,series:0,episodes:0,skipped:0};

async function get(action:string,extra:Record<string,string>={}):Promise<any>{
 const url=new URL('/player_api.php',host);
 url.searchParams.set('username',username);url.searchParams.set('password',password);
 url.searchParams.set('action',action);
 for(const [key,value] of Object.entries(extra))url.searchParams.set(key,value);
 const response=await fetch(url,{signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Upstream returned HTTP '+response.status+' for '+action);
 return response.json();
}
function itemUrl(kind:'live'|'movie'|'series',id:string,ext:string):string{
 const base=new URL(host);
 return new URL('/'+kind+'/'+encodeURIComponent(username)+'/'+encodeURIComponent(password)+'/'+encodeURIComponent(id)+'.'+ext,base).toString();
}
async function register(kind:string,contentId:string,url:string){
 if(contentId.length>120||!/^https?:\/\//.test(url)){imported.skipped++;return;}
 const current=await db.licensedSource.findFirst({where:{kind,contentId,territory:'MX'}});
 if(current){imported.skipped++;return;}
 await db.licensedSource.create({data:{kind,contentId,playbackUrl:url,territory:'MX',
  rightsHolder:'Configured Xtream upstream provider',
  licenseReference:'Upstream contract review required',allowedCommercialUse:false,isActive:false,
  validFrom:new Date('2020-01-01T00:00:00.000Z'),
  validUntil:new Date('2099-01-01T00:00:00.000Z')}});
 imported[kind==='channel'?'channels':kind==='movie'?'movies':kind==='tv'?'series':'episodes']++;
}
async function main(){
 if(process.env.NODE_ENV==='production')throw new Error('Import is staging-only');
 if(process.env.UPSTREAM_XTREAM_IMPORT!=='true')throw new Error('Set UPSTREAM_XTREAM_IMPORT=true');
 if(!host||!username||!password)throw new Error('Provide UPSTREAM_XTREAM_URL, USERNAME and PASSWORD');
 const origin=new URL(host);
 if(!['http:','https:'].includes(origin.protocol)||origin.username||origin.password||origin.search||origin.pathname!=='/')throw new Error('Upstream URL must be a clean http(s) host');
 if(!permitted)console.log('Importing candidates as inactive until redistribution approved');
 const live=await get('get_live_streams');
 if(Array.isArray(live))for(const row of live.slice(0,limit) as Row[]){
  if(!row.stream_id)continue;
  const name=String(row.name||row.stream_id).slice(0,75);
  await register('channel',prefix+'-'+name+'-'+row.stream_id,itemUrl('live',String(row.stream_id),'ts'));
 }
 const movies=await get('get_vod_streams');
 if(Array.isArray(movies))for(const row of movies.slice(0,limit) as Row[]){
  if(!row.stream_id)continue;
  const contentId=String(row.tmdb_id||'').match(/^\d+$/)?String(row.tmdb_id):prefix+'-vod-'+row.stream_id;
  const ext=String(row.container_extension||'mp4').match(/^(mp4|mkv|avi|m3u8)$/i)?.[0]||'mp4';
  await register('movie',contentId,itemUrl('movie',String(row.stream_id),ext));
 }
 const series=await get('get_series');
 if(Array.isArray(series))for(const row of series.slice(0,limit) as Row[]){
  if(!row.series_id)continue;
  const candidate=String(row.tmdb_id||'');
  const seriesId=/^\d+$/.test(candidate)?candidate:prefix+'-series-'+row.series_id;
  // A series is catalog metadata. It becomes visible only when a playable episode was imported.
  let count=0;
  try{
   const details=await get('get_series_info',{series_id:String(row.series_id)});
   const seasons=details?.episodes;
   if(seasons&&typeof seasons==='object'){
    for(const [season,items] of Object.entries(seasons)){
     if(!Array.isArray(items))continue;
     for(const ep of items.slice(0,Math.min(limit,100)) as Row[]){
      if(!ep.id||!/^\d+$/.test(season))continue;
      const episode=Number(ep.episode_num);
      if(!Number.isSafeInteger(episode)||episode<1)continue;
      const ext=String(ep.container_extension||'mp4').match(/^(mp4|mkv|avi|m3u8)$/i)?.[0]||'mp4';
      await register('episode',seriesId+':'+season+':'+episode,itemUrl('series',String(ep.id),ext));count++;
     }
    }
   }
  }catch{console.log('A series did not return importable episodes; skipped');}
  if(count)await register('tv',seriesId,'https://example.org/series-catalogue-only');
 }
 console.log('Imported STAGED records:',imported);
 console.log('Entries remain INACTIVE / noncommercial until rights and playback are verified.');
}
main().catch(error=>{console.error('Import failed:',String(error.message||error).replaceAll(password,'[REDACTED]'));process.exitCode=1;}).finally(()=>db.$disconnect());
