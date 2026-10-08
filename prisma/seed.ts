import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
 const codes = ['*','users:view','users:update','roles:view','roles:create','roles:update','permissions:view','permissions:create','permissions:update','plans:create','plans:update','subscriptions:view','subscriptions:create','subscriptions:update'];
 for (const code of codes) await db.permission.upsert({where:{code},update:{},create:{code}});
 const adminRole=await db.role.upsert({where:{name:'admin'},update:{},create:{name:'admin'}});
 const viewerRole=await db.role.upsert({where:{name:'viewer'},update:{},create:{name:'viewer'}});
 const permissions=await db.permission.findMany({where:{code:{in:codes}}});
 for(const permission of permissions)await db.rolePermission.upsert({
  where:{roleId_permissionId:{roleId:adminRole.id,permissionId:permission.id}},update:{},
  create:{roleId:adminRole.id,permissionId:permission.id}
 });

 const adminEmail=process.env.ADMIN_EMAIL?.trim().toLowerCase();
 const adminPassword=process.env.ADMIN_PASSWORD;
 if(adminEmail&&adminPassword){
  if(adminPassword.length<12)throw new Error('ADMIN_PASSWORD must be at least 12 chars');
  const admin=await db.user.upsert({where:{email:adminEmail},update:{},
   create:{email:adminEmail,name:'Administrator',passwordHash:await bcrypt.hash(adminPassword,12)}});
  await db.userRole.upsert({where:{userId_roleId:{userId:admin.id,roleId:adminRole.id}},update:{},
   create:{userId:admin.id,roleId:adminRole.id}});
  console.log('Administrator ready:',adminEmail);
 }else console.log('Set ADMIN_EMAIL and ADMIN_PASSWORD to bootstrap administrator');

 // An opt-in real viewer with an active test plan for Xtream/Lumen local testing.
 // Never provision demo accounts or subscriptions in production.
 if(process.env.SEED_VIEWER_DEMO==='true'){
  if(process.env.NODE_ENV==='production')throw new Error('Demo viewer seed is forbidden in production');
  const email=process.env.VIEWER_EMAIL?.trim().toLowerCase() || 'viewer@veyra.tv';
  const password=process.env.VIEWER_PASSWORD;
  if(!password||password.length<12)throw new Error('VIEWER_PASSWORD must be set and contain at least 12 characters');
  if(email===adminEmail)throw new Error('Viewer and admin must have different emails');
  const existing=await db.user.findUnique({where:{email}});
  const viewer=existing
   ? await db.user.update({where:{id:existing.id},data:{name:'Veyra Viewer',isActive:true,passwordHash:await bcrypt.hash(password,12)}})
   : await db.user.create({data:{email,name:'Veyra Viewer',isActive:true,passwordHash:await bcrypt.hash(password,12)}});
  await db.userRole.upsert({where:{userId_roleId:{userId:viewer.id,roleId:viewerRole.id}},
   update:{},create:{userId:viewer.id,roleId:viewerRole.id}});
  let plan=await db.plan.findFirst({where:{name:'Veyra Viewer Local Demo'}});
  if(!plan)plan=await db.plan.create({data:{name:'Veyra Viewer Local Demo',priceCents:0,durationDays:30,maxConnections:2,isActive:true}});
  else if(!plan.isActive)plan=await db.plan.update({where:{id:plan.id},data:{isActive:true}});
  const now=new Date(),expires=new Date(now.getTime()+30*24*60*60*1000);
  const current=await db.subscription.findFirst({where:{userId:viewer.id,planId:plan.id},orderBy:{endsAt:'desc'}});
  if(current)await db.subscription.update({where:{id:current.id},data:{status:'ACTIVE',startsAt:now,endsAt:expires}});
  else await db.subscription.create({data:{userId:viewer.id,planId:plan.id,status:'ACTIVE',startsAt:now,endsAt:expires}});
  console.log('Viewer ready:',email,'| ACTIVE demo subscription until',expires.toISOString());
 }else console.log('Viewer role ready (set SEED_VIEWER_DEMO=true plus VIEWER_PASSWORD to create a test user)');
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>db.$disconnect());
