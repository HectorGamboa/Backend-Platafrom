import { Injectable, ServiceUnavailableException } from '@nestjs/common';
@Injectable() export class CineproRepository {
 async fetchSources(baseUrl:string,path:string):Promise<unknown> {
  try {
   const response=await fetch(new URL(path,baseUrl),{signal:AbortSignal.timeout(25_000)});
   if(!response.ok)throw new Error('CinePro HTTP '+response.status);
   return response.json() as Promise<unknown>;
  } catch {
   throw new ServiceUnavailableException('Local CinePro service unavailable');
  }
 }
}
