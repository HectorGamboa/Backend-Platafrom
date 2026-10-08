import { Controller,Get,Param,ParseIntPipe } from '@nestjs/common';
import { Permissions } from '../../common/permissions.decorator';
import { CineproService } from './cinepro.service';
@Controller('integrations/cinepro') @Permissions('cinepro:debug') export class CineproController{
 constructor(private readonly service:CineproService){}
 @Get('movies/:id') movie(@Param('id') id:string){return this.service.sources('movie',id);}
 @Get('tv/:id/seasons/:season/episodes/:episode') tv(@Param('id') id:string,@Param('season',ParseIntPipe) season:number,@Param('episode',ParseIntPipe) episode:number){return this.service.sources('tv',id,season,episode);}
}