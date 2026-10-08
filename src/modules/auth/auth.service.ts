import { Injectable,ConflictException,UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthRepository } from './auth.repository';
import { RegisterDto,LoginDto } from './dto/auth.dto';
import { TokensService } from './tokens.service';
@Injectable() export class AuthService{
 constructor(private repo:AuthRepository,private tokens:TokensService,private db:PrismaService){}
 async register(dto:RegisterDto){
  const email=dto.email.trim().toLowerCase();
  if(await this.repo.find(email))throw new ConflictException('Email exists');
  return this.db.$transaction(async tx=>{
   const user=await tx.user.create({data:{email,name:dto.name,passwordHash:await bcrypt.hash(dto.password,12)},select:{id:true,email:true,name:true}});
   const viewer=await tx.role.findUnique({where:{name:'viewer'}});
   if(viewer)await tx.userRole.create({data:{userId:user.id,roleId:viewer.id}});
   return user;
  });
 }
 async login(dto:LoginDto){const user=await this.repo.find(dto.email.trim().toLowerCase());if(!user?.isActive || !(await bcrypt.compare(dto.password,user.passwordHash)))throw new UnauthorizedException('Invalid credentials');return this.tokens.createPair(user.id);}
 refresh(value:string){return this.tokens.rotate(value);}
 logout(value:string){return this.tokens.revoke(value);}
}