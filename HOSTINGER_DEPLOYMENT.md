# Hostinger Business deployment notes

This repository is a monorepo with two Node.js applications:

## Frontend application
- Framework: Vite
- Root directory: `/` (repository root)
- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to the HTTPS API base URL, including `/api` (for example `https://api.your-domain.tld/api`).

## Backend application
- Framework: NestJS
- Root directory: `/api`
- Build command: `npm ci && npx prisma generate && npm run build`
- Start command: `npm run start:prod`
- Set `DATABASE_URL`, `JWT_SECRET` (at least 32 characters), `FRONTEND_ORIGIN`, `YOUTUBE_API_KEY`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `UPLOAD_DIR`, and `MAX_UPLOAD_MB` as appropriate.
- Run `npx prisma migrate deploy` and `npm run db:seed` once after setting the production environment. Keep a secure record of the initial Super Admin credentials and change the password after first sign-in.

## PostgreSQL
Hostinger Business managed Node.js hosting should not be assumed to provide PostgreSQL. Use an external managed PostgreSQL service, or choose a VPS where you administer PostgreSQL yourself. Keep the database reachable from the Hostinger Node.js application and use TLS/SSL if required by the provider.

## Server-side video uploads: do not guess the limit
The app enforces a configurable maximum duration of 180 seconds. It uses `ffprobe-static` to inspect uploaded file duration and YouTube Data API to verify YouTube duration. `MAX_UPLOAD_MB` is deliberately blank in `.env.example`; server uploads remain disabled until you verify the actual Hostinger request-size limit, persistent storage availability, disk capacity and bandwidth for your account, then set an application cap below the verified platform limit.

Hostinger's current Node.js limits documentation states a 120-second request timeout for web/cloud Node.js apps. Its public documentation does not state a specific Node.js multipart upload-size limit for the Business plan. Therefore, do not infer a supported upload size from PHP upload limits. A three-minute video may still be too large or take too long to upload depending on encoding and network conditions. Test a small file first and confirm the limit in hPanel or with Hostinger support before enabling uploads. If your chosen cap cannot reliably support your intended videos, the current server-upload requirement may need a different hosting/storage arrangement.

Hostinger also documents that Business/Unlimited hosting supports up to five Node.js websites, and its current plan limits page lists 50 GB disk and 1.5 GB RAM for Business; plan versions and account-specific entitlements can differ. Check the values shown in your own hPanel before deployment.

## Persistent files and backups
The `api/uploads` directory stores uploaded videos, thumbnails and WebVTT captions. Confirm that this directory persists across deployments and that backups include it. Back up the PostgreSQL database and uploaded media separately. Do not rely on the Git repository as media storage.

## SEO launch tasks
- Replace `example.com` in `public/sitemap.xml` with the verified production domain.
- Update the canonical URL and sitemap after the domain is connected.
- Submit the sitemap in the relevant search-engine webmaster tools.
- Verify the rendered metadata and JSON-LD on the deployed page.
- Confirm that the page is publicly crawlable and that admin routes are not indexed.

## Important verification
The project archive was prepared from the available source files, but dependency installation/build verification could not be completed in this environment because the package registry was unavailable. Run the install and build commands locally or in Hostinger's build environment before production. Review the deployment logs and test login, draft preview, publish, upload, YouTube duration validation, and database migrations before launch.
