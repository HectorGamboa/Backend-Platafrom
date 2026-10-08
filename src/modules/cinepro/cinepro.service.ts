import { BadRequestException, ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CineproRepository } from './cinepro.repository';
@Injectable() export class CineproService {
 constructor(private readonly repository:CineproRepository){}
 private localBase():string {
  if(process.env.NODE_ENV==='production' || process.env.CINEPRO_NONCOMMERCIAL_MODE!=='true') {
   throw new ForbiddenException('Educational CinePro integration disabled');
  }
  const raw=process.env.CINEPRO_URL;
  if(!raw)throw new ServiceUnavailableException('CINEPRO_URL not configured');
  let parsed:URL;
  try {parsed=new URL(raw);} catch {throw new BadRequestException('CINEPRO_URL invalid');}
  if(parsed.protocol!=='http:' || !['127.0.0.1','localhost','[::1]'].includes(parsed.hostname) || parsed.username || parsed.password || parsed.search || parsed.hash) {
   throw new ForbiddenException('Only local HTTP CinePro instances are allowed');
  }
  return parsed.toString();
 }
 async movie(id:string) {
  if(!/^\d{1,12}$/.test(id))throw new BadRequestException('Invalid TMDB ID');
  return {nonCommercialOnly:true,data:await this.repository.fetchSources(this.localBase(),'/v1/movies/'+id)};
 }
 async episode(id:string,season:number,episode:number) {
  if(!/^\d{1,12}$/.test(id) || !Number.isSafeInteger(season) || season<1 || !Number.isSafeInteger(episode) || episode<1) {
   throw new BadRequestException('Invalid episode reference');
  }
  return {nonCommercialOnly:true,data:await this.repository.fetchSources(this.localBase(),`/v1/tv/${id}/seasons/${season}/episodes/${episode}`)};
 }
}
