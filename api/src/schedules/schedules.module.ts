import { Module } from '@nestjs/common';
import { SchedulesController } from './schedules.controller';
import { RolesGuard } from '../common/roles.guard';
@Module({ controllers: [SchedulesController], providers: [RolesGuard] })
export class SchedulesModule {}
