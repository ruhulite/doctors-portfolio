# Kafi Gastroenterology API

NestJS REST API starter for the Professor Dr. Muhammad Abdullahel Kafi portfolio and appointment workflow. Uses PostgreSQL, Prisma, JWT bearer authentication, role guards, schedule validation and database-enforced overlap protection.

## Requirements
- Node.js 20+
- Docker Desktop (or a PostgreSQL 14+ instance)

## Run locally

```bash
cp .env.example .env
# Edit .env: set a unique JWT_SECRET (32+ random characters) and ADMIN_PASSWORD (16+ characters).
docker compose up -d
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run start:dev
```

API base URL: `http://localhost:4000/api`

The seed creates a SUPER_ADMIN and two chambers. Chamber schedule rows use the supplied visiting days/hours and a provisional 15-minute slot duration. Confirm slot duration and both chamber schedules with the hospital before enabling real bookings. IBN Sina address and phone remain blank until confirmed.

## Roles
- `SUPER_ADMIN`: full access, including staff account creation/deactivation.
- `ADMIN`: manage chambers/schedules and approve, reject or reschedule appointments.
- `STAFF`: view appointment list; cannot make booking decisions.
- Public visitors: create appointment requests and read active chambers/schedules.

A SUPER_ADMIN is implicitly allowed through role guards. Only a SUPER_ADMIN can create ADMIN or STAFF accounts; public registration is intentionally absent.

## Main endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/login` | Public | Login and receive access token |
| GET | `/auth/me` | Authenticated | Current admin profile |
| GET | `/chambers` | Public | Active chambers |
| POST | `/chambers` | ADMIN+ | Create chamber |
| GET | `/chambers/:chamberId/schedules` | Public | Active weekly schedule |
| PUT | `/chambers/:chamberId/schedules` | ADMIN+ | Upsert one weekday schedule |
| POST | `/appointments` | Public | Submit pending appointment request |
| GET | `/appointments?status=PENDING` | STAFF+ | List appointments |
| POST | `/appointments/:id/approve` | ADMIN+ | Approve pending request |
| POST | `/appointments/:id/reject` | ADMIN+ | Reject pending request |
| POST | `/appointments/:id/reschedule` | ADMIN+ | Change time; returns to pending |
| GET | `/admin/users` | SUPER_ADMIN | List staff accounts |
| POST | `/admin/users` | SUPER_ADMIN | Create ADMIN or STAFF account |
| PATCH | `/admin/users/:id/deactivate` | SUPER_ADMIN | Deactivate account |

For protected routes, send `Authorization: Bearer <accessToken>`.

## Appointment request example

```json
{
  "chamberId": "popular-dhanmondi",
  "patientName": "Sample Patient",
  "patientPhone": "01712345678",
  "startsAt": "2026-11-07T19:00:00+06:00",
  "note": "Optional short note"
}
```

`startsAt` must be an ISO-8601 timestamp with the Bangladesh (`+06:00`) offset. The API validates the selected weekday, opening hours and slot grid in `Asia/Dhaka`; timestamps are stored in PostgreSQL as UTC instants. The backend uses a provisional 15-minute appointment duration from the seeded schedule.

## Double-booking protection

The initial SQL migration enables PostgreSQL `btree_gist` and adds a GiST exclusion constraint on `(chamberId, [startsAt, endsAt))` for `PENDING` and `APPROVED` appointments. This is the final concurrency guard, not just a frontend check. A serializable transaction also validates the schedule and writes the booking. Rejected/cancelled bookings release their slot. Rescheduling updates the time in a transaction and sets the appointment back to `PENDING` for fresh confirmation.

## Security notes before production

- Replace all example secrets and database credentials. Keep `.env` out of source control.
- Deploy behind HTTPS; restrict CORS to the exact production frontend origin.
- Add a managed secret store, automated backups, monitoring and restore drills.
- Add rate limiting/CAPTCHA to public booking and login endpoints, email/SMS notifications, consent and retention policy, and an operational process for patient-data requests.
- Consider refresh-token rotation, MFA for administrators, login lockout, and a dedicated audit review screen.
- Do not put diagnosis, reports or sensitive clinical details in the free-text note. Keep the booking form to minimum necessary information.
- Do not expose appointment records publicly. Avoid logging patient names, phone numbers, tokens or notes.
- Have the doctor/clinic approve schedules, appointment duration and privacy wording before launch.

## Important implementation boundary
This is a backend starter, not a production-certified medical records system. Notifications, payment, calendar sync, patient self-service, full audit UI, password reset, MFA and deployment infrastructure are not implemented yet. The frontend appointment form must be connected to `POST /api/appointments`; it currently only validates locally.
