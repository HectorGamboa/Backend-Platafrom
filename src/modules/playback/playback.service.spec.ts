import { ForbiddenException } from '@nestjs/common';
import { PlaybackService } from './playback.service';
describe('PlaybackService',()=>{
 const now=new Date();
 const tx:any={
  subscription:{findFirst:jest.fn().mockResolvedValue({id:'sub',endsAt:new Date(Date.now()+3600000),plan:{maxConnections:1,isActive:true}})},
  deviceSession:{findUnique:jest.fn().mockResolvedValue({id:'device',revokedAt:null})},
  licensedSource:{findFirst:jest.fn().mockResolvedValue({id:'source',validUntil:new Date(Date.now()+3600000)})},
  playbackSession:{updateMany:jest.fn().mockResolvedValue({count:0}),count:jest.fn().mockResolvedValue(1),create:jest.fn()},
 };
 const repository:any={withUserLock:(_userId:string,callback:(tx:any)=>Promise<unknown>)=>callback(tx)};
 const service=new PlaybackService(repository);
 it('rejects starting a second playback when the plan is full',async()=>{
  await expect(service.start('user',{deviceId:'device-2',contentId:'movie:1'})).rejects.toBeInstanceOf(ForbiddenException);
 });
 it('rejects playback when commercial rights are missing',async()=>{
  tx.licensedSource.findFirst.mockResolvedValueOnce(null);
  await expect(service.start('user',{deviceId:'device-2',contentId:'movie:1'})).rejects.toBeInstanceOf(ForbiddenException);
 });
});
