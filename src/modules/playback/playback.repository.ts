import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
@Injectable() export class PlaybackRepository{
 constructor(readonly db:PrismaService){}
 async withUserLock<T>(userId:string,action:(tx:Prisma.TransactionClient)=>Promise<T>):Promise<T>{
  return this.db.$transaction(async tx=>{
   const rows=await tx.$queryRawUnsafe<Array<{id:string}>>('SELECT id FROM `User` WHERE id = ? FOR UPDATE',userId);
   if(!rows.length)throw new Error('User not found');
   return action(tx);
  },{maxWait:5000,timeout:10000,isolationLevel:'ReadCommitted'});
 }
}