import { Injectable } from '@nestjs/common';
@Injectable()
export class MediaService {
 providers(){
  return [
   {id:'tmdb',type:'metadata',enabled:!!process.env.TMDB_API_KEY},
   {id:'iptv-playlist',type:'catalog',enabled:!!process.env.IPTV_PLAYLIST_URL},
   {id:'licensed-vod',type:'movies-and-series',enabled:true},
   {id:'licensed-live',type:'live-tv',enabled:true},
   {id:'cinepro-education',type:'local-experiment',enabled:process.env.CINEPRO_NONCOMMERCIAL_MODE==='true'&&process.env.NODE_ENV!=='production'}
  ];
 }
}