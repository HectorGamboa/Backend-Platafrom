import { Injectable,ForbiddenException,BadRequestException,ServiceUnavailableException } from '@nestjs/common';
import { ContentRightsService } from '../content-rights/content-rights.service';
@Injectable() export class CineproService{
 constructor(private readonly rights:ContentRightsService){}
 async sources(kind:'movie'|'tv',id:string,season?:number,episode?:number){
  // CinePro is licensed for noncommercial use. This endpoint is OFF by default
  // and must not be enabled in a paid/public streaming deployment.
  if(process.env.CINEPRO_NONCOMMERCIAL_MODE!=='true'||process.env.NODE_ENV==='production')throw new ForbiddenException('CinePro noncommercial integration disabled');
  if(!/^\d{1,12}$/.test(id))throw new BadRequestException('Invalid title ID');
  if(kind==='tv'&&(!Number.isInteger(season)||!Number.isInteger(episode)||!season||!episode||season<1||episode<1))throw new BadRequestException('Invalid episode');
  const base=process.env.CINEPRO_URL;
  if(!base)throw new ServiceUnavailableException('CinePro URL is not configured');
  const parsed=new URL(base);
  if(!['localhost','127.0.0.1','::1','[::1]'].includes(parsed.hostname))throw new ForbiddenException('CinePro must run on loopback');
  // The commercial resolver remains entirely separate; CinePro data is never exposed as a commercially authorized stream.
  const path=kind==='movie'?'/v1/movies/'+id:'/v1/tv/'+id+'/seasons/'+season+'/episodes/'+episode;
  try{
   const response=await fetch(new URL(path,parsed),{signal:AbortSignal.timeout(25000)});
   if(!response.ok)throw new Error('upstream '+response.status);
   const data=await response.json();
   return {nonCommercialOnly:true,metadata:data};
  }catch{throw new ServiceUnavailableException('Local CinePro unavailable');}
 }
}