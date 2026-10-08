import { Body,Controller,Get,Headers,Post,Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CheckoutDto } from './dto/checkout.dto';
import { Public } from '../../common/public.decorator';
@Controller('payments') export class PaymentsController{
 constructor(private readonly service:PaymentsService){}
 @Post('checkout') checkout(@Req() req:{user:{id:string}},@Body() dto:CheckoutDto){return this.service.checkout(req.user.id,dto);}
 @Get('me') mine(@Req() req:{user:{id:string}}){return this.service.mine(req.user.id);}
 @Public() @Post('webhook/stripe') webhook(@Req() req:{rawBody?:Buffer},@Headers('stripe-signature') signature:string){
  if(!req.rawBody)throw new Error('Enable rawBody option in NestFactory');
  return this.service.webhook(req.rawBody,signature);
 }
}