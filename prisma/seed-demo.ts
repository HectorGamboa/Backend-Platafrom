import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
// 30-second excerpt from Blender Foundation's Big Buck Bunny (CC BY 3.0).
// Credit is mandatory; see https://peach.blender.org/about/.
// Development demo only. Does not include live television or commercial catalog.
const playbackUrl='https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4';
const licenseReference='https://peach.blender.org/about/ (CC BY 3.0; Blender Foundation)';
const validFrom=new Date('2020-01-01T00:00:00.000Z');
const validUntil=new Date('2099-01-01T00:00:00.000Z');
const fixtures=[
 {kind:'movie',contentId:'veyra-demo-bbb'},
 {kind:'tv',contentId:'veyra-demo-series'},
 {kind:'episode',contentId:'veyra-demo-series:1:1'},
] as const;

async function run(){
 if(process.env.NODE_ENV==='production')throw new Error('Demo seed is disabled in production');
 for(const fixture of fixtures){
  const existing=await db.licensedSource.findFirst({where:{kind:fixture.kind,contentId:fixture.contentId,territory:'MX'}});
  if(existing){console.log('Demo source already exists:',fixture.contentId);continue;}
  await db.licensedSource.create({data:{
   kind:fixture.kind,contentId:fixture.contentId,playbackUrl,
   rightsHolder:'Blender Foundation / www.bigbuckbunny.org',
   licenseReference,territory:'MX',allowedCommercialUse:true,
   validFrom,validUntil,isActive:true,
  }});
  console.log('Created demo source:',fixture.contentId);
 }
 console.log('Big Buck Bunny (c) copyright 2008 Blender Foundation / www.bigbuckbunny.org; CC BY 3.0.');
 console.log('Test fixture only: same short clip used as movie and episode.');
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>db.$disconnect());
