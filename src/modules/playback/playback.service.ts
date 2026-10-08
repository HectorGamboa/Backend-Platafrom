import { ForbiddenException,Injectable,NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PlaybackRepository } from './playback.repository';
import { StartPlaybackDto } from './dto/playback.dto';
import { Prisma } from '@prisma/client';
const LEASE_MS=90_000;
@Injectable() export class PlaybackService{
 constructor(private readonly repo:PlaybackRepository){}
 async start(userId:string,dto:StartPlaybackDto){
  return this.repo.withUserLock(userId,async tx=>{
   const now=new Date();
   const subscription=await tx.subscription.findFirst({where:{userId,status:'ACTIVE',startsAt:{lte:now},endsAt:{gt:now}},include:{plan:true},orderBy:{endsAt:'desc'}});
   if(!subscription || !subscription.plan.isActive)throw new ForbiddenException('Active plan required');
   const device=await tx.deviceSession.findUnique({where:{userId_deviceId:{userId,deviceId:dto.deviceId}}});
   if(!device || device.revokedAt)throw new ForbiddenException('Register an active device first');
   // Playback requires an active rights record; metadata alone never grants rights.
   const licensed=await tx.licensedSource.findFirst({where:{contentId:dto.contentId,kind:{in:['movie','tv','channel']},territory:'MX',allowedCommercialUse:true,isActive:true,validFrom:{lte:now},validUntil:{gt:now}}});
   if(!licensed)throw new ForbiddenException('Content is not licensed for commercial playback');
   await tx.playbackSession.updateMany({where:{userId,deviceId:dto.deviceId,status:'ACTIVE'},data:{status:'ENDED',endedAt:now}});
   const count=await tx.playbackSession.count({where:{userId,status:'ACTIVE',expiresAt:{gt:now}}});
   if(count>=subscription.plan.maxConnections)throw new ForbiddenException('Concurrent playback limit reached');
   return tx.playbackSession.create({data:{id:randomUUID(),userId,subscriptionId:subscription.id,deviceId:dto.deviceId,contentId:dto.contentId,expiresAt:new Date(Math.min(now.getTime()+LEASE_MS,subscription.endsAt!.getTime()))}});
  });
 }
 async heartbeat(userId:string,id:string){
  return this.repo.withUserLock(userId,async tx=>{
   const now=new Date();
   const session=await tx.playbackSession.findFirst({where:{id,userId,status:'ACTIVE',expiresAt:{gt:now}},include:{subscription:{include:{plan:true}}}});
   if(!session)throw new NotFoundException('Playback session ended or expired');
   if(session.subscription.status!=='ACTIVE'||!session.subscription.startsAt||session.subscription.startsAt>now||!session.subscription.endsAt||session.subscription.endsAt<=now||!session.subscription.plan.isActive)throw new ForbiddenException('Subscription expired');
   const device=await tx.deviceSession.findUnique({where:{userId_deviceId:{userId,deviceId:session.deviceId}}});
   if(!device||device.revokedAt)throw new ForbiddenException('Device revoked');
   const licensed=await tx.licensedSource.findFirst({where:{contentId:session.contentId,territory:'MX',allowedCommercialUse:true,isActive:true,validFrom:{lte:now},validUntil:{gt:now}}});
   if(!licensed)throw new ForbiddenException('Content rights expired');
   return tx.playbackSession.update({where:{id},data:{lastHeartbeatAt:now,expiresAt:new Date(Math.min(now.getTime()+LEASE_MS,session.subscription.endsAt.getTime(),licensed.validUntil.getTime()))}});
  });
 }
 async stop(userId:string,id:string){
  const result=await this.repo.db.playbackSession.updateMany({where:{id,userId,status:'ACTIVE'},data:{status:'ENDED',endedAt:new Date()}});
  return {ended:result.count>0};
 }
 list(userId:string){return this.repo.db.playbackSession.findMany({where:{userId,status:'ACTIVE',expiresAt:{gt:new Date()}},orderBy:{startedAt:'desc'}});}
}