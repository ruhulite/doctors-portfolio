# Doctor Portfolio & Health Education CMS

Bangla-first bilingual single-page portfolio and content management system for Professor Dr. Muhammad Abdullahel Kafi.

## Product scope
- One public landing page only.
- Appointment/booking functionality has been removed from the frontend routes and backend modules.
- Dynamic public sections are loaded from the NestJS API and managed through the admin panel.
- Admin roles: `SUPER_ADMIN` and `ADMIN`. Only Super Admin can create administrator accounts.
- Content is edited as Bangla/English JSON per section, saved as a draft, visually previewed on the public layout, and published separately.
- Separate video management panel supports server uploads and YouTube links.
- Videos longer than 180 seconds (3 minutes) are rejected by the API.
- Uploaded videos can include an optional WebVTT caption file.
- Bangla is the default language; English is available via the language switcher.
- SEO metadata is editable through the SEO content section; canonical, Open Graph and Physician JSON-LD are added by the public page.
- Accessibility foundations include semantic landmarks, skip link, visible keyboard focus, accessible controls/labels, reduced-motion support and caption-track support for uploaded videos.

## Structure
- Root: React + Vite + TypeScript frontend.
- `api/`: NestJS REST API.
- `api/prisma/`: PostgreSQL schema and initial migration.

## Local setup
1. Start PostgreSQL (`docker compose up -d`) or use a PostgreSQL provider.
2. In `api/`, copy `.env.example` to `.env` and configure `DATABASE_URL`, a `JWT_SECRET` of at least 32 characters, and first Super Admin credentials. Set `MAX_UPLOAD_MB` only after deciding a safe local upload cap.
3. In `api/`, run `npm install`, `npx prisma generate`, `npx prisma migrate dev`, `npm run db:seed`, and `npm run start:dev`.
4. In the repository root, copy `.env.example` to `.env.local`, set `VITE_API_URL=http://localhost:4000/api`, run `npm install`, then `npm run dev`.
5. Configure `YOUTUBE_API_KEY` to enable YouTube duration verification. Without it, YouTube video creation is rejected rather than trusting a manually supplied duration.

## First login
The seed command creates the first Super Admin from `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Password must be at least 12 characters. Keep the credentials private and change them after initial access.

## Deployment
See [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) for the two-app Hostinger deployment, PostgreSQL connection, and the upload-limit verification requirement.

## Content editor
The Landing Content tab edits each section's JSON document. Keep the field names such as `headingBn`, `headingEn`, `bodyBn`, `bodyEn`, `items`, `imageUrl`, `phone`, and `addressBn`/`addressEn`. Use Save Draft, then Preview Draft, then Publish. SEO, Branding and Video Section are editable content records and are rendered as configuration rather than visible standalone sections.

## Video uploads
Server-uploaded media is saved under `api/uploads` and served from `/uploads/`. Uploaded media duration is inspected using `ffprobe-static`; YouTube duration is checked through YouTube Data API. The maximum is 180 seconds. Configure storage limits and persistent backups before enabling server uploads.
