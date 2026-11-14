# Product Requirements Document (PRD)
## Doctor Portfolio & Health Education Website

**Version:** 1.0  
**Status:** Requirements baseline  
**Last updated:** 2026-11-14

## 1. Product overview

A bilingual, admin-managed professional portfolio and health-education website for **Professor Dr. Muhammad Abdullahel Kafi**. The public experience is a single-page landing page. Authorized administrators manage all public content through a protected admin panel.

The product is not an appointment-booking system.

## 2. Product goals

- Present verified professional information clearly and professionally.
- Provide a responsive, accessible, search-engine-friendly single-page website.
- Let authorized staff manage public content without code changes.
- Publish educational videos from either server uploads or YouTube.
- Support Bangla and English, with Bangla as the default language.
- Provide a draft → preview → publish workflow.

## 3. Out of scope

The following must not exist in the product:
- Appointment booking, appointment requests, appointment calendars or booking forms.
- Appointment-related APIs, database entities, admin screens, navigation items or CTAs.
- Patient accounts, patient records, clinical consultations or telemedicine.
- Any public multi-page content-management experience. The public site is one landing page.

## 4. Users and roles

### Public visitor
- Views the landing page without signing in.
- Switches between Bangla and English.
- Plays published educational videos.
- Uses contact links provided by the doctor/administrator.

### Super Admin
- Full administrative access.
- Creates, edits, previews and publishes content.
- Manages Admin accounts and permissions.
- Manages videos, media, SEO and site settings.

### Admin
- Manages permitted landing-page content and videos.
- Saves drafts and previews changes.
- Publishing permissions must be explicitly configured; default policy is that Admin submits changes for Super Admin publication until the owner confirms otherwise.
- Cannot manage Super Admin accounts or elevate their own permissions.

## 5. Public landing-page sections

The exact visibility and content of each section is configurable:
1. Header, logo and language selector.
2. Hero.
3. Doctor biography / About.
4. Qualifications.
5. Professional experience.
6. Specializations and services.
7. Chamber information and visiting details.
8. Health-awareness / educational videos.
9. Contact information and social links.
10. Footer.

All public content must be retrieved from the backend's published-content API. The frontend must not hardcode editable profile content as its source of truth.

## 6. Content management requirements

- Manage text in Bangla and English.
- Manage section visibility and display order.
- Support draft, preview and published states.
- Preview must not expose draft content publicly.
- Publish should atomically update the public version.
- Provide image upload/replacement where relevant.
- Validate required fields and URLs.
- Record who created, updated and published content and when.
- Avoid publishing unverified medical claims or credentials.

## 7. Video management requirements

Two sources are mandatory:

### Server-uploaded video
- Upload a video file through the admin panel.
- Store the file on the configured hosting server storage.
- Store metadata in PostgreSQL; do not store binary video data in PostgreSQL.
- Support a thumbnail, bilingual title and description, category, featured flag, visibility and ordering.
- Validate actual media duration server-side.
- Maximum duration: **180 seconds (3 minutes)**.
- Reject files longer than 180 seconds.
- Validate MIME type and file signature; enforce configured file-size limit.
- File-size limit remains **TBD until Hostinger plan/runtime limits are verified**.
- Use safe filenames and prevent executable content from being served.

### YouTube video
- Admin submits a YouTube URL.
- Parse and validate supported YouTube URL forms and extract video ID.
- Verify video duration using YouTube Data API where API access is configured.
- Maximum duration: **180 seconds**.
- If duration cannot be verified, do not silently assume it meets the limit; keep the record in draft/pending verification.
- Store video ID and metadata, not a downloaded copy of the YouTube video.
- Embed using privacy-enhanced YouTube embed domain where feasible.

### Shared video behavior
- Both sources appear in the same public video section.
- Support bilingual titles/descriptions, category, thumbnail, featured state, display order and publish state.
- Public visitors only see published videos.
- Provide accessible player controls and captions/subtitles where available.
- Do not autoplay with sound.

## 8. SEO requirements

- Meaningful HTML title and meta description for both languages.
- Canonical URL and social Open Graph metadata.
- XML sitemap and robots.txt.
- Correct `lang` attribute and appropriate `hreflang` strategy for the two language variants.
- Semantic HTML and a single clear H1.
- Descriptive image alternative text.
- Optimized responsive images and lazy loading for below-the-fold media.
- Schema.org structured data only for verified facts and suitable entity types.
- Video metadata / VideoObject structured data only when requirements are met.
- Public content should be crawlable; evaluate prerendering or SSR for the Vite frontend.
- No misleading medical claims, guarantees or unsupported credentials.

## 9. Accessibility requirements

Target: **WCAG 2.2 Level AA**.

- Keyboard-operable navigation and controls.
- Skip-to-content link.
- Semantic landmarks and logical heading hierarchy.
- Visible focus indicator.
- Sufficient text and UI contrast.
- Accessible names and labels for controls.
- Correct error identification and instructions.
- Useful alt text for informative images; empty alt for decorative images.
- Correct language metadata for Bangla and English content.
- Captions/subtitles for spoken video content where available; transcript support should be considered.
- Respect `prefers-reduced-motion`.
- Responsive reflow and usable zoom.
- Admin dialogs, menus, tables and forms must also be accessible.

## 10. Non-functional requirements

- Responsive support for mobile, tablet and desktop.
- HTTPS in production.
- Secure password hashing and server-side authorization.
- Input validation and rate limiting for authentication/upload endpoints.
- Secrets stored in deployment environment variables.
- Database backup and restore procedure.
- Logging without exposing passwords, tokens or sensitive content.
- Performance monitoring and Core Web Vitals checks.
- Upload limits and storage capacity configured from verified hosting constraints.

## 11. Acceptance criteria

1. The public application exposes one landing page and no appointment functionality.
2. Bangla is the initial language; English can be selected.
3. Public sections render from published API content.
4. Super Admin and Admin can authenticate with server-enforced roles.
5. Draft edits are not visible to public visitors.
6. An authorized user can preview a draft before publication.
7. Published content appears on the landing page without a frontend code change.
8. Admin can add a server video and a YouTube video.
9. Both video sources are limited to 180 seconds, with server-side verification.
10. Public visitors see only published videos.
11. SEO metadata and structured data reflect verified published content.
12. Public and admin interfaces meet the agreed WCAG 2.2 AA target after accessibility testing.
13. The upload file-size limit is not finalized until hosting limits are verified.

## 12. Open decisions

- Exact Admin publishing permission.
- Final content fields and section order.
- Video category list and whether categories are admin-defined.
- Hostinger storage, request-size, timeout and disk limits.
- Supported video formats and transcoding policy.
- Whether captions/transcripts are mandatory or recommended.
- Final public domain and canonical URL.
