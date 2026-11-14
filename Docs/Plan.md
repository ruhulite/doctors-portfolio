# Implementation Plan
## Doctor Portfolio & Health Education Website

**Version:** 1.0  
**Approach:** Audit first, then implement in small, testable phases.

## Phase 0 — Repository and hosting audit

- Obtain the current project source and inspect the actual repository.
- Inventory frontend routes, components, dependencies and environment variables.
- Inventory NestJS modules, controllers, services, guards and DTOs.
- Review Prisma schema, migrations, seed scripts and existing data.
- Identify all appointment references.
- Verify Hostinger Business Node.js support, Node version, persistent disk behavior, upload limits, request timeout, disk quota and bandwidth.
- Confirm PostgreSQL provider and connectivity.
- Produce a file-by-file change list before editing.

**Exit criteria:** Existing architecture and deployment constraints are documented; no assumptions about missing files or scripts.

## Phase 1 — Remove appointment functionality

- Remove appointment navigation, buttons, pages and forms.
- Remove appointment API modules and DTOs.
- Remove appointment frontend services/types/hooks.
- Remove appointment database models/enums/relations only after migration review.
- Remove appointment seed data and environment references.
- Search the repository for remaining appointment terms and dead imports.

**Exit criteria:** No appointment feature is accessible; frontend and backend builds pass; migrations tested on a copy.

## Phase 2 — Data model and API foundation

- Finalize content section structure and localized fields.
- Implement content versioning and publication pointer.
- Implement media metadata and video models.
- Implement public read APIs and protected admin APIs.
- Add audit records.
- Add validation and API documentation.

**Exit criteria:** Public API returns published content only; draft content remains protected.

## Phase 3 — Authentication and roles

- Implement Super Admin and Admin roles.
- Implement secure login/logout and session/token handling.
- Enforce authorization in NestJS.
- Add Super Admin user management.
- Finalize Admin publish permission.
- Add rate limiting and audit logging.

**Exit criteria:** Role tests prove that unauthorized users cannot access or publish protected content.

## Phase 4 — Content management and preview

- Build admin content editor for all approved landing-page sections.
- Add Bangla and English fields.
- Add section visibility and ordering.
- Add draft saving.
- Build preview using the public page components and isolated draft data.
- Implement publication and rollback/version history as agreed.

**Exit criteria:** Admin can edit and preview; public page changes only after authorized publication.

## Phase 5 — Video management

- Implement server-upload workflow.
- Verify storage persistence and host limits before enabling uploads.
- Configure maximum upload size based on measured/confirmed Hostinger limits.
- Implement safe streaming upload and cleanup.
- Inspect actual duration server-side; enforce maximum 180 seconds.
- Implement YouTube URL validation and Data API duration verification.
- Keep unverifiable videos unpublished.
- Add thumbnail, category, bilingual metadata, featured flag and ordering.
- Add accessible public playback.

**Exit criteria:** Both sources work; videos over 180 seconds cannot be published; upload limits are documented.

## Phase 6 — Public landing page

- Implement one responsive landing page.
- Fetch published content from API.
- Make Bangla the default language.
- Add English translation behavior.
- Render published videos from both sources.
- Add loading, empty and error states.
- Ensure no appointment CTA or route exists.

**Exit criteria:** All editable public content comes from the published API.

## Phase 7 — SEO and accessibility

- Implement locale-aware metadata and canonical behavior.
- Add sitemap and robots rules.
- Add structured data using verified facts only.
- Evaluate and implement prerendering/SSR if required by SEO goals and hosting.
- Optimize images and performance.
- Implement WCAG 2.2 AA patterns.
- Run automated accessibility checks and manual keyboard/screen-reader tests.

**Exit criteria:** SEO and accessibility checklists pass; issues are documented and resolved or accepted.

## Phase 8 — Testing and security

- Unit tests for services and validators.
- API integration tests.
- End-to-end tests for content and video workflows.
- Role/permission tests.
- Upload size, type, signature and duration tests.
- YouTube API failure/quota tests.
- Localization tests.
- Responsive tests.
- Security review for auth, uploads, CORS, secrets and headers.
- Backup/restore test.

**Exit criteria:** Release-blocking defects resolved and production build succeeds.

## Phase 9 — Deployment and handover

- Configure production environment variables.
- Deploy API and frontend.
- Apply production migrations.
- Configure HTTPS and CORS.
- Verify database connectivity and uploaded file persistence.
- Configure backups, logs and monitoring.
- Smoke-test public page, admin, videos and language switching.
- Document deployment, backup and recovery procedures.

**Exit criteria:** Production deployment verified and operational handover complete.

## Release checklist

- [ ] No appointment functionality remains.
- [ ] Public site is one landing page.
- [ ] Bangla is default; English works.
- [ ] Content is API-driven and admin-managed.
- [ ] Draft preview is private.
- [ ] Publication permissions are enforced server-side.
- [ ] Server uploads work within verified limits.
- [ ] YouTube integration works.
- [ ] Both video sources enforce 180-second maximum.
- [ ] Public video list includes published items only.
- [ ] SEO metadata, sitemap and structured data are checked.
- [ ] WCAG 2.2 AA testing completed.
- [ ] Production migrations, backups and restore are tested.
- [ ] Hostinger deployment and storage persistence verified.

## Dependencies / unresolved decisions

- Current source repository/ZIP required for implementation.
- Admin publishing policy needs final confirmation.
- Video categories: fixed list or admin-managed.
- Hostinger upload-size and persistent-storage limits.
- Supported upload formats and any transcoding requirement.
- Caption/transcript policy.
- Final domain and canonical URL.
