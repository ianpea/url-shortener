import Database from "better-sqlite3";

// Tests always get a throwaway in-memory database. This is keyed off NODE_ENV
// (which vitest sets to "test") rather than only the DB_PATH env var, so the
// suite stays isolated on any machine even if vitest.config.ts is missing.
function resolveDbPath(): string {
    if (process.env.DB_PATH) {
        return process.env.DB_PATH;
    }
    return process.env.NODE_ENV === "test" ? ":memory:" : "urls.db";
}

export const db = new Database(resolveDbPath());

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

const urlColumns = db.prepare("PRAGMA table_info(urls)").all() as {name: string}[];
if(!urlColumns.some((column) => column.name === "tag")) {
    db.exec("ALTER TABLE urls ADD COLUMN tag TEXT");
}
