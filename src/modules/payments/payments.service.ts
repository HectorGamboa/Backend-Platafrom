import { BadRequestException,Injectable,ServiceUnavailableException } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentsRepository } from './payments.repository';
import { CheckoutDto } from './dto/checkout.dto';
@Injectable() export class PaymentsService{
 constructor(private repo:PaymentsRepository){}
 private stripe(){const key=process.env.STRIPE_SECRET_KEY;if(!key)throw new ServiceUnavailableException('Stripe not configured');return new Stripe(key);}
 async checkout(userId:string,dto:CheckoutDto){
  const plan=await this.repo.db.plan.findUnique({where:{id:dto.planId}});
  if(!plan?.isActive||plan.priceCents<=0)throw new BadRequestException('Plan unavailable');
  const successUrl=process.env.PAYMENT_SUCCESS_URL,cancelUrl=process.env.PAYMENT_CANCEL_URL;
  if(!successUrl||!cancelUrl)throw new ServiceUnavailableException('Payment redirects not configured');
  const order=await this.repo.db.paymentOrder.create({data:{userId,planId:plan.id,amountCents:plan.priceCents,currency:'MXN',provider:'stripe'}});
  try{
   const session=await this.stripe().checkout.sessions.create({
    mode:'payment',
    client_reference_id:order.id,
    line_items:[{price_data:{currency:'mxn',unit_amount:plan.priceCents,product_data:{name:plan.name}},quantity:1}],
    success_url:successUrl,
    cancel_url:cancelUrl,
    metadata:{orderId:order.id},
    payment_intent_data:{metadata:{orderId:order.id}},
   },{idempotencyKey:order.id});
   if(!session.url)throw new Error('Stripe checkout URL missing');
   return {orderId:order.id,checkoutUrl:session.url};
  }catch{
   await this.repo.db.paymentOrder.update({where:{id:order.id},data:{status:'FAILED'}});
   throw new ServiceUnavailableException('Payment checkout unavailable');
  }
 }
 async webhook(rawBody:Buffer,signature:string){
  const secret=process.env.STRIPE_WEBHOOK_SECRET;
  if(!secret)throw new ServiceUnavailableException('Stripe webhook not configured');
  let event:Stripe.Event;
  try{event=this.stripe().webhooks.constructEvent(rawBody,signature,secret);}catch{throw new BadRequestException('Invalid webhook signature');}
  if(event.type!=='checkout.session.completed')return {received:true,ignored:true};
  const session=event.data.object as Stripe.Checkout.Session;
  if(session.payment_status!=='paid')return {received:true,ignored:true};
  const orderId=session.metadata?.orderId;
  if(!orderId)return {received:true,ignored:true};
  await this.repo.db.$transaction(async tx=>{
   const rows=await tx.$queryRawUnsafe<Array<{id:string}>>('SELECT id FROM `PaymentOrder` WHERE id = ? FOR UPDATE',orderId);
   if(!rows.length)throw new BadRequestException('Unknown order');
   const order=await tx.paymentOrder.findUnique({where:{id:orderId},include:{plan:true}});
   if(!order||order.provider!=='stripe'||order.status==='REFUNDED')throw new BadRequestException('Invalid order');
   if(order.status==='PAID')return;
   if(session.currency?.toUpperCase()!==order.currency||session.amount_total!==order.amountCents||session.client_reference_id!==order.id)throw new BadRequestException('Payment mismatch');
   if(!order.plan.isActive)throw new BadRequestException('Plan inactive');
   const now=new Date();
   const expires=new Date(now.getTime()+order.plan.durationDays*86400000);
   const subscription=await tx.subscription.create({data:{userId:order.userId,planId:order.planId,status:'ACTIVE',startsAt:now,endsAt:expires}});
   await tx.paymentOrder.update({where:{id:order.id},data:{status:'PAID',paidAt:now,subscriptionId:subscription.id,providerPaymentId:session.payment_intent?.toString()||session.id}});
  });
  return {received:true};
 }
 async mine(userId:string){return this.repo.db.paymentOrder.findMany({where:{userId},orderBy:{createdAt:'desc'},select:{id:true,planId:true,amountCents:true,currency:true,status:true,createdAt:true,paidAt:true}});}
}
