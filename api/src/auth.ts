import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from './prisma.service';
import { Request } from 'express';
export type AuthRequest = Request & { user?: { id:string; email:string; role:'SUPER_ADMIN'|'ADMIN'; name:string } };
@Injectable() export class AuthGuard implements CanActivate { constructor(private prisma:PrismaService){} async canActivate(ctx:ExecutionContext){const req=ctx.switchToHttp().getRequest<AuthRequest>();const raw=req.headers['authorization'];if(!raw?.startsWith('Bearer '))throw new UnauthorizedException('Authentication required');try{const payload=jwt.verify(raw.slice(7),process.env.JWT_SECRET||'') as any;const user=await this.prisma.adminUser.findUnique({where:{id:payload.sub}});if(!user||!user.active)throw new Error('inactive');req.user={id:user.id,email:user.email,role:user.role,name:user.name};return true}catch{throw new UnauthorizedException('Invalid or expired session')}}}
@Injectable() export class SuperAdminGuard implements CanActivate {canActivate(ctx:ExecutionContext){const req=ctx.switchToHttp().getRequest<AuthRequest>();if(req.user?.role!=='SUPER_ADMIN')throw new ForbiddenException('Super Admin permission required');return true}}
