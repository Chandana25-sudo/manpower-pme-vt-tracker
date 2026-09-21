# Manpower PME/VT Tracker

A mobile- and desktop-friendly web app for tracking employee **PME** (Periodical Medical Examination) and **VT** (Vocational Training) compliance. Installable as a Progressive Web App — open it in a browser and add it to your phone's home screen, no app store required.

## Features

- **Admin-only login** (email/password via Firebase Auth) — no public sign-up
- **Dashboard** with live stats: PMEs/VTs completed this month and this year, active headcount, PME pending count
- **Search by UMAN number** — view name, date of birth, age, and full PME/VT history
- **Update PME / Update VT** — each update appends a new history entry; past entries are never overwritten, only the "next due" date changes going forward
- **New entry** — add an employee with Name, UMAN, and Date of Birth (required), PME/VT dates (optional)
- **Delete entry** — guided flow (confirm details → choose reason: Retired or Transferred). This deactivates the employee rather than erasing their history
- **PME Pending list** — active employees with an overdue PME, sorted by due date, with its own export
- **Export to Excel (.xlsx)** — available from every screen once logged in

## Tech stack

- React + TypeScript (strict mode), Vite
- Tailwind CSS for responsive layout
- Firebase Auth + Firestore for authentication and data storage
- `vite-plugin-pwa` for installable/offline support
- SheetJS (`xlsx`) for spreadsheet export

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from your Firebase web app config:

```bash
cp .env.example .env.local
```

### 4. Run locally

```bash
npm run dev
```

### 5. Type-check / build

```bash
npm run typecheck
npm run build
```

## Deployment

Any static host works (Firebase Hosting, Vercel, Netlify). For Firebase Hosting:

```bash
npm run build
firebase deploy --only hosting
```

## Data model notes

- `manpower/{uan}` — one document per employee, holding the latest PME/VT dates and next-due dates for fast lookups.
- `complianceEvents/{id}` — an append-only log of every PME/VT completion, used to render history and to compute "completed this month/year" stats. Records are never edited or deleted.
- Next due date defaults to **PME: last PME date + 1 year**, **VT: last VT date + 4 years** (editable per record by the admin at the time of recording). Adjust `VALIDITY_YEARS` in `src/utils/dateUtils.ts` if the compliance rule changes.

## Icons

Add `icon-192.png` and `icon-512.png` to `public/icons/` for a proper home-screen icon on all platforms (see `public/icons/README.md`).
