import { Injectable,UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash,randomBytes,randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
const hash=(v:string)=>createHash('sha256').update(v).digest('hex');
const TTL_MS=30*24*60*60*1000;
@Injectable() export class TokensService{
 constructor(private readonly db:PrismaService,private readonly jwt:JwtService){}
 private access(id:string){return this.jwt.signAsync({sub:id});}
 async createPair(userId:string){
  const id=randomUUID(),secret=randomBytes(48).toString('base64url'),familyId=randomUUID();
  await this.db.refreshToken.create({data:{id,userId,familyId,tokenHash:hash(secret),expiresAt:new Date(Date.now()+TTL_MS)}});
  return {accessToken:await this.access(userId),refreshToken:id+'.'+secret,tokenType:'Bearer',expiresIn:900};
 }
 async rotate(value:string){
  const [id,secret,...extra]=value.split('.');
  if(!id||!secret||extra.length)throw new UnauthorizedException('Invalid refresh token');
  const old=await this.db.refreshToken.findUnique({where:{id}});
  if(!old || hash(secret)!==old.tokenHash)throw new UnauthorizedException('Invalid refresh token');
  if(old.revokedAt){
   // Reuse detection persists outside a failed transaction (no rollback).
   await this.db.refreshToken.updateMany({where:{familyId:old.familyId,revokedAt:null},data:{revokedAt:new Date()}});
   throw new UnauthorizedException('Refresh token reused; family revoked');
  }
  if(old.expiresAt<=new Date())throw new UnauthorizedException('Refresh token expired');
  // Single-use compare-and-swap: only the first concurrent attempt may rotate.
  const outcome=await this.db.$transaction(async tx=>{
   const changed=await tx.refreshToken.updateMany({where:{id,tokenHash:hash(secret),revokedAt:null,expiresAt:{gt:new Date()}},data:{revokedAt:new Date()}});
   if(changed.count!==1)return null;
   const user=await tx.user.findUnique({where:{id:old.userId}});
   if(!user?.isActive)throw new UnauthorizedException('Account disabled');
   const nextId=randomUUID(),nextSecret=randomBytes(48).toString('base64url');
   await tx.refreshToken.create({data:{id:nextId,userId:old.userId,familyId:old.familyId,tokenHash:hash(nextSecret),expiresAt:new Date(Date.now()+TTL_MS)}});
   return {userId:old.userId,refreshToken:nextId+'.'+nextSecret};
  });
  if(!outcome){
   await this.db.refreshToken.updateMany({where:{familyId:old.familyId,revokedAt:null},data:{revokedAt:new Date()}});
   throw new UnauthorizedException('Concurrent reuse detected; family revoked');
  }
  return {accessToken:await this.access(outcome.userId),refreshToken:outcome.refreshToken,tokenType:'Bearer',expiresIn:900};
 }
 async revoke(value:string){
  const [id,secret]=value.split('.');
  if(!id||!secret)return {revoked:true};
  await this.db.refreshToken.updateMany({where:{id,tokenHash:hash(secret),revokedAt:null},data:{revokedAt:new Date()}});
  return {revoked:true};
 }
}