import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';
@Injectable() export class SubscriptionsRepository{
 constructor(readonly db:PrismaService){}
 list(skip:number,take:number){return this.db.subscription.findMany({skip,take,orderBy:{startsAt:'desc'},include:{plan:true}});}
 count(){return this.db.subscription.count();}
 find(id:string){return this.db.subscription.findUnique({where:{id},include:{plan:true}});}
 activeForUser(userId:string,now:Date){return this.db.subscription.findFirst({where:{userId,status:'ACTIVE',startsAt:{lte:now},endsAt:{gt:now}},orderBy:{endsAt:'desc'},include:{plan:true}});}
 changeStatus(id:string,status:SubscriptionStatus){return this.db.subscription.update({where:{id},data:{status}});}
}