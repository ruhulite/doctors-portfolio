-- Remove old appointment system tables.
-- Foreign-key dependencies are handled by CASCADE.
DROP TABLE IF EXISTS "Appointment" CASCADE;
DROP TABLE IF EXISTS "Schedule" CASCADE;
DROP TABLE IF EXISTS "Chamber" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Remove the old appointment status enum.
DROP TYPE IF EXISTS "AppointmentStatus";

-- Recreate Role without the obsolete STAFF value.
-- AdminUser will use the new two-role enum.
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- Create CMS admin users.
CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role_new" NOT NULL DEFAULT 'ADMIN',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_email_key"
  ON "AdminUser"("email");

-- Landing page sections.
CREATE TABLE "LandingSection" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "draftContent" JSONB NOT NULL,
  "publishedContent" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LandingSection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LandingSection_key_key"
  ON "LandingSection"("key");

-- Educational and awareness videos.
CREATE TYPE "VideoSource" AS ENUM ('UPLOAD', 'YOUTUBE');
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE "Video" (
  "id" TEXT NOT NULL,
  "source" "VideoSource" NOT NULL,
  "titleBn" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "descriptionBn" TEXT NOT NULL DEFAULT '',
  "descriptionEn" TEXT NOT NULL DEFAULT '',
  "categoryBn" TEXT NOT NULL DEFAULT 'স্বাস্থ্য সচেতনতা',
  "categoryEn" TEXT NOT NULL DEFAULT 'Health Awareness',
  "mediaUrl" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "captionsUrl" TEXT,
  "durationSeconds" INTEGER NOT NULL,
  "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- General site settings.
CREATE TABLE "SiteSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SiteSetting_key_key"
  ON "SiteSetting"("key");

-- Replace the old Role enum after the old User table is removed.
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";