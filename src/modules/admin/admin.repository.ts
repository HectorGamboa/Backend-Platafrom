import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable() export class AdminRepository {
 constructor(readonly db:PrismaService){}
 users(skip:number,take:number){return this.db.user.findMany({skip,take,select:{id:true,email:true,name:true,isActive:true,createdAt:true},orderBy:{createdAt:'desc'}});}
 usersCount(){return this.db.user.count();}
 roles(skip:number,take:number){return this.db.role.findMany({skip,take,orderBy:{name:'asc'},include:{permissions:{include:{permission:true}}}});}
 rolesCount(){return this.db.role.count();}
 permissions(skip:number,take:number){return this.db.permission.findMany({skip,take,orderBy:{code:'asc'}});}
 permissionsCount(){return this.db.permission.count();}
}