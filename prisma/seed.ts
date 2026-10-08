import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const db=new PrismaClient();
async function main(){
 const codes=['*','users:view','users:update','roles:view','roles:create','roles:update','permissions:view','permissions:create','permissions:update','plans:create','plans:update','subscriptions:view','subscriptions:create','subscriptions:update'];
 for(const code of codes)await db.permission.upsert({where:{code},update:{},create:{code}});
 const admin=await db.role.upsert({where:{name:'admin'},update:{},create:{name:'admin'}});
 const viewer=await db.role.upsert({where:{name:'viewer'},update:{},create:{name:'viewer'}});
 const perms=await db.permission.findMany({where:{code:{in:codes}}});
 for(const permission of perms)await db.rolePermission.upsert({where:{roleId_permissionId:{roleId:admin.id,permissionId:permission.id}},update:{},create:{roleId:admin.id,permissionId:permission.id}});
 const email=process.env.ADMIN_EMAIL?.trim().toLowerCase();
 const password=process.env.ADMIN_PASSWORD;
 if(email && password){
  if(password.length<12)throw new Error('ADMIN_PASSWORD must be at least 12 chars');
  const user=await db.user.upsert({where:{email},update:{},create:{email,name:'Administrator',passwordHash:await bcrypt.hash(password,12)}});
  await db.userRole.upsert({where:{userId_roleId:{userId:user.id,roleId:admin.id}},update:{},create:{userId:user.id,roleId:admin.id}});
  console.log('Administrator ready:',email);
 }else console.log('Set ADMIN_EMAIL and ADMIN_PASSWORD to bootstrap administrator');
 console.log('Viewer role:',viewer.name);
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>db.$disconnect());
