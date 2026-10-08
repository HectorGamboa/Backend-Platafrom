import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
const db=new PrismaClient();
const source='https://iptv-org.github.io/iptv/countries/mx.m3u';
function attr(line:string,key:string){const m=new RegExp(key+'="([^"]*)"','i').exec(line);return m?.[1]||'';}
async function main(){
 if(process.env.NODE_ENV==='production')throw new Error('Development-only channel import');
 if(process.env.IMPORT_PUBLIC_IPTV_DEMO!=='true')throw new Error('Explicitly set IMPORT_PUBLIC_IPTV_DEMO=true');
 const response=await fetch(source,{signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error('Playlist HTTP '+response.status);
 const body=await response.text();let info='';const channels:{name:string,url:string}[]=[];
 for(const raw of body.split(/\r?\n/)){
  const line=raw.trim();
  if(line.startsWith('#EXTINF:'))info=line;
  else if(info&&/^https:\/\//.test(line)){
   const name=(info.split(',').slice(1).join(',').trim()||attr(info,'tvg-name')).slice(0,120);
   if(name)channels.push({name,url:line});info='';
  }else if(line&&!line.startsWith('#'))info='';
 }
 const limit=Math.min(50,Math.max(1,Number(process.env.IMPORT_PUBLIC_IPTV_LIMIT||'15')));
 let created=0,skipped=0;
 for(const item of channels.slice(0,limit)){
  const contentId='Public TV: '+item.name;
  const duplicate=await db.licensedSource.findFirst({where:{kind:'channel',contentId,territory:'MX'}});
  if(duplicate){skipped++;continue;}
  await db.licensedSource.create({data:{kind:'channel',contentId,playbackUrl:item.url,
   territory:'MX',rightsHolder:'Public playlist entry — rights not verified',
   licenseReference:source,allowedCommercialUse:false,
   validFrom:new Date('2020-01-01'),validUntil:new Date('2099-01-01'),isActive:false}});
  created++;
 }
 console.log({playlistEntries:channels.length,created,skipped,activated:0});
 console.log('Sources remain INACTIVE and noncommercial until you verify redistribution permission.');
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>db.$disconnect());
