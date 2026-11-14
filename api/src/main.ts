import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
async function bootstrap(){if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('JWT_SECRET must be configured with at least 32 characters');const app=await NestFactory.create<NestExpressApplication>(AppModule);app.setGlobalPrefix('');app.enableCors({origin:(process.env.FRONTEND_ORIGIN||'http://localhost:5173').split(',').map(x=>x.trim()),credentials:true});app.useGlobalPipes(new ValidationPipe({whitelist:true,transform:true}));await mkdir(join(process.cwd(),process.env.UPLOAD_DIR||'uploads'),{recursive:true});app.useStaticAssets(join(process.cwd(),process.env.UPLOAD_DIR||'uploads'),{prefix:'/uploads/'});const port=Number(process.env.PORT||4000);await app.listen(port,'0.0.0.0');}
bootstrap();
