CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN');
CREATE TYPE "VideoSource" AS ENUM ('UPLOAD', 'YOUTUBE');
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'ADMIN',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

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
CREATE UNIQUE INDEX "LandingSection_key_key" ON "LandingSection"("key");

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

CREATE TABLE "SiteSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");
