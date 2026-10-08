import { Body,Controller,Post } from '@nestjs/common';
import { Public } from '../../common/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto,RegisterDto } from './dto/auth.dto';
import { RefreshDto } from './dto/refresh.dto';
@Controller('auth') export class AuthController{
 constructor(private service:AuthService){}
 @Public() @Post('register') register(@Body() dto:RegisterDto){return this.service.register(dto);}
 @Public() @Post('login') login(@Body() dto:LoginDto){return this.service.login(dto);}
 @Public() @Post('refresh') refresh(@Body() dto:RefreshDto){return this.service.refresh(dto.refreshToken);}
 @Post('logout') logout(@Body() dto:RefreshDto){return this.service.logout(dto.refreshToken);}
}