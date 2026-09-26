import {beforeEach, describe, expect, it} from 'vitest';
import {db} from './database';
import {countUrls, deleteUrlById, findUrlByShortCode, findUrls, insertUrl} from './url';

// vitest.config.ts points DB_PATH at ':memory:', so this is a throwaway database.
beforeEach(() => {
    db.exec("DELETE FROM urls; DELETE FROM sqlite_sequence WHERE name = 'urls';");
});

describe('insertUrl + findUrlByShortCode', () => {
    it('stores a url and finds it again by its short code', () => {
        insertUrl('https://example.com', 'abc1234', null, 'Instagram');

        expect(findUrlByShortCode('abc1234')).toMatchObject({
            originalUrl: 'https://example.com',
            expiryDate: null,
            tag: 'Instagram',
        });
    });

    it('returns undefined for a short code that was never inserted', () => {
        findUrlByShortCode('abc1234');

        expect(findUrlByShortCode('abc1234')).toBeUndefined();
    });
    it('returns undefined for a url that was soft deleted', () => {
        insertUrl('https://example1.com', 'shortCode1', '');
        deleteUrlById(1);
        expect(findUrlByShortCode('shortCode1')).toBeUndefined();
    });
});

describe('countUrls / deleteUrlById', () => {
    it('counts only rows that are not deleted', () => {
        insertUrl('https://example1.com', 'shortCode1', '');
        insertUrl('https://example2.com', 'shortCode2', '');

        deleteUrlById(1);
        expect(countUrls()).toBe(1);
    });
    it('returns true when a row was soft deleted and false for an unknown id', () => {
        insertUrl('https://example1.com', 'shortCode1', ''); // id 1
        insertUrl('https://example2.com', 'shortCode2', ''); // id 2

        expect(deleteUrlById(1)).toBe(true);
        expect(deleteUrlById(3)).toBe(false);
    });
});

// `created_at` defaults to CURRENT_TIMESTAMP (second precision), so rows inserted in
// the same test tie under ORDER BY created_at desc. Pin it explicitly for a stable order.
function insertAt(originalUrl: string, shortCode: string, createdAt: string): void {
    insertUrl(originalUrl, shortCode, null);
    db.prepare("UPDATE urls SET created_at = ? WHERE short_code = ?").run(createdAt, shortCode);
}

describe('findUrls', () => {
    it('maps the stored row to camelCase fields', () => {
        insertUrl('https://example.com', 'abc1234', '2030-01-01T00:00:00.000Z', 'Instagram');

        const [row] = findUrls(1, 5);

        expect(row).toMatchObject({
            id: 1,
            shortCode: 'abc1234',
            originalUrl: 'https://example.com',
            expiryDate: '2030-01-01T00:00:00.000Z',
            tag: 'Instagram',
        });
        expect(typeof row.createdAt).toBe('string');
    });

    it('skips rows that were soft deleted', () => {
        insertUrl('https://example1.com', 'code001', null);
        insertUrl('https://example2.com', 'code002', null);
        deleteUrlById(2);

        expect(findUrls(1, 5).map((row) => row.shortCode)).toEqual(['code001']);
    });

    it('orders the newest url first', () => {
        insertAt('https://old.com', 'old0001', '2026-01-01 00:00:00');
        insertAt('https://new.com', 'new0001', '2026-01-02 00:00:00');

        expect(findUrls(1, 5).map((row) => row.shortCode)).toEqual(['new0001', 'old0001']);
    });

    it('slices results by page and pageSize', () => {
        for(let i = 1; i <= 5; i++) {
            insertAt(`https://example${i}.com`, `code00${i}`, `2026-01-0${i} 00:00:00`);
        }
        const newestFirst = ['code005', 'code004', 'code003', 'code002', 'code001'];

        expect(findUrls(1, 2).map((row) => row.shortCode)).toEqual(newestFirst.slice(0, 2));
        expect(findUrls(2, 2).map((row) => row.shortCode)).toEqual(newestFirst.slice(2, 4));
        expect(findUrls(3, 2).map((row) => row.shortCode)).toEqual(newestFirst.slice(4));
    });

    it('returns an empty array when the page is past the end', () => {
        insertUrl('https://example.com', 'abc1234', null);

        expect(findUrls(2, 5)).toEqual([]);
    });
});
