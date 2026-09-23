import Database from "better-sqlite3";

export const db = new Database("urls.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_date TEXT,
    deleted INTEGER NOT NULL DEFAULT 0
  )
`);
