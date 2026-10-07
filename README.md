# WorkLog

Your personal professional work diary + proof-of-work system. Log daily work, track normal/extra hours, attach evidence, record blockers/meetings/learning, and generate reports you can share with your manager.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it starts in **demo mode** with sample data (marked `[Sample]`) stored in your browser.

## Enable cloud sync (accounts + cross-device)

1. Create a free project at https://supabase.com
2. In the Supabase dashboard → **SQL Editor**, paste and run `supabase/schema.sql`
3. Project Settings → API → copy the project URL and anon key into `.env.local` (see `.env.example`)
4. Restart `npm run dev` — you'll get a login/signup screen, and all data syncs to Postgres

## Deploy to Vercel

Push this repo to GitHub, import into Vercel, and add the two env vars in project settings. Done — access it from your phone or laptop with the same account.

## Features

- **Dashboard** — greeting, hours today/week, extra hours, task & blocker stats, weekly chart, recent work, quick actions
- **Daily Log** (`/log`) — timeline per day with total/extra hours, edit/delete inline
- **Quick Log** (`/log/new?quick=1`) — under-a-minute entry
- **Projects, Evidence, Blockers, Meetings, Learning** — full CRUD sections
- **Extra Hours** (`/extra-hours`) — normal vs extra totals + history table
- **Calendar** (`/calendar`) — month/week views with per-day indicators
- **Search** (`/search`) — searches everything with filters
- **Reports** (`/reports`) — professional reports (copy/download/export CSV+JSON)
- **Weekly Summary** (`/weekly`), **Analytics** (`/analytics`), **Tags**, **Settings**
- Light/dark theme, fully responsive (mobile bottom nav)
