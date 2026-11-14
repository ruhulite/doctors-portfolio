# Technical Requirements Document (TRD)
## Doctor Portfolio & Health Education Website

**Version:** 1.0

## 1. Technology baseline

| Layer | Technology |
|---|---|
| Public frontend | React, Vite, TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router or existing project router |
| Localization | i18next / react-i18next or existing solution |
| Backend | NestJS REST API |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | Existing project strategy after audit; secure server-side authorization required |
| Media inspection | FFprobe or equivalent trusted metadata inspector |
| Uploaded media storage | Hostinger server filesystem, subject to verified limits |
| YouTube | YouTube URL validation and YouTube Data API for duration verification |
| Testing | Unit, integration, end-to-end, accessibility and security checks |

Do not upgrade or replace dependencies until the existing repository has been audited.

## 2. System boundaries

- Browser renders the public single-page site and admin application.
- NestJS exposes public read APIs and protected admin APIs.
- PostgreSQL stores structured content and metadata.
- Server filesystem stores uploaded media files; database stores metadata and storage identifiers.
- YouTube hosts YouTube videos; application stores validated video IDs and metadata.
- No appointment subsystem is in scope.

## 3. Suggested backend modules

- `auth`
- `users`
- `landing-content`
- `qualifications`
- `experience`
- `specializations`
- `chambers`
- `contact`
- `videos`
- `media`
- `seo`
- `settings`
- `audit`

The exact module boundaries should follow the current repository conventions.

## 4. API design (proposed)

### Public endpoints
- `GET /api/public/landing-page?locale=bn`
- `GET /api/public/videos?locale=bn`
- `GET /api/public/site-settings?locale=bn`

Only published records may be returned.

### Authentication/admin endpoints
- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET /api/admin/me`
- `GET /api/admin/content`
- `PUT /api/admin/content/:section`
- `POST /api/admin/content/:section/preview`
- `POST /api/admin/content/:section/publish`
- `POST /api/admin/content/:section/submit-review`

### Video endpoints
- `GET /api/admin/videos`
- `POST /api/admin/videos/upload`
- `POST /api/admin/videos/youtube`
- `PATCH /api/admin/videos/:id`
- `POST /api/admin/videos/:id/preview`
- `POST /api/admin/videos/:id/publish`
- `DELETE /api/admin/videos/:id`

These are proposed contracts, not claims about existing implemented routes.

## 5. Content publishing model

Use draft and published representations or versioned content records.

Required properties:
- Draft data is isolated from public API.
- Preview endpoint is protected.
- Publish operation is transactional.
- Public reads resolve only the active published version.
- Record creator, updater, publisher and timestamps.
- Preserve prior published version or audit history where practical.

## 6. Authentication and authorization

- Hash passwords with a modern password hashing algorithm (Argon2id or appropriately configured bcrypt).
- Enforce roles and permissions in NestJS guards/policies.
- Super Admin can manage Admin accounts.
- Admin cannot grant self additional privileges.
- Protect login with rate limiting and generic failure messages.
- Use secure, HTTP-only, SameSite cookies if cookie-based sessions are selected; configure CSRF protection as applicable.
- Never store secrets in frontend environment variables or Git.
- Audit sensitive administrative actions.

Admin publishing policy remains an open product decision. Until confirmed, default to Admin draft/preview and Super Admin publication.

## 7. Video upload processing

- Configure a maximum upload size only after Hostinger's actual plan/runtime constraints are verified.
- Use streaming or controlled multipart upload; avoid loading large files fully into memory.
- Store uploads outside the executable application source directory where hosting permits.
- Generate random storage names; preserve original filename only as metadata.
- Validate extension, declared MIME type and file signature.
- Inspect duration server-side using FFprobe or equivalent.
- Enforce `durationSeconds <= 180`.
- Reject malformed, unsupported or over-duration media.
- Consider malware scanning if available.
- Prevent path traversal and executable file serving.
- Clean temporary files on success/failure.
- Set safe response headers and appropriate content type.
- Confirm filesystem persistence across redeploys and backup behavior before relying on local server storage.

## 8. YouTube integration

- Accept only explicitly supported YouTube URL forms.
- Extract and store video ID, not arbitrary iframe HTML.
- Use YouTube Data API `videos.list` with `contentDetails` to verify duration.
- Parse ISO 8601 duration correctly.
- Reject duration over 180 seconds.
- If API key/quota/network verification fails, keep video unverified and unpublished.
- Render a controlled embed URL; do not inject admin-provided HTML.
- Respect YouTube branding and playback requirements.

## 9. SEO and rendering

- Evaluate prerendering or SSR for the public landing page; select based on project compatibility and hosting support.
- Generate metadata for current locale.
- Set canonical URL and language alternates where distinct crawlable locale URLs exist.
- Provide sitemap and robots rules.
- Use semantic HTML and structured data only for verified information.
- Optimize images and video thumbnails.
- Avoid indexing admin, preview and authentication routes.
- Do not place private or draft content in static build output.

## 10. Accessibility engineering

- Target WCAG 2.2 AA.
- Use semantic native controls where possible.
- Add automated checks (axe or equivalent) plus manual keyboard and screen-reader testing.
- Test both Bangla and English layouts.
- Ensure video player controls and captions are accessible.
- Test zoom, reflow, contrast and reduced motion.
- Accessibility testing is required for admin as well as public UI.

## 11. Environment variables (illustrative)

Backend:
```env
NODE_ENV=production
PORT=
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
APP_PUBLIC_URL=
YOUTUBE_API_KEY=
UPLOAD_DIRECTORY=
MAX_UPLOAD_MB=
```

Frontend:
```env
VITE_API_URL=
```

`MAX_UPLOAD_MB` must remain unset or uploads disabled until the limit is confirmed. Never expose backend secrets through `VITE_` variables.

## 12. Deployment considerations

- Frontend and API may be separate Hostinger Node.js applications.
- PostgreSQL must be hosted on a provider that supports it; verify the selected database provider and network access.
- Confirm Hostinger Business Node.js runtime, storage persistence, upload limits, request timeout, disk quota and bandwidth.
- Configure HTTPS, CORS, environment variables, logs and backups.
- Use production Prisma migrations (`prisma migrate deploy`).
- Verify uploaded files survive deployment/restart or use a supported persistent storage mount.
- Establish backup and restore tests.

## 13. Quality gates

- TypeScript and lint checks pass.
- Unit and API integration tests pass.
- No appointment code or schema remains.
- Public API exposes published content only.
- Role authorization tested at API level.
- Upload duration/size/type validation tested.
- YouTube duration verification tested, including API failure.
- SEO metadata and sitemap verified.
- Accessibility automated and manual checks completed.
- Production build and deployment smoke tests pass.
