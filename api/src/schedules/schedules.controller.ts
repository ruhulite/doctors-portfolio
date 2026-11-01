import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Put, Query, UseGuards } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UpsertScheduleDto } from './schedules.dto';

@Controller('chambers/:chamberId')
export class SchedulesController {
  constructor(private prisma: PrismaService) {}

  @Get('schedules')
  list(@Param('chamberId') chamberId: string) {
    return this.prisma.schedule.findMany({ where: { chamberId, active: true }, orderBy: { dayOfWeek: 'asc' } });
  }

  @Get('slots')
  async availableSlots(@Param('chamberId') chamberId: string, @Query('date') date: string) {
    const day = DateTime.fromISO(date ?? '', { zone: 'Asia/Dhaka' });
    if (!day.isValid || day.toFormat('yyyy-MM-dd') !== date) throw new BadRequestException('date must use YYYY-MM-DD');
    if (day.startOf('day') < DateTime.now().setZone('Asia/Dhaka').startOf('day')) throw new BadRequestException('Date must not be in the past');
    const chamber = await this.prisma.chamber.findFirst({ where: { id: chamberId, active: true } });
    if (!chamber) throw new NotFoundException('Chamber not found');
    const schedule = await this.prisma.schedule.findFirst({ where: { chamberId, dayOfWeek: day.weekday % 7, active: true } });
    if (!schedule) return { date, timeZone: 'Asia/Dhaka', slots: [] };
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
    const opening = startHour * 60 + startMinute;
    const closing = endHour * 60 + endMinute;
    const duration = schedule.slotDurationMinutes;
    const from = day.startOf('day').toUTC().toJSDate();
    const to = day.plus({ days: 1 }).startOf('day').toUTC().toJSDate();
    const bookings = await this.prisma.appointment.findMany({
      where: { chamberId, status: { in: ['PENDING', 'APPROVED'] }, startsAt: { lt: to }, endsAt: { gt: from } },
      select: { startsAt: true, endsAt: true },
    });
    const slots: Array<{ startsAt: string; endsAt: string }> = [];
    for (let minute = opening; minute + duration <= closing; minute += duration) {
      const localStart = day.startOf('day').plus({ minutes: minute });
      const localEnd = localStart.plus({ minutes: duration });
      if (localStart <= DateTime.now().setZone('Asia/Dhaka')) continue;
      const start = localStart.toUTC().toMillis();
      const end = localEnd.toUTC().toMillis();
      const occupied = bookings.some(b => b.startsAt.getTime() < end && b.endsAt.getTime() > start);
      if (!occupied) slots.push({ startsAt: localStart.toISO({ suppressMilliseconds: true })!, endsAt: localEnd.toISO({ suppressMilliseconds: true })! });
    }
    return { date, timeZone: 'Asia/Dhaka', slotDurationMinutes: duration, slots };
  }

  @Put('schedules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async upsert(@Param('chamberId') chamberId: string, @Body() dto: UpsertScheduleDto) {
    if (dto.endTime <= dto.startTime) throw new BadRequestException('End time must be later than start time');
    const chamber = await this.prisma.chamber.findUnique({ where: { id: chamberId } });
    if (!chamber) throw new NotFoundException('Chamber not found');
    const bookings = await this.prisma.appointment.findMany({ where: { chamberId, status: { in: ['PENDING', 'APPROVED'] }, startsAt: { gte: new Date() } }, select: { startsAt: true, endsAt: true } });
    const startMinute = Number(dto.startTime.slice(0, 2)) * 60 + Number(dto.startTime.slice(3));
    const endMinute = Number(dto.endTime.slice(0, 2)) * 60 + Number(dto.endTime.slice(3));
    const conflicts = bookings.some(booking => {
      const local = DateTime.fromJSDate(booking.startsAt, { zone: 'utc' }).setZone('Asia/Dhaka');
      if (local.weekday % 7 !== dto.dayOfWeek) return false;
      const minute = local.hour * 60 + local.minute;
      return dto.active === false || minute < startMinute || minute + dto.slotDurationMinutes > endMinute || (minute - startMinute) % dto.slotDurationMinutes !== 0;
    });
    if (conflicts) throw new BadRequestException('This schedule change conflicts with existing pending or approved appointments. Reschedule those appointments first.');
    return this.prisma.schedule.upsert({ where: { chamberId_dayOfWeek: { chamberId, dayOfWeek: dto.dayOfWeek } }, create: { chamberId, ...dto }, update: dto });
  }
}
