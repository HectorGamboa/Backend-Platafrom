import { Injectable } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { MediaQueryDto } from './dto/media-query.dto';
@Injectable() export class MediaService {
 constructor(private readonly repo:MediaRepository){}
 providers(){
  return [
   {id:'tmdb',type:'metadata',enabled:!!process.env.TMDB_API_KEY},
   {id:'iptv-playlist',type:'catalog',enabled:!!process.env.IPTV_PLAYLIST_URL},
   {id:'licensed-vod',type:'movies-and-series',enabled:true},
   {id:'licensed-live',type:'live-tv',enabled:true},
   {id:'cinepro-education',type:'local-experiment',enabled:process.env.CINEPRO_NONCOMMERCIAL_MODE==='true'&&process.env.NODE_ENV!=='production'}
  ];
 }
 async sources(query:MediaQueryDto){
  const now=new Date();
  const sources=await this.repo.db.licensedSource.findMany({
   where:{contentId:query.contentId,kind:query.kind,territory:query.territory||'MX',isActive:true,allowedCommercialUse:true,validFrom:{lte:now},validUntil:{gt:now}},
   select:{id:true,contentId:true,kind:true,territory:true,rightsHolder:true,validUntil:true}
  });
  return {items:sources,available:sources.length>0};
 }
}
