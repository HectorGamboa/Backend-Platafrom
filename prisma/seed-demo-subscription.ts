import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
const db=new PrismaClient();
async function main(){
 if(process.env.NODE_ENV==='production')throw new Error('Development only');
 if(process.env.ALLOW_DEMO_SUBSCRIPTION!=='true')throw new Error('Set ALLOW_DEMO_SUBSCRIPTION=true explicitly');
 const email=process.env.ADMIN_EMAIL?.trim().toLowerCase();
 if(!email)throw new Error('ADMIN_EMAIL required');
 const user=await db.user.findUnique({where:{email}});
 if(!user)throw new Error('Admin user missing. Run npm run prisma:seed first');
 const plan=await db.plan.create({data:{name:'Veyra Local Test',priceCents:0,durationDays:7,maxConnections:2,isActive:true}});
 const now=new Date();
 const expires=new Date(now.getTime()+7*86400000);
 await db.subscription.create({data:{userId:user.id,planId:plan.id,status:'ACTIVE',startsAt:now,endsAt:expires}});
 console.log('Local 7-day test subscription enabled for',email);
 console.log('Expires:',expires.toISOString());
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>db.$disconnect());
