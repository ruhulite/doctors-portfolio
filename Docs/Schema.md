# Database Schema
## Proposed Prisma/PostgreSQL Data Model

**Version:** 1.0  
**Important:** This is a proposed target schema. Compare it with the current `schema.prisma` and existing data before applying migrations. Do not run destructive migrations without a verified backup.

## 1. Design principles

- Store structured content and metadata in PostgreSQL.
- Store uploaded video/image binaries on configured filesystem storage, not in PostgreSQL.
- Store Bangla and English values explicitly.
- Keep draft content separate from public published content.
- Use explicit video source types: `UPLOAD` and `YOUTUBE`.
- Enforce role checks in the backend.
- Do not include appointment models.

## 2. Suggested enums

```prisma
enum Role {
  SUPER_ADMIN
  ADMIN
}

enum PublishStatus {
  DRAFT
  IN_REVIEW
  PUBLISHED
  ARCHIVED
}

enum VideoSource {
  UPLOAD
  YOUTUBE
}

enum MediaKind {
  IMAGE
  VIDEO
  THUMBNAIL
  DOCUMENT
}
```

## 3. Core models (illustrative)

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(ADMIN)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  updatedContent ContentVersion[] @relation("ContentEditor")
  publishedContent ContentVersion[] @relation("ContentPublisher")
  auditLogs    AuditLog[]
}

model ContentSection {
  id        String   @id @default(cuid())
  key       String   @unique
  isEnabled Boolean  @default(true)
  sortOrder Int      @default(0)
  versions  ContentVersion[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ContentVersion {
  id             String        @id @default(cuid())
  sectionId      String
  section        ContentSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  status         PublishStatus @default(DRAFT)
  content        Json
  locale         String
  version        Int           @default(1)
  createdById    String
  createdBy      User          @relation("ContentEditor", fields: [createdById], references: [id])
  publishedById  String?
  publishedBy    User?         @relation("ContentPublisher", fields: [publishedById], references: [id])
  publishedAt    DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@unique([sectionId, locale, version])
  @@index([sectionId, locale, status])
}

model VideoCategory {
  id        String   @id @default(cuid())
  nameBn    String
  nameEn    String
  slug      String   @unique
  videos    Video[]
  sortOrder Int      @default(0)
}

model Video {
  id               String       @id @default(cuid())
  source           VideoSource
  status           PublishStatus @default(DRAFT)
  titleBn          String
  titleEn          String
  descriptionBn    String       @default("")
  descriptionEn    String       @default("")
  categoryId       String?
  category         VideoCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  storageKey       String?
  youtubeVideoId   String?
  thumbnailKey     String?
  durationSeconds  Int?
  isDurationVerified Boolean    @default(false)
  isFeatured       Boolean      @default(false)
  sortOrder        Int          @default(0)
  createdById      String
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  publishedAt      DateTime?

  @@index([status, sortOrder])
  @@index([source])
}

model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  action     String
  entityType String
  entityId   String?
  metadata   Json?
  createdAt  DateTime @default(now())

  @@index([userId, createdAt])
  @@index([entityType, entityId])
}
```

## 4. Schema notes and required refinements

- Add explicit relations and indexes after validating the final Prisma schema.
- Consider a dedicated `MediaAsset` model for file metadata, checksum, MIME type, byte size, storage key, dimensions and upload ownership.
- Add a stable `publishedVersionId` or publication pointer per section so the public API can retrieve one active version without ambiguity.
- Consider a dedicated SEO model or JSON metadata attached to content versions.
- Ensure video duration is validated by backend logic and, where practical, a database check constraint. A database check should enforce `durationSeconds IS NULL OR durationSeconds <= 180`.
- Ensure `UPLOAD` videos require `storageKey` and `YOUTUBE` videos require `youtubeVideoId`; enforce in service validation and optionally DB constraints.
- Add category management only if the product owner confirms categories are editable by admins.
- Add Admin publishing permissions only after the approval policy is confirmed.
- No appointment, patient or booking model should be present.

## 5. Data migration and removal

Before removing old appointment tables:
1. Back up the production database.
2. Search code for appointment references.
3. Identify foreign keys, enums, seeds and audit dependencies.
4. Confirm appointment data is not required for legal/operational retention.
5. Remove application routes/services/UI and then schema objects in a controlled migration.
6. Test migration on a database copy.
7. Verify no appointment code remains in build output or navigation.

## 6. Data integrity rules

- Unique user email.
- Unique section key.
- Unique category slug.
- Uploaded storage keys must be unique.
- Video duration must be at most 180 seconds to publish.
- YouTube video must have verified duration before publication.
- Only published versions are publicly readable.
- Deleting a media asset must not leave a published content reference broken.
