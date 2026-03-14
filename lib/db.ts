import BetterSqlite3 from 'better-sqlite3';
import path from 'path';
import { initDb } from './schema';

const DB_PATH = path.join(process.cwd(), 'db', 'database.sqlite');

// Singleton: reuse DB connection across hot-reloads in dev
const globalForDb = global as typeof globalThis & { _db?: BetterSqlite3.Database };

function getDb(): BetterSqlite3.Database {
  if (!globalForDb._db) {
    const fs = require('fs');
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    globalForDb._db = new BetterSqlite3(DB_PATH);
    initDb(globalForDb._db);
  }
  return globalForDb._db;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Photo {
  id: number;
  place_id: number | null;
  original_path: string;
  thumbnail_path: string;
  filename: string;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface Place {
  id: number;
  name: string;
  category: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  visit_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaceWithPhotos extends Place {
  photos: Photo[];
}

export interface PlaceListItem extends Place {
  thumbnail: string | null;
  photo_count: number;
}

export interface CategoryCount {
  name: string;
  count: number;
}

// ─── Query functions ───────────────────────────────────────────────────────────

export function getPlaces(category?: string): PlaceListItem[] {
  const db = getDb();
  const query = `
    SELECT
      p.*,
      (SELECT thumbnail_path FROM photos WHERE place_id = p.id ORDER BY id LIMIT 1) AS thumbnail,
      (SELECT COUNT(*) FROM photos WHERE place_id = p.id) AS photo_count
    FROM places p
    ${category ? 'WHERE p.category = ?' : ''}
    ORDER BY p.visit_date DESC
  `;
  return (category ? db.prepare(query).all(category) : db.prepare(query).all()) as PlaceListItem[];
}

export function getPlaceById(id: number): PlaceWithPhotos | null {
  const db = getDb();
  const place = db.prepare('SELECT * FROM places WHERE id = ?').get(id) as Place | undefined;
  if (!place) return null;
  const photos = db.prepare('SELECT * FROM photos WHERE place_id = ? ORDER BY id').all(id) as Photo[];
  return { ...place, photos };
}

export function createPlace(data: {
  name: string;
  category: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  visit_date: string;
  notes?: string;
}): Place {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO places (name, category, address, latitude, longitude, visit_date, notes)
    VALUES (@name, @category, @address, @latitude, @longitude, @visit_date, @notes)
  `).run(data);
  return db.prepare('SELECT * FROM places WHERE id = ?').get(result.lastInsertRowid) as Place;
}

export function updatePlace(id: number, data: {
  name?: string;
  category?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  visit_date?: string;
  notes?: string;
}): Place | null {
  const db = getDb();
  const fields = Object.keys(data)
    .filter(k => data[k as keyof typeof data] !== undefined)
    .map(k => `${k} = @${k}`)
    .join(', ');
  if (!fields) return getPlaceById(id);
  db.prepare(`UPDATE places SET ${fields}, updated_at = datetime('now') WHERE id = @id`).run({ ...data, id });
  return db.prepare('SELECT * FROM places WHERE id = ?').get(id) as Place | null;
}

export function deletePlace(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM places WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getCategories(): CategoryCount[] {
  const db = getDb();
  return db.prepare(`
    SELECT category AS name, COUNT(*) AS count
    FROM places
    GROUP BY category
    ORDER BY count DESC
  `).all() as CategoryCount[];
}

export function createPhoto(data: {
  original_path: string;
  thumbnail_path: string;
  filename: string;
  size_bytes?: number;
  width?: number;
  height?: number;
}): Photo {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO photos (place_id, original_path, thumbnail_path, filename, size_bytes, width, height)
    VALUES (NULL, @original_path, @thumbnail_path, @filename, @size_bytes, @width, @height)
  `).run(data);
  return db.prepare('SELECT * FROM photos WHERE id = ?').get(result.lastInsertRowid) as Photo;
}

export function attachPhotosToPlace(photoIds: number[], placeId: number): void {
  const db = getDb();
  const stmt = db.prepare('UPDATE photos SET place_id = ? WHERE id = ?');
  const updateMany = db.transaction((ids: number[]) => {
    for (const id of ids) {
      stmt.run(placeId, id);
    }
  });
  updateMany(photoIds);
}

export function getPhotosByPlace(placeId: number): Photo[] {
  const db = getDb();
  return db.prepare('SELECT * FROM photos WHERE place_id = ? ORDER BY id').all(placeId) as Photo[];
}

export function deletePhotosByPlace(placeId: number): Photo[] {
  const db = getDb();
  const photos = db.prepare('SELECT * FROM photos WHERE place_id = ?').all(placeId) as Photo[];
  db.prepare('DELETE FROM photos WHERE place_id = ?').run(placeId);
  return photos;
}

export function deletePhoto(id: number): Photo | null {
  const db = getDb();
  const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(id) as Photo | null;
  if (photo) db.prepare('DELETE FROM photos WHERE id = ?').run(id);
  return photo;
}
