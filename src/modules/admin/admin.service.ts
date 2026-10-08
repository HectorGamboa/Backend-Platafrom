import { Injectable,NotFoundException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { PaginationDto } from '../../common/pagination.dto';
import { pageMeta } from '../../common/api-response.interface';
import { UpdateUserDto,CreateRoleDto,CreatePermissionDto } from './dto/admin.dto';
@Injectable() export class AdminService {
 constructor(private readonly repo:AdminRepository){}
 async users(q:PaginationDto){const [items,total]=await Promise.all([this.repo.users(q.skip,q.limit),this.repo.usersCount()]);return {items,pagination:pageMeta(q.page,q.limit,total)};}
 async roles(q:PaginationDto){const [items,total]=await Promise.all([this.repo.roles(q.skip,q.limit),this.repo.rolesCount()]);return {items,pagination:pageMeta(q.page,q.limit,total)};}
 async permissions(q:PaginationDto){const [items,total]=await Promise.all([this.repo.permissions(q.skip,q.limit),this.repo.permissionsCount()]);return {items,pagination:pageMeta(q.page,q.limit,total)};}
 createRole(dto:CreateRoleDto){return this.repo.db.role.create({data:dto});}
 createPermission(dto:CreatePermissionDto){return this.repo.db.permission.create({data:dto});}
 async updateUser(id:string,dto:UpdateUserDto){
  const user=await this.repo.db.user.findUnique({where:{id}});if(!user)throw new NotFoundException('User not found');
  return this.repo.db.user.update({where:{id},data:dto,select:{id:true,email:true,name:true,isActive:true}});
 }
 assignRole(userId:string,roleId:string){return this.repo.db.userRole.upsert({where:{userId_roleId:{userId,roleId}},update:{},create:{userId,roleId}});}
 grantPermission(roleId:string,permissionId:string){return this.repo.db.rolePermission.upsert({where:{roleId_permissionId:{roleId,permissionId}},update:{},create:{roleId,permissionId}});}
}