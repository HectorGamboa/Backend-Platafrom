import { Injectable,ForbiddenException } from '@nestjs/common';
import { DevicesRepository } from './devices.repository';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { RegisterDeviceDto } from './dto/device.dto';
@Injectable() export class DevicesService{
 constructor(private readonly repo:DevicesRepository,private readonly subscriptions:SubscriptionsService){}
 list(userId:string){return this.repo.list(userId);}
 async register(userId:string,dto:RegisterDeviceDto){
  const sub=await this.subscriptions.myActive(userId);
  if(!sub)throw new ForbiddenException('Active subscription required');
  // Transaction plus per-user write lock are required before deploying across multiple API workers.
  return this.repo.db.$transaction(async tx=>{
   const existing=await tx.deviceSession.findUnique({where:{userId_deviceId:{userId,deviceId:dto.deviceId}}});
   if(existing && !existing.revokedAt)return tx.deviceSession.update({where:{id:existing.id},data:{lastSeenAt:new Date()}});
   const count=await tx.deviceSession.count({where:{userId,revokedAt:null}});
   if(count>=sub.plan.maxConnections)throw new ForbiddenException('Connection limit reached');
   return tx.deviceSession.upsert({where:{userId_deviceId:{userId,deviceId:dto.deviceId}},update:{revokedAt:null,lastSeenAt:new Date()},create:{userId,deviceId:dto.deviceId}});
  });
 }
 async revoke(userId:string,deviceId:string){await this.repo.revoke(userId,deviceId);return {revoked:true};}
}