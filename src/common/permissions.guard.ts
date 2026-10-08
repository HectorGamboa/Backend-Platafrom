import { CanActivate,ExecutionContext,Injectable,ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from './prisma/prisma.service';
@Injectable() export class PermissionsGuard implements CanActivate {
 constructor(private reflector:Reflector,private db:PrismaService){}
 async canActivate(ctx:ExecutionContext){
 const codes=this.reflector.getAllAndOverride<string[]>('permissions',[ctx.getHandler(),ctx.getClass()])||[];
 if(!codes.length)return true;
 const user=ctx.switchToHttp().getRequest().user;if(!user)throw new ForbiddenException();
 const roles=await this.db.userRole.findMany({where:{userId:user.id},include:{role:{include:{permissions:{include:{permission:true}}}}}});
 const granted=new Set(roles.flatMap(r=>r.role.permissions.map(p=>p.permission.code)));
 if(!codes.every(c=>granted.has('*')||granted.has(c)))throw new ForbiddenException('Missing permission');return true;
 }
}
