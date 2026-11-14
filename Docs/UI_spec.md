# UI Specification
## Public Website and Admin Panel

**Version:** 1.0  
**Language default:** Bangla  
**Accessibility target:** WCAG 2.2 AA

## 1. Design principles

- Professional, calm healthcare presentation.
- Preserve the existing teal visual identity only if confirmed against the current source project.
- Clear information hierarchy and readable typography.
- Responsive layouts from small mobile screens through desktop.
- Consistent components, spacing, focus states and error states.
- Avoid decorative effects that reduce readability or accessibility.

## 2. Public landing page

The public website is a single page. Section order and visibility should be configurable.

### Header
- Doctor/institute logo.
- In-page navigation links.
- Bangla/English language selector.
- Mobile navigation with keyboard-operable menu.
- No appointment CTA.

### Hero
- Doctor name and verified professional designation.
- Short introductory statement.
- Optional hero image.
- CTA destinations must be confirmed and must not imply appointment booking unless a later requirement explicitly changes scope.

### About
- Biography in Bangla and English.
- Profile image with appropriate alternative text.
- Avoid unsupported medical or professional claims.

### Qualifications and experience
- Structured list/timeline.
- Dates and institutions where verified.
- Logical heading levels and readable chronology.

### Specializations
- Cards or grouped list.
- Clear, plain-language descriptions.
- No claims of guaranteed outcomes.

### Chamber information
- Name, address, phone and visiting information, only where verified.
- Phone links use `tel:` where appropriate.
- Map embedding is optional and must not block access to address details.

### Educational videos
- Responsive card/list layout.
- Thumbnail, bilingual title, description, category and duration.
- Duration cannot exceed 03:00.
- Click/tap opens an accessible player or inline player.
- YouTube and uploaded videos use source-appropriate playback.
- No autoplay with sound.
- Captions/subtitles controls when available.

### Contact and footer
- Verified contact details and social links.
- Copyright and policy links if supplied.
- No appointment form.

## 3. Language behavior

- Initial language: Bangla (`bn`).
- English locale: `en`.
- Persist visitor language choice using a non-sensitive preference mechanism.
- Set document `<html lang="bn">` or `<html lang="en">` on language change.
- Avoid mixing languages inside a single field unless content is intentionally bilingual.
- Translate navigation, buttons, validation, empty states, metadata and accessibility labels.
- Use suitable Bangla and Latin font fallbacks.

## 4. Admin information architecture

Suggested navigation:
- Dashboard
- Landing Page Content
- Qualifications
- Experience
- Specializations
- Chambers
- Contact
- Videos
- Media Library
- SEO Settings
- User Management (Super Admin only)
- Website Settings

No appointment navigation or admin feature.

## 5. Content editor

- Clearly label Bangla and English inputs.
- Provide field-level validation and required-field indicators.
- Support draft save.
- Preview action.
- Publish or submit-for-review action based on role permissions.
- Show publication status, last editor and timestamps.
- Warn about unsaved changes.
- Confirm destructive delete operations.
- Accessible success and error announcements.

## 6. Video editor

### Source selection
- “Upload from server”
- “Add YouTube URL”

### Common fields
- Bangla title and description.
- English title and description.
- Category.
- Thumbnail.
- Featured toggle.
- Display order.
- Draft/published state.

### Upload-specific fields
- File picker and upload progress.
- Accepted formats and configured maximum file size displayed before selection.
- Duration inspection result.
- Maximum duration displayed as 03:00.
- Clear errors for unsupported format, excessive duration, size or interrupted upload.

### YouTube-specific fields
- YouTube URL.
- Parsed video preview.
- Duration verification status.
- Maximum duration 03:00.
- Clear status if API verification is unavailable.

## 7. Accessibility behavior

- Skip link appears on keyboard focus.
- Header, navigation, main and footer landmarks.
- One descriptive H1; nested headings follow a logical order.
- All actions usable with keyboard.
- Focus is visible and not obscured.
- Dialogs trap/restore focus appropriately.
- Menus expose expanded/collapsed state.
- Inputs have programmatic labels and useful errors.
- Status messages use accessible live regions where appropriate.
- Color is never the only way to convey status.
- Respect reduced-motion preference.
- Video controls are keyboard accessible; captions are available when provided.

## 8. Responsive behavior

- Mobile: single-column content, compact navigation and touch-friendly controls.
- Tablet: flexible two-column sections where useful.
- Desktop: balanced content width and multi-column cards where appropriate.
- No horizontal scrolling at common viewport widths, except intentional data tables with accessible alternatives.

## 9. UI states to design

- Loading/skeleton.
- Empty content.
- API error and retry.
- Draft.
- Preview.
- Published.
- Upload progress.
- Upload success/failure.
- Invalid or unverified YouTube video.
- Unauthorized access.
- Form validation errors.
