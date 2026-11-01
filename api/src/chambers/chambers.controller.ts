import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
class CreateChamberDto {
  @IsString() @MinLength(2) name!: string;
  @IsString() @MinLength(2) branch!: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() phone?: string;
}
@Controller('chambers')
export class ChambersController {
  constructor(private prisma: PrismaService) {}
  @Get() list() { return this.prisma.chamber.findMany({ where: { active: true }, orderBy: { name: 'asc' } }); }
  @Post() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') create(@Body() dto: CreateChamberDto) { return this.prisma.chamber.create({ data: dto }); }
}
