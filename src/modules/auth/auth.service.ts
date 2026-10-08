import { Injectable,ConflictException,UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { RegisterDto,LoginDto } from './dto/auth.dto';
@Injectable() export class AuthService{constructor(private repo:AuthRepository,private jwt:JwtService){}
 async register(dto:RegisterDto){const email=dto.email.trim().toLowerCase();if(await this.repo.find(email))throw new ConflictException('Email exists');return this.repo.create(email,dto.name,await bcrypt.hash(dto.password,12));}
 async login(dto:LoginDto){const user=await this.repo.find(dto.email.trim().toLowerCase());if(!user?.isActive || !(await bcrypt.compare(dto.password,user.passwordHash)))throw new UnauthorizedException('Invalid credentials');return {accessToken:await this.jwt.signAsync({sub:user.id}),tokenType:'Bearer'};}
}