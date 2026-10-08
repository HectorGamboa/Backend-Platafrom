import { Injectable,ServiceUnavailableException,BadRequestException } from '@nestjs/common';
import { CatalogRepository } from './catalog.repository';
import { CatalogQueryDto } from './dto/catalog.dto';
import { pageMeta } from '../../common/api-response.interface';
export interface Channel{ id:string;name:string;country:string|null;category:string|null;logo:string|null;url:string;group:string|null }
@Injectable() export class CatalogService{
 constructor(private readonly repo:CatalogRepository){}
 async movies(category='popular',query=new CatalogQueryDto()){
  const allowed=['popular','top_rated','now_playing','upcoming'];
  if(!allowed.includes(category))throw new BadRequestException('Unsupported movie category');
  try{return await this.repo.tmdb('movie/'+category,{page:query.page});}catch{throw new ServiceUnavailableException('TMDB unavailable');}
 }
 async series(category='popular',query=new CatalogQueryDto()){
  const allowed=['popular','top_rated','on_the_air','airing_today'];
  if(!allowed.includes(category))throw new BadRequestException('Unsupported series category');
  try{return await this.repo.tmdb('tv/'+category,{page:query.page});}catch{throw new ServiceUnavailableException('TMDB unavailable');}
 }
 async details(kind:'movie'|'tv',id:string){
  if(!/^\d+$/.test(id))throw new BadRequestException('Invalid TMDB id');
  try{return await this.repo.tmdb(kind+'/'+id);}catch{throw new ServiceUnavailableException('TMDB unavailable');}
 }
 async season(id:string,season:string){
  if(!/^\d+$/.test(id)||!/^\d+$/.test(season))throw new BadRequestException('Invalid series or season');
  try{return await this.repo.tmdb('tv/'+id+'/season/'+season);}catch{throw new ServiceUnavailableException('TMDB unavailable');}
 }
 async episode(id:string,season:string,episode:string){
  if(!/^\d+$/.test(id)||!/^\d+$/.test(season)||!/^\d+$/.test(episode))throw new BadRequestException('Invalid episode reference');
  try{return await this.repo.tmdb('tv/'+id+'/season/'+season+'/episode/'+episode);}catch{throw new ServiceUnavailableException('TMDB unavailable');}
 }
 async search(query:CatalogQueryDto){
  if(!query.search?.trim())throw new BadRequestException('Search text required');
  try{return await this.repo.tmdb('search/multi',{query:query.search,page:query.page});}catch{throw new ServiceUnavailableException('TMDB unavailable');}
 }
 private async channels():Promise<Channel[]>{
  let content:string;
  try{content=await this.repo.playlist();}catch{throw new ServiceUnavailableException('Channel listing unavailable');}
  const result:Channel[]=[];let info:Record<string,string>|null=null;
  for(const line of content.split(/\r?\n/)){
   const value=line.trim();
   if(value.startsWith('#EXTINF:')){
    const fields:Record<string,string>={};
    for(const [,key,val] of value.matchAll(/([\w-]+)="([^"]*)"/g))fields[key]=val;
    fields.name=value.split(',').slice(1).join(',').trim()||fields['tvg-name']||'Unknown';
    info=fields;
   }else if(info && /^https?:\/\//.test(value)){
    const name=info.name;const country=info['tvg-country']||null;const group=info['group-title']||null;
    result.push({id:info['tvg-id']||name,name,country,category:group,group,logo:info['tvg-logo']||null,url:value});
    info=null;
   }else if(value && !value.startsWith('#'))info=null;
  }
  return result;
 }
 async live(query:CatalogQueryDto){
  const all=await this.channels();
  const filtered=all.filter(c=>(!query.country||c.country?.toLowerCase().split(';').includes(query.country.toLowerCase()))&&(!query.category||c.category?.toLowerCase().includes(query.category.toLowerCase()))&&(!query.search||c.name.toLowerCase().includes(query.search.toLowerCase())));
  const total=filtered.length;
  return {items:filtered.slice(query.skip,query.skip+query.limit),pagination:pageMeta(query.page,query.limit,total)};
 }
 async categories(){
  const all=await this.channels();return [...new Set(all.map(x=>x.category).filter((x):x is string=>!!x))].sort();
 }
 async movieGenres(){try{return await this.repo.tmdb('genre/movie/list');}catch{throw new ServiceUnavailableException('TMDB unavailable');}}
 async tvGenres(){try{return await this.repo.tmdb('genre/tv/list');}catch{throw new ServiceUnavailableException('TMDB unavailable');}}
}