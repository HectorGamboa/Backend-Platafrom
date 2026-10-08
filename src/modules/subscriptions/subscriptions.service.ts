import { Injectable,BadRequestException,NotFoundException } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { PaginationDto } from '../../common/pagination.dto';
import { pageMeta } from '../../common/api-response.interface';
import { SubscriptionsRepository } from './subscriptions.repository';
import { CreateSubscriptionDto } from './dto/subscription.dto';
@Injectable() export class SubscriptionsService{
 constructor(private readonly repo:SubscriptionsRepository){}
 async list(query:PaginationDto){const [items,total]=await Promise.all([this.repo.list(query.skip,query.limit),this.repo.count()]);return {items,pagination:pageMeta(query.page,query.limit,total)};}
 async find(id:string){const result=await this.repo.find(id);if(!result)throw new NotFoundException('Subscription not found');return result;}
 async create(dto:CreateSubscriptionDto){
 const plan=await this.repo.db.plan.findUnique({where:{id:dto.planId}});
 if(!plan?.isActive)throw new BadRequestException('Plan unavailable');
 const user=await this.repo.db.user.findUnique({where:{id:dto.userId}});
 if(!user?.isActive)throw new BadRequestException('User unavailable');
 const start=dto.startsAt?new Date(dto.startsAt):new Date();
 const endsAt=new Date(start.getTime()+plan.durationDays*86400000);
 // New orders stay PENDING until payment/administrator approval.
 return this.repo.db.subscription.create({data:{userId:dto.userId,planId:dto.planId,status:'PENDING',startsAt:start,endsAt}});
 }
 async changeStatus(id:string,status:SubscriptionStatus){
 const row=await this.find(id);
 if(status==='ACTIVE'){
  if(!row.plan.isActive)throw new BadRequestException('Plan inactive');
  if(!row.endsAt || row.endsAt<=new Date())throw new BadRequestException('Subscription period expired');
 }
 return this.repo.changeStatus(id,status);
 }
 myActive(userId:string){return this.repo.activeForUser(userId,new Date());}
}