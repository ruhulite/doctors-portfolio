# Professor Dr. Muhammad Abdullahel Kafi — React Frontend

A bilingual (English/Bangla) React + Vite + TypeScript website for a gastroenterology specialist.

## Visual direction

The public-facing design has been refreshed with a classic medical-template visual direction inspired by the supplied AbrarPro reference: a medical-blue and teal palette, slim contact strip, prominent navigation, large hero area, appointment-focused information panels, expertise cards, chamber details, and a strong appointment call-to-action. This is an original implementation for this project, not a copy of the reference template.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- React Router
- i18next / react-i18next
- lucide-react icons

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_URL` in `.env.local` to the NestJS API base URL, for example `http://localhost:4000/api`.

## Build

```bash
npm run build
```

## Routes

- `/` — Home
- `/about` — Doctor profile and qualifications
- `/chambers` — Chamber information
- `/appointment` — Live appointment request form connected to the API
- `/admin` — Admin login and appointment/schedule management

## Content notes

- The hero portrait is a clearly labelled placeholder; replace it with an approved doctor photograph.
- IBN Sina branch address and appointment phone remain marked as pending until confirmed.
- Confirm experience duration, credentials, schedules, and all contact information before production launch.
- Appointment requests require administrator approval; the form does not itself confirm a visit.
