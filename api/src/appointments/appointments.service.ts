import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, AppointmentDecisionDto, RescheduleAppointmentDto } from './appointment.dto';

const ZONE = 'Asia/Dhaka';
@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  private async validateSlot(tx: Prisma.TransactionClient, chamberId: string, startsAtInput: string) {
    const startUtc = DateTime.fromISO(startsAtInput, { setZone: true });
    if (!startUtc.isValid || startUtc <= DateTime.utc()) throw new BadRequestException('Choose a valid future appointment time');
    const local = startUtc.setZone(ZONE);
    const dayOfWeek = local.weekday % 7; // Luxon Monday=1 ... Sunday=7; database Sunday=0
    const schedule = await tx.schedule.findFirst({ where: { chamberId, dayOfWeek, active: true } });
    if (!schedule) throw new BadRequestException('The chamber is not available on this day');
    const startMinute = local.hour * 60 + local.minute;
    const [sh, sm] = schedule.startTime.split(':').map(Number);
    const [eh, em] = schedule.endTime.split(':').map(Number);
    const openMinute = sh * 60 + sm;
    const closeMinute = eh * 60 + em;
    const duration = schedule.slotDurationMinutes;
    if (local.second !== 0 || local.millisecond !== 0 || startMinute < openMinute || startMinute + duration > closeMinute || (startMinute - openMinute) % duration !== 0) {
      throw new BadRequestException('Choose one of the available appointment slots');
    }
    const endUtc = startUtc.plus({ minutes: duration }).toUTC();
    return { startsAt: startUtc.toUTC().toJSDate(), endsAt: endUtc.toJSDate() };
  }

  async create(dto: CreateAppointmentDto) {
    try {
      return await this.prisma.$transaction(async tx => {
        const chamber = await tx.chamber.findFirst({ where: { id: dto.chamberId, active: true } });
        if (!chamber) throw new NotFoundException('Chamber not found or inactive');
        const times = await this.validateSlot(tx, dto.chamberId, dto.startsAt);
        return tx.appointment.create({ data: { ...times, chamberId: dto.chamberId, patientName: dto.patientName.trim(), patientPhone: dto.patientPhone, patientEmail: dto.patientEmail?.toLowerCase(), note: dto.note } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) { this.rethrowBookingError(error); }
  }

  list(status?: AppointmentStatus) {
    return this.prisma.appointment.findMany({ where: status ? { status } : {}, include: { chamber: { select: { id: true, name: true, branch: true } } }, orderBy: { startsAt: 'asc' } });
  }

  async approve(id: string, dto: AppointmentDecisionDto, actorId: string) {
    return this.prisma.$transaction(async tx => {
      const appointment = await tx.appointment.findUnique({ where: { id } });
      if (!appointment) throw new NotFoundException('Appointment not found');
      if (appointment.status !== 'PENDING') throw new ConflictException('Only pending appointments can be approved');
      const updated = await tx.appointment.update({ where: { id }, data: { status: 'APPROVED', adminNote: dto.adminNote, reviewedById: actorId, reviewedAt: new Date() } });
      await tx.auditLog.create({ data: { userId: actorId, action: 'APPOINTMENT_APPROVED', entityType: 'Appointment', entityId: id } });
      return updated;
    });
  }

  async reject(id: string, dto: AppointmentDecisionDto, actorId: string) {
    return this.prisma.$transaction(async tx => {
      const appointment = await tx.appointment.findUnique({ where: { id } });
      if (!appointment) throw new NotFoundException('Appointment not found');
      if (appointment.status !== 'PENDING') throw new ConflictException('Only pending appointments can be rejected');
      const updated = await tx.appointment.update({ where: { id }, data: { status: 'REJECTED', adminNote: dto.adminNote, reviewedById: actorId, reviewedAt: new Date() } });
      await tx.auditLog.create({ data: { userId: actorId, action: 'APPOINTMENT_REJECTED', entityType: 'Appointment', entityId: id } });
      return updated;
    });
  }

  async reschedule(id: string, dto: RescheduleAppointmentDto, actorId: string) {
    try {
      return await this.prisma.$transaction(async tx => {
        const appointment = await tx.appointment.findUnique({ where: { id } });
        if (!appointment) throw new NotFoundException('Appointment not found');
        if (!['PENDING', 'APPROVED'].includes(appointment.status)) throw new ConflictException('This appointment cannot be rescheduled');
        const times = await this.validateSlot(tx, appointment.chamberId, dto.startsAt);
        const updated = await tx.appointment.update({ where: { id }, data: { ...times, status: 'PENDING', adminNote: dto.adminNote ?? 'Rescheduled; awaiting confirmation', reviewedById: actorId, reviewedAt: new Date() } });
        await tx.auditLog.create({ data: { userId: actorId, action: 'APPOINTMENT_RESCHEDULED', entityType: 'Appointment', entityId: id, metadata: { startsAt: times.startsAt.toISOString() } } });
        return updated;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) { this.rethrowBookingError(error); }
  }

  private rethrowBookingError(error: unknown): never {
    if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2004', 'P2034'].includes(error.code)) throw new ConflictException('That appointment time has just been taken. Please choose another slot.');
    const message = error instanceof Error ? error.message : '';
    if (/Appointment_no_overlapping_active_slots|exclusion constraint|conflicting key value/i.test(message)) throw new ConflictException('That appointment time overlaps another active booking. Please choose another slot.');
    throw error;
  }
}
