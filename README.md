# Kafi Gastroenterology Portfolio

React + Vite + TypeScript frontend for Professor Dr. Muhammad Abdullahel Kafi.

## Frontend setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_URL` to the NestJS API base URL, including `/api` (for example `http://localhost:4000/api`). For Vercel, add `VITE_API_URL` in Project Settings → Environment Variables and redeploy. The API must allow the deployed frontend origin through its `FRONTEND_ORIGIN` environment variable and must be served over HTTPS in production.

## Appointment workflow

The public form loads active chambers and available slots from the API, then submits a request to `POST /api/appointments`. A successful submission creates a `PENDING` appointment; it is not confirmed until an authorized administrator approves it.

## Admin portal

Open `/admin`. Sign in with an account provisioned by the API super administrator. The dashboard lists appointment requests, supports approve/reject/reschedule for ADMIN and SUPER_ADMIN roles, and lets those roles edit weekly chamber schedules. STAFF can view appointment requests but cannot approve, reject, reschedule, or edit schedules.

The access token is kept in `sessionStorage` for the current browser tab and is cleared on sign-out. Use HTTPS, strong unique administrator passwords, restricted CORS, and individual accounts. Do not use shared administrator credentials.

## API contract

The frontend expects the NestJS API described in `../kafi-gastro-api/README.md`:
- `GET /chambers`
- `GET /chambers/:id/slots?date=YYYY-MM-DD`
- `POST /appointments`
- `POST /auth/login`
- `GET /appointments`
- `POST /appointments/:id/approve|reject|reschedule`
- `GET /chambers/:id/schedules`
- `PUT /chambers/:id/schedules`

All displayed appointment times use the `Asia/Dhaka` time zone. The API remains authoritative for schedule validation and double-booking prevention.
