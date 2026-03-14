# Places Memory App

A personal web app to save and browse places you've visited — restaurants, hiking trails, sports venues, travel destinations, and more.

## What It Does

- **Save places** with name, category, location (GPS auto-detect), photos, visit date, and notes
- **Timeline view** — scroll back through your visits grouped by month
- **Map view** — see all your visited places as pins on an interactive map
- **Category filter** — browse places filtered by category (restaurants, hiking, sports, travel, etc.)
- **Photo gallery** — attach multiple photos per place; view in a lightbox

## Tech Stack

- **Next.js 14** (App Router) — full-stack React framework
- **SQLite** (`better-sqlite3`) — local zero-config database
- **Tailwind CSS** — utility-first styling
- **Leaflet / react-leaflet** — interactive map (OpenStreetMap tiles, no API key needed)
- **sharp** — server-side image thumbnail generation
- **react-hook-form + zod** — form handling and validation
- **react-dropzone** — drag-and-drop photo uploads

## Running the App

```bash
npm install
npm run dev
# Open http://localhost:3000
```

No environment variables needed. The SQLite database and upload directories are created automatically on first run.

## Key Directories

- `app/` — Next.js pages and API routes
- `components/` — Reusable React components
- `lib/` — Database layer and image utilities
- `public/uploads/` — Stored photos (gitignored)
- `db/` — SQLite database file (gitignored)
- `.claude/docs/` — Architecture and technical documentation
- `.claude/lessons/` — Lessons learned and development notes
