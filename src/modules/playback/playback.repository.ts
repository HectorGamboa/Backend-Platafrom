import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable() export class PlaybackRepository {constructor(readonly db:PrismaService){}
 async withUserLock<T>(userId:string,action:(tx:any)=>Promise<T>):Promise<T>{
  return this.db.$transaction(async tx=>{
   // Serialize starts per user with the parent user row lock on MySQL/InnoDB.
   const rows=await tx.$queryRawUnsafe<Array<{id:string}>>('SELECT id FROM `User` WHERE id = ? FOR UPDATE',userId);
   if(!rows.length)throw new Error('User not found');
   return action(tx);
  },{maxWait:5000,timeout:10000,isolationLevel:'ReadCommitted'});
 }
}