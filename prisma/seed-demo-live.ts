import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
const db=new PrismaClient();
async function run(){
 if(process.env.NODE_ENV==='production')throw new Error('Local live demo cannot be seeded in production');
 if(process.env.VEYRA_LOCAL_LIVE_DEMO!=='true')throw new Error('Set VEYRA_LOCAL_LIVE_DEMO=true explicitly');
 const base=(process.env.XTREAM_PUBLIC_URL||'http://localhost:3000').replace(/\/$/,'');
 const origin=new URL(base);
 if(!['http:','https:'].includes(origin.protocol))throw new Error('Invalid public URL');
 const url=new URL('/local-live-demo/live.m3u8',origin).toString();
 const contentId='Veyra Canal Demo HLS (bucle)';
 const current=await db.licensedSource.findFirst({where:{contentId,kind:'channel',territory:'MX'}});
 if(current){await db.licensedSource.update({where:{id:current.id},data:{playbackUrl:url,isActive:true}});}
 else{await db.licensedSource.create({data:{contentId,kind:'channel',territory:'MX',playbackUrl:url,
 rightsHolder:'Blender Foundation',licenseReference:'Big Buck Bunny CC BY 3.0: https://peach.blender.org/about/',
 allowedCommercialUse:true,isActive:true,validFrom:new Date('2020-01-01'),validUntil:new Date('2099-01-01')}});}
 console.log('Local demo channel saved:',url);
 console.log('Run FFmpeg from docs/local-live-test.md to actually generate the HLS stream.');
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>db.$disconnect());
