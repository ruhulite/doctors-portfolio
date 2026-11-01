import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { RolesGuard } from '../common/roles.guard';
@Module({ controllers: [AppointmentsController], providers: [AppointmentsService, RolesGuard] })
export class AppointmentsModule {}
