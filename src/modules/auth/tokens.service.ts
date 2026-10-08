import { Injectable,UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash,randomBytes,randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
const hash=(v:string)=>createHash('sha256').update(v).digest('hex');
const TTL_MS=30*24*60*60*1000;
@Injectable() export class TokensService{
 constructor(private readonly db:PrismaService,private readonly jwt:JwtService){}
 private async access(userId:string){return this.jwt.signAsync({sub:userId});}
 async createPair(userId:string){
  const id=randomUUID(),secret=randomBytes(48).toString('base64url'),familyId=randomUUID();
  await this.db.refreshToken.create({data:{id,userId,familyId,tokenHash:hash(secret),expiresAt:new Date(Date.now()+TTL_MS)}});
  return {accessToken:await this.access(userId),refreshToken:id+'.'+secret,tokenType:'Bearer',expiresIn:900};
 }
 async rotate(refreshToken:string){
  const [id,secret,...extra]=refreshToken.split('.');
  if(!id||!secret||extra.length)throw new UnauthorizedException('Invalid refresh token');
  return this.db.$transaction(async tx=>{
   const rows=await tx.$queryRawUnsafe<Array<{id:string}>>('SELECT id FROM `RefreshToken` WHERE id = ? FOR UPDATE',id);
   if(!rows.length)throw new UnauthorizedException('Invalid refresh token');
   const old=await tx.refreshToken.findUnique({where:{id}});
   if(!old || hash(secret)!==old.tokenHash)throw new UnauthorizedException('Invalid refresh token');
   if(old.revokedAt){
    await tx.refreshToken.updateMany({where:{familyId:old.familyId,revokedAt:null},data:{revokedAt:new Date()}});
    throw new UnauthorizedException('Refresh token reuse detected');
   }
   if(old.expiresAt<=new Date())throw new UnauthorizedException('Refresh token expired');
   const user=await tx.user.findUnique({where:{id:old.userId}});
   if(!user?.isActive)throw new UnauthorizedException('Account disabled');
   await tx.refreshToken.update({where:{id},data:{revokedAt:new Date()}});
   const nextId=randomUUID(),nextSecret=randomBytes(48).toString('base64url');
   await tx.refreshToken.create({data:{id:nextId,userId:old.userId,familyId:old.familyId,tokenHash:hash(nextSecret),expiresAt:new Date(Date.now()+TTL_MS)}});
   return {userId:old.userId,refreshToken:nextId+'.'+nextSecret};
  }).then(async result=>({accessToken:await this.access(result.userId),refreshToken:result.refreshToken,tokenType:'Bearer',expiresIn:900}));
 }
 async revoke(token:string){
  const [id,secret]=token.split('.');
  if(!id||!secret)return {revoked:true};
  await this.db.refreshToken.updateMany({where:{id,tokenHash:hash(secret),revokedAt:null},data:{revokedAt:new Date()}});
  return {revoked:true};
 }
}
