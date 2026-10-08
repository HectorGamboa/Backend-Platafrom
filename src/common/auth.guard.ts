import { CanActivate,ExecutionContext,Injectable,UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
@Injectable() export class AuthGuard implements CanActivate{
 constructor(private reflector:Reflector,private jwt:JwtService,private db:PrismaService){}
 async canActivate(ctx:ExecutionContext){
 if(this.reflector.getAllAndOverride<boolean>('isPublic',[ctx.getHandler(),ctx.getClass()]))return true;
 const req=ctx.switchToHttp().getRequest();const auth=String(req.headers.authorization||'');
 if(!auth.startsWith('Bearer '))throw new UnauthorizedException();
 try {const payload=await this.jwt.verifyAsync<{sub:string}>(auth.slice(7));const user=await this.db.user.findUnique({where:{id:payload.sub},select:{id:true,email:true,isActive:true}});if(!user?.isActive)throw new Error();req.user=user;return true;}catch{throw new UnauthorizedException('Invalid token');}
 }
}
