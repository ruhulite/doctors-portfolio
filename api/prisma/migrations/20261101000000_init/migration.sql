CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TABLE "User" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL, "role" "Role" NOT NULL DEFAULT 'STAFF',
  "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "Chamber" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "branch" TEXT NOT NULL, "address" TEXT,
  "phone" TEXT, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Chamber_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Schedule" (
  "id" TEXT NOT NULL, "chamberId" TEXT NOT NULL, "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL, "endTime" TEXT NOT NULL, "slotDurationMinutes" INTEGER NOT NULL DEFAULT 15,
  "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Schedule_dayOfWeek_check" CHECK ("dayOfWeek" BETWEEN 0 AND 6),
  CONSTRAINT "Schedule_slotDuration_check" CHECK ("slotDurationMinutes" BETWEEN 5 AND 240)
);
CREATE UNIQUE INDEX "Schedule_chamberId_dayOfWeek_key" ON "Schedule"("chamberId", "dayOfWeek");
CREATE INDEX "Schedule_chamberId_active_idx" ON "Schedule"("chamberId", "active");
CREATE TABLE "Appointment" (
  "id" TEXT NOT NULL, "chamberId" TEXT NOT NULL, "patientName" TEXT NOT NULL,
  "patientPhone" TEXT NOT NULL, "patientEmail" TEXT, "note" VARCHAR(1000),
  "startsAt" TIMESTAMPTZ(3) NOT NULL, "endsAt" TIMESTAMPTZ(3) NOT NULL,
  "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING', "adminNote" VARCHAR(1000),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  "reviewedById" TEXT, "reviewedAt" TIMESTAMP(3),
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Appointment_time_check" CHECK ("endsAt" > "startsAt")
);
CREATE INDEX "Appointment_chamberId_startsAt_idx" ON "Appointment"("chamberId", "startsAt");
CREATE INDEX "Appointment_status_startsAt_idx" ON "Appointment"("status", "startsAt");
-- Database-enforced protection against overlapping active bookings in the same chamber.
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_no_overlapping_active_slots"
  EXCLUDE USING gist ("chamberId" WITH =, tstzrange("startsAt", "endsAt", '[)') WITH &&)
  WHERE ("status" IN ('PENDING', 'APPROVED'));
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL, "entityId" TEXT NOT NULL, "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_chamberId_fkey" FOREIGN KEY ("chamberId") REFERENCES "Chamber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_chamberId_fkey" FOREIGN KEY ("chamberId") REFERENCES "Chamber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
