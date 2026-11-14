import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthGuard, SuperAdminGuard } from './auth';
@Module({controllers:[AppController],providers:[PrismaService,AuthGuard,SuperAdminGuard]}) export class AppModule{}
