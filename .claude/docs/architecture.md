# Architecture Overview

## App Type
Web application — runs at `http://localhost:3000` in any browser. Works on desktop and mobile browsers.

## Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 14 (App Router) | Full-stack in one project — React pages + API routes together, no separate backend |
| Database | SQLite via `better-sqlite3` | Zero-config, single file on disk, no daemon needed, perfect for personal/local apps |
| Image storage | Local filesystem (`public/uploads/`) | Files served directly by Next.js static serving |
| Image processing | `sharp` | Server-side thumbnail generation (400×400 cover crop) |
| Styling | Tailwind CSS | Utility-first, fast to iterate |
| Forms | react-hook-form + zod | Type-safe form state + validation schema |
| Photo upload | react-dropzone | Drag-and-drop UX + camera capture via HTML `capture` attribute |
| Map | Leaflet + react-leaflet | Open-source, no API key required, uses OpenStreetMap tiles |
| Date utilities | date-fns | Lightweight, tree-shakeable date formatting/grouping |
| Lightbox | yet-another-react-lightbox | Photo gallery with keyboard nav and zoom |

## Database Schema

### `places` table
Stores one record per visited place.

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| name | TEXT | Place name (required) |
| category | TEXT | Free-text, indexed. e.g. "hiking", "restaurant" |
| address | TEXT | Human-readable address (optional) |
| latitude | REAL | GPS coordinates (optional) |
| longitude | REAL | GPS coordinates (optional) |
| visit_date | TEXT | ISO 8601 "YYYY-MM-DD", used for timeline grouping |
| notes | TEXT | Free-form notes (optional) |
| created_at | TEXT | ISO datetime |
| updated_at | TEXT | ISO datetime |

### `photos` table
One-to-many: a place can have multiple photos.

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| place_id | INTEGER FK | References places.id, CASCADE DELETE |
| original_path | TEXT | Path under `/public/uploads/originals/` |
| thumbnail_path | TEXT | Path under `/public/uploads/thumbnails/` |
| filename | TEXT | Original uploaded filename |
| size_bytes | INTEGER | File size |
| width | INTEGER | Image dimensions |
| height | INTEGER | Image dimensions |
| created_at | TEXT | ISO datetime |

**Design decisions:**
- `visit_date` stored as ISO 8601 text sorts correctly lexicographically in SQLite
- Categories are free-text (no foreign key) — allows custom categories without a management UI
- `ON DELETE CASCADE` on photos ensures no orphan rows when a place is deleted
- Photo files are deleted from disk before the SQL DELETE (application layer)

## API Routes

All routes live in `app/api/` as Next.js Route Handlers.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/places` | List places; supports `?category=` filter |
| POST | `/api/places` | Create a new place |
| GET | `/api/places/[id]` | Get one place with all photos |
| PUT | `/api/places/[id]` | Update place fields |
| DELETE | `/api/places/[id]` | Delete place + photo files + photo rows |
| GET | `/api/categories` | List distinct categories sorted by usage count |
| POST | `/api/upload` | Upload an image → returns photo row |

## Upload Flow

Photos are uploaded **before** the place is saved:
1. User drags/drops or selects files in `<PhotoUploader />`
2. Each file is POSTed to `/api/upload` immediately
3. Server saves original file + generates thumbnail via `sharp`
4. Server inserts a `photos` row with `place_id = NULL`
5. Server returns `{ id, original_path, thumbnail_path, width, height }`
6. The form collects returned `photo_id` values
7. On place save, the API sets `place_id` on those photo rows

This allows progress feedback per file and previews before the form is submitted.

## Location Capture

- User clicks "Use My Location" button
- Browser calls `navigator.geolocation.getCurrentPosition()`
- Coordinates auto-fill `latitude` and `longitude` fields
- Address is reverse-geocoded from coordinates using the free **OpenStreetMap Nominatim API** (no API key needed)
- On the Place Detail page, a static map tile from OpenStreetMap shows the pinned location

## Pages

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Server | Redirects to `/timeline` |
| `/timeline` | Server Component | Places grouped by month |
| `/map` | Client Component | Leaflet map with all place pins |
| `/categories` | Server Component | Grid filtered by `?category=` param |
| `/places/new` | Client Component | Add place form |
| `/places/[id]` | Server Component | Place detail + photo gallery |
| `/places/[id]/edit` | Client Component | Edit place form |

## Critical Configuration

`next.config.mjs` **must** declare:
```js
serverExternalPackages: ['better-sqlite3', 'sharp']
```
Without this, Next.js tries to webpack-bundle these native Node addons and fails with cryptic errors.

## File Structure

```
app/                    # Next.js pages and API routes
components/
  layout/               # NavBar
  places/               # PlaceCard, PlaceForm, PhotoUploader, PhotoGallery
  timeline/             # TimelineView, MonthGroup
  categories/           # CategoryFilter, CategoryChip
  ui/                   # Button, Input, Select, Textarea, Badge, EmptyState
lib/
  schema.ts             # DB CREATE TABLE statements + initDb()
  db.ts                 # better-sqlite3 singleton + all query functions
  image.ts              # saveImage(), deleteImage() using sharp
public/uploads/
  originals/            # Full-resolution uploaded images (gitignored)
  thumbnails/           # 400×400 thumbnails (gitignored)
db/
  database.sqlite       # SQLite file (gitignored, auto-created)
.claude/
  docs/                 # This file + other technical docs
  lessons/              # Development notes and lessons learned
```
