# Lessons Learned & Development Notes

This file captures important decisions, gotchas, and patterns discovered during development. Update this as the project evolves.

---

## Next.js + Native Node Modules

**Issue:** `better-sqlite3` and `sharp` are native Node.js addons (compiled C/C++). Next.js tries to bundle all code with webpack by default, which breaks native addons.

**Fix:** Add to `next.config.mjs`:
```js
serverExternalPackages: ['better-sqlite3', 'sharp']
```
This tells Next.js to leave these packages as external Node.js requires instead of bundling them.

**Watch out for:** This setting must exist before the first `npm run build` or `npm run dev`. Missing it causes confusing `Module not found` or binding errors.

---

## SQLite Singleton Pattern

**Issue:** Next.js dev server uses hot module reloading (HMR), which can reinitialize modules multiple times and create multiple database connections.

**Fix:** Use a module-level singleton with `global` as the cache:
```ts
import Database from 'better-sqlite3';
const globalDb = global as typeof globalThis & { db?: Database.Database };
if (!globalDb.db) {
  globalDb.db = new Database(DB_PATH);
}
export const db = globalDb.db;
```

---

## SQLite Date Handling

**Decision:** Store dates as ISO 8601 strings (`YYYY-MM-DD` for visit dates, `datetime('now')` ISO strings for timestamps) rather than Unix timestamps or SQLite date types.

**Why:** SQLite has no native date type. ISO strings sort correctly lexicographically, are human-readable in the DB, and work naturally with JavaScript's `Date` and `date-fns`.

---

## Leaflet with Next.js (SSR)

**Issue:** Leaflet uses `window` and `document` directly, which don't exist during Next.js server-side rendering. Importing Leaflet in a Server Component crashes the build.

**Fix:** Use `dynamic()` with `{ ssr: false }` for the map component:
```ts
const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });
```
Also import `leaflet/dist/leaflet.css` only inside the client component.

---

## Photo Upload Before Place Save

**Decision:** Photos are uploaded immediately when selected (before the form is submitted), not bundled with the place creation request.

**Why:**
- Shows upload progress and previews per file while the user is still filling the form
- Avoids holding large multipart data in memory during place creation
- Allows the upload API to be simple (just file → disk → DB row)

**Trade-off:** If a user uploads photos then abandons the form, orphaned `photos` rows and files remain. These can be cleaned up with a startup sweep that deletes photos with `place_id IS NULL` older than 1 hour.

---

## OpenStreetMap Nominatim Rate Limiting

**Note:** The Nominatim API (used for reverse geocoding GPS coordinates to addresses) has a usage policy:
- Max 1 request per second
- Must include a `User-Agent` header with your app name

For personal use this is fine. If usage grows, consider caching geocode results or using a paid geocoding service.

---

## Camera Capture on Mobile

**How:** The HTML `capture` attribute on file inputs triggers the device camera on mobile browsers:
```html
<input type="file" accept="image/*" capture="environment" />
```
- `capture="environment"` → back camera
- `capture="user"` → front camera
- Works on iOS Safari and Android Chrome without any native app

---

## Category Design

**Decision:** Categories are stored as free-text strings in the `places` table rather than a separate `categories` table with foreign keys.

**Why:** Allows the user to type any custom category without needing a "manage categories" UI. Distinct categories are queried dynamically (`SELECT DISTINCT category FROM places`).

**Downside:** Renaming a category requires updating all place rows (no cascade rename). For a personal app this is an acceptable trade-off.

---

## Image Thumbnail Strategy

**Decision:** Generate 400×400 cover-crop thumbnails on upload using `sharp`.

**Why:** Timeline and grid views show many cards at once. Loading full-resolution images (potentially several MB each) would be slow. Thumbnails keep the UI fast.

**Implementation:** `sharp(buffer).resize(400, 400, { fit: 'cover' }).toFile(thumbPath)`

---
