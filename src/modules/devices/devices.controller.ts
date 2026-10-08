import { Body,Controller,Delete,Get,Param,Post,Req } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/device.dto';
@Controller('devices') export class DevicesController{
 constructor(private readonly service:DevicesService){}
 @Get() list(@Req() req:{user:{id:string}}){return this.service.list(req.user.id);}
 @Post() register(@Req() req:{user:{id:string}},@Body() dto:RegisterDeviceDto){return this.service.register(req.user.id,dto);}
 @Delete(':deviceId') revoke(@Req() req:{user:{id:string}},@Param('deviceId') id:string){return this.service.revoke(req.user.id,id);}
}