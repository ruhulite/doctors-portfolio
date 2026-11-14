# Kafi Doctor Portfolio API

NestJS + Prisma + PostgreSQL CMS API. Appointment modules are intentionally absent.

## Local setup
1. `cp .env.example .env` and set a strong `JWT_SECRET`, database credentials, and first Super Admin credentials (password minimum 12 chars).
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate dev --name initial_cms`
5. `npm run db:seed`
6. `npm run start:dev`

API listens on `http://localhost:4000`; frontend API base is `http://localhost:4000/api`.

## Video uploads
Server uploads are stored in `uploads/`. Set `MAX_UPLOAD_MB` only after checking your Hostinger account's request/body limits and available disk space. Uploads remain disabled until this is configured. `ffprobe-static` inspects uploaded media duration. Files longer than 180 seconds are rejected. For YouTube entries, set `YOUTUBE_API_KEY`; the API verifies the duration using YouTube Data API before saving. YouTube videos over 180 seconds are rejected. Uploaded video and thumbnail URLs are served under `/uploads/`.

## Production
Use `npx prisma migrate deploy`, `npx prisma generate`, then `npm run build` and `npm run start:prod`. Set `FRONTEND_ORIGIN` to the exact public frontend origin. Keep `.env` out of Git. Back up PostgreSQL and uploads independently. A persistent volume is required for server-uploaded files on hosts with ephemeral filesystems.

## Notes
- The first Super Admin is created by the seed script; Admin accounts are created from the protected Super Admin user-management API. A UI for user administration can be added to the CMS panel.
- `publishedContent` is the public version; edits update `draftContent` only until the publish endpoint is called.
- The `admin/preview/landing` endpoint returns draft content to authenticated administrators.
- Video duration maximum is 180 seconds (3 minutes).
