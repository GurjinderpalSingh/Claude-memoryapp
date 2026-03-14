import type Database from 'better-sqlite3';

export function initDb(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS places (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      category   TEXT NOT NULL,
      address    TEXT,
      latitude   REAL,
      longitude  REAL,
      visit_date TEXT NOT NULL,
      notes      TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_places_visit_date ON places(visit_date DESC);
    CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);

    CREATE TABLE IF NOT EXISTS photos (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id       INTEGER REFERENCES places(id) ON DELETE CASCADE,
      original_path  TEXT NOT NULL,
      thumbnail_path TEXT NOT NULL,
      filename       TEXT NOT NULL,
      size_bytes     INTEGER,
      width          INTEGER,
      height         INTEGER,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_photos_place_id ON photos(place_id);

    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
  `);
}
