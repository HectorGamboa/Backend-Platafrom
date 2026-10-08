import { Body,Controller,Get,Param,Patch,Post,Query,Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Permissions } from '../../common/permissions.decorator';
import { PaginationDto } from '../../common/pagination.dto';
import { CreateSubscriptionDto,UpdateSubscriptionDto } from './dto/subscription.dto';
@Controller('subscriptions') export class SubscriptionsController{
 constructor(private readonly service:SubscriptionsService){}
 @Get('me') mine(@Req() req:{user:{id:string}}){return this.service.myActive(req.user.id);}
 @Permissions('subscriptions:view') @Get() list(@Query() query:PaginationDto){return this.service.list(query);}
 @Permissions('subscriptions:view') @Get(':id') find(@Param('id') id:string){return this.service.find(id);}
 @Permissions('subscriptions:create') @Post() create(@Body() dto:CreateSubscriptionDto){return this.service.create(dto);}
 @Permissions('subscriptions:update') @Patch(':id/status') status(@Param('id') id:string,@Body() dto:UpdateSubscriptionDto){return this.service.changeStatus(id,dto.status);}
}