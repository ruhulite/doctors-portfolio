import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 16) throw new Error('Set ADMIN_EMAIL and a strong ADMIN_PASSWORD (at least 16 characters) before seeding.');
  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: { name: process.env.ADMIN_NAME ?? 'System Administrator', email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: Role.SUPER_ADMIN },
  });
  const popular = await prisma.chamber.upsert({
    where: { id: 'popular-dhanmondi' }, update: {},
    create: { id: 'popular-dhanmondi', name: 'Popular Hospital', branch: 'Dhanmondi Branch', address: 'House #16, Bir Uttam M A Rab Sarak, Dhaka 1205', phone: '09666787801' },
  });
  const ibn = await prisma.chamber.upsert({
    where: { id: 'ibn-sina-dhanmondi' }, update: {},
    create: { id: 'ibn-sina-dhanmondi', name: 'IBN Sina Hospital', branch: 'Dhanmondi Branch', address: null, phone: null },
  });
  const visitingDays = [0, 1, 2, 3, 6]; // Sunday, Monday, Tuesday, Wednesday, Saturday
  for (const dayOfWeek of visitingDays) {
    await prisma.schedule.upsert({
      where: { chamberId_dayOfWeek: { chamberId: popular.id, dayOfWeek } },
      update: {}, create: { chamberId: popular.id, dayOfWeek, startTime: '19:00', endTime: '21:30', slotDurationMinutes: 15 },
    });
    await prisma.schedule.upsert({
      where: { chamberId_dayOfWeek: { chamberId: ibn.id, dayOfWeek } },
      update: {}, create: { chamberId: ibn.id, dayOfWeek, startTime: '12:30', endTime: '18:30', slotDurationMinutes: 15 },
    });
  }
  console.log('Seed complete. Change the initial administrator password after first login.');
}
main().finally(() => prisma.$disconnect());
