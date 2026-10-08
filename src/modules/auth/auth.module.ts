import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { TokensService } from './tokens.service';
import { TokensRepository } from './tokens.repository';
@Module({controllers:[AuthController],providers:[AuthService,AuthRepository,TokensService,TokensRepository]})export class AuthModule{}
