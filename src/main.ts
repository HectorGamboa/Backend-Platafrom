import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule,DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
async function main(){
 if(!process.env.JWT_SECRET || process.env.JWT_SECRET.length<32)throw new Error('JWT_SECRET must have at least 32 characters');
 const app=await NestFactory.create(AppModule);
 app.use(helmet());
 app.enableCors({origin:(process.env.CORS_ORIGINS||'http://localhost:4200').split(',')});
 app.setGlobalPrefix('api/v1');
 app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
 app.useGlobalFilters(new HttpExceptionFilter());
 SwaggerModule.setup('docs',app,SwaggerModule.createDocument(app,new DocumentBuilder().setTitle('Veyra API').setVersion('1').addBearerAuth().build()));
 await app.listen(Number(process.env.PORT||3000));
}
void main();
