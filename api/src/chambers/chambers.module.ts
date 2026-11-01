import { Module } from '@nestjs/common';
import { ChambersController } from './chambers.controller';
import { RolesGuard } from '../common/roles.guard';
@Module({ controllers: [ChambersController], providers: [RolesGuard] })
export class ChambersModule {}
