import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, AppointmentDecisionDto, RescheduleAppointmentDto } from './appointment.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser, AuthUser } from '../common/current-user.decorator';
@Controller('appointments')
export class AppointmentsController {
  constructor(private service: AppointmentsService) {}
  @Post() create(@Body() dto: CreateAppointmentDto) { return this.service.create(dto); }
  @Get() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('STAFF', 'ADMIN') list(@Query('status') status?: AppointmentStatus) {
    if (status && !Object.values(AppointmentStatus).includes(status)) throw new BadRequestException('Invalid appointment status');
    return this.service.list(status);
  }
  @Post(':id/approve') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') approve(@Param('id') id: string, @Body() dto: AppointmentDecisionDto, @CurrentUser() user: AuthUser) { return this.service.approve(id, dto, user.sub); }
  @Post(':id/reject') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') reject(@Param('id') id: string, @Body() dto: AppointmentDecisionDto, @CurrentUser() user: AuthUser) { return this.service.reject(id, dto, user.sub); }
  @Post(':id/reschedule') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') reschedule(@Param('id') id: string, @Body() dto: RescheduleAppointmentDto, @CurrentUser() user: AuthUser) { return this.service.reschedule(id, dto, user.sub); }
}
