import { Body,Controller,Get,Param,Patch,Post,Query } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PaginationDto } from '../../common/pagination.dto';
import { Permissions } from '../../common/permissions.decorator';
import { Public } from '../../common/public.decorator';
import { CreatePlanDto,UpdatePlanDto } from './dto/plan.dto';
@Controller('plans') export class PlansController{
 constructor(private readonly service:PlansService){}
 @Public() @Get() list(@Query() query:PaginationDto){return this.service.list(query);}
 @Public() @Get(':id') find(@Param('id') id:string){return this.service.find(id);}
 @Permissions('plans:create') @Post() create(@Body() dto:CreatePlanDto){return this.service.create(dto);}
 @Permissions('plans:update') @Patch(':id') update(@Param('id') id:string,@Body() dto:UpdatePlanDto){return this.service.update(id,dto);}
}