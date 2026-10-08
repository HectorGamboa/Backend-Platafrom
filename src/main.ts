import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule,DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import {join} from 'path';
import {mkdirSync} from 'fs';
import {static as serveStatic} from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
async function main(){
 if(!process.env.JWT_SECRET || process.env.JWT_SECRET.length<32)throw new Error('JWT_SECRET must have at least 32 characters');
 const app=await NestFactory.create(AppModule,{rawBody:true});
 app.use(helmet());
 if(process.env.NODE_ENV!=='production'&&process.env.VEYRA_LOCAL_LIVE_DEMO==='true'){
  const output=join(process.cwd(),'tmp','live-demo');
  mkdirSync(output,{recursive:true});
  app.use('/local-live-demo',serveStatic(output,{setHeaders:(res)=>{res.setHeader('Cache-Control','no-store');}}));
 }
 app.enableCors({origin:(process.env.CORS_ORIGINS||'http://localhost:4200').split(',').map(x=>x.trim())});
 app.setGlobalPrefix('api/v1',{exclude:['player_api.php','get.php','live/:username/:password/:file','movie/:username/:password/:file','series/:username/:password/:file']});
 app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
 app.useGlobalFilters(new HttpExceptionFilter());
 SwaggerModule.setup('docs',app,SwaggerModule.createDocument(app,new DocumentBuilder().setTitle('Veyra API').setVersion('1').addBearerAuth().build()));
 await app.listen(Number(process.env.PORT||3000));
}
void main();
