import { Body,Controller,Delete,Get,Param,Post,Req } from '@nestjs/common';
import { PlaybackService } from './playback.service';
import { StartPlaybackDto } from './dto/playback.dto';
@Controller('playback') export class PlaybackController {constructor(private readonly service:PlaybackService){}
 @Post('sessions') start(@Req() req:{user:{id:string}},@Body() dto:StartPlaybackDto){return this.service.start(req.user.id,dto);}
 @Get('sessions') list(@Req() req:{user:{id:string}}){return this.service.list(req.user.id);}
 @Post('sessions/:id/heartbeat') heartbeat(@Req() req:{user:{id:string}},@Param('id') id:string){return this.service.heartbeat(req.user.id,id);}
 @Delete('sessions/:id') stop(@Req() req:{user:{id:string}},@Param('id') id:string){return this.service.stop(req.user.id,id);}
}