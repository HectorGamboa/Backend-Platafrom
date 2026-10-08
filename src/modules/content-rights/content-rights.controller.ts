import { Body,Controller,Get,Param,Patch,Post,Query } from '@nestjs/common';
import { Permissions } from '../../common/permissions.decorator';
import { CreateLicensedSourceDto } from './dto/rights.dto';
import { MediaBulkImportDto } from './dto/media-bulk-import.dto';
import { ContentRightsService } from './content-rights.service';
@Controller('content-rights')export class ContentRightsController{
 constructor(private readonly service:ContentRightsService){}
 @Permissions('content-rights:view')@Get()list(){return this.service.list();}
 @Permissions('content-rights:create')@Post()create(@Body() dto:CreateLicensedSourceDto){return this.service.create(dto);}
 @Permissions('content-rights:create')@Post('bulk') bulk(@Body() dto:MediaBulkImportDto){return this.service.bulk(dto);}
 @Permissions('content-rights:update')@Patch(':id/activate')activate(@Param('id') id:string){return this.service.activate(id);}
 @Permissions('content-rights:view')@Get('resolve/:kind/:contentId')resolve(@Param('kind') kind:string,@Param('contentId') contentId:string,@Query('territory') territory='MX'){return this.service.resolve(contentId,kind,territory);}
}