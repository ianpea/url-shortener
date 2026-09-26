import {db} from "./database";

export interface UrlRecord {
    id: number;
    shortCode: string;
    originalUrl: string;
    createdAt: string;
    expiryDate: string;
    tag: string | null;
}

export interface UrlSummary {
    originalUrl: string;
    expiryDate: string;
}

export function findUrls(page: number, pageSize: number): UrlRecord[] {
    const offset = (page - 1) * pageSize;
    return db.prepare(`SELECT id, original_url AS originalUrl,
        short_code AS shortCode,
        created_at AS createdAt,
        expiry_date AS expiryDate,
        tag
        FROM urls WHERE deleted = 0 ORDER BY created_at desc LIMIT ? OFFSET ?;`).all(pageSize, offset) as UrlRecord[];
}

export function countUrls(): number {
    const result = db.prepare(`SELECT count(*) as count from urls WHERE deleted = 0;`).get() as {count: number;};
    return result.count;
}

export function findUrlByShortCode(shortCode: string): UrlSummary | undefined {
    return db.prepare("SELECT original_url as originalUrl, expiry_date as expiryDate from urls where short_code = ? and deleted = 0").get(shortCode) as UrlSummary | undefined;
}

export function deleteUrlById(id: number): boolean {
    const result = db.prepare("UPDATE urls set deleted = 1 where id = ?").run(id);
    return result.changes > 0;
}

export function insertUrl(originalUrl: string, shortCode: string, expiryDate: string | null, tag: string | null = null): UrlRecord | undefined {
    return db.prepare(`INSERT INTO urls (original_url, short_code, expiry_date, tag) VALUES (?,?,?,?)
        RETURNING
        id,
        original_url AS originalUrl,
        short_code AS shortCode,
        created_at AS createdAt,
        expiry_date AS expiryDate,
        tag`).get(originalUrl, shortCode, expiryDate, tag) as UrlRecord | undefined;
}
