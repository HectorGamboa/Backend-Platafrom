import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable() export class CatalogRepository{
 constructor(private readonly config:ConfigService){}
 async tmdb(path:string,params:Record<string,string|number>={}){
  const key=this.config.get<string>('TMDB_API_KEY');
  if(!key)throw new Error('TMDB_API_KEY not configured');
  const url=new URL('https://api.themoviedb.org/3/'+path.replace(/^\//,''));
  url.searchParams.set('api_key',key);
  url.searchParams.set('language','es-MX');
  for(const [k,v] of Object.entries(params))url.searchParams.set(k,String(v));
  const response=await fetch(url,{signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error('TMDB returned '+response.status);
  return response.json() as Promise<any>;
 }
 async playlist(){
  const source=this.config.get<string>('IPTV_PLAYLIST_URL')||'https://iptv-org.github.io/iptv/index.m3u';
  const url=new URL(source);
  if(url.protocol!=='https:')throw new Error('Playlist must be HTTPS');
  const response=await fetch(url,{signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('Playlist returned '+response.status);
  return response.text();
 }
}