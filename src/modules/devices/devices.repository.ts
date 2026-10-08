import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable() export class DevicesRepository{
 constructor(readonly db:PrismaService){}
 list(userId:string){return this.db.deviceSession.findMany({where:{userId,revokedAt:null},orderBy:{lastSeenAt:'desc'}});}
 revoke(userId:string,deviceId:string){return this.db.deviceSession.updateMany({where:{userId,deviceId,revokedAt:null},data:{revokedAt:new Date()}});}
}