import {beforeEach, describe, expect, it} from 'vitest';
import {db} from './database';
import {countUrls, deleteUrlById, findUrlByShortCode, insertUrl} from './url';

// vitest.config.ts points DB_PATH at ':memory:', so this is a throwaway database.
beforeEach(() => {
    db.exec("DELETE FROM urls; DELETE FROM sqlite_sequence WHERE name = 'urls';");
});

describe('insertUrl + findUrlByShortCode', () => {
    it('stores a url and finds it again by its short code', () => {
        insertUrl('https://example.com', 'abc1234', null);

        expect(findUrlByShortCode('abc1234')).toMatchObject({
            originalUrl: 'https://example.com',
            expiryDate: null,
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
