import { Controller,Get,Query } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaQueryDto } from './dto/media-query.dto';
@Controller('media') export class MediaController {
 constructor(private readonly service:MediaService){}
 @Get('providers') providers(){return this.service.providers();}
 @Get('sources') sources(@Query() query:MediaQueryDto){return this.service.sources(query);}
}