import {beforeEach, describe, expect, it, vi} from 'vitest';
import {insertUrl, type UrlRecord} from '../db/url';
import {generateShortCode} from '../utils/short-code';
import {createShortUrl} from './url-service';

// The service is pure orchestration, so the database and the code generator are stubbed.
vi.mock('../db/url', () => ({insertUrl: vi.fn()}));
vi.mock('../utils/short-code', () => ({generateShortCode: vi.fn()}));

const insertUrlMock = vi.mocked(insertUrl);
const generateShortCodeMock = vi.mocked(generateShortCode);
function uniqueConstraintError(): Error {
    return Object.assign(new Error('UNIQUE constraint failed: urls.short_code'), {
        code: 'SQLITE_CONSTRAINT_UNIQUE',
    });
}

const record: UrlRecord = {
    id: 1,
    shortCode: 'abc1234',
    originalUrl: 'https://example.com',
    createdAt: '2026-01-01 00:00:00',
    expiryDate: '2030-01-01T00:00:00.000Z',
};

describe('generateShortUrl', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('saves the url with the generated code and returns the inserted record', () => {
        generateShortCodeMock.mockReturnValue('abc1234');
        insertUrlMock.mockReturnValue(record);

        const result = createShortUrl('https://example.com', '2030-01-01T00:00:00.000Z');

        expect(result).toBe(record);
        expect(insertUrlMock).toHaveBeenCalledWith('https://example.com', 'abc1234', '2030-01-01T00:00:00.000Z');
    });

    it('rethrows any error that is not a unique constraint violation', () => {
        generateShortCodeMock.mockReturnValue('abc1234');
        insertUrlMock.mockImplementation(() => {
            throw new Error('disk is on fire');
        });

        expect(() => createShortUrl("https://example.com", undefined)).toThrow('disk is on fire');
        expect(insertUrlMock).toHaveBeenCalledTimes(1);
    });
    it('gives up and throws after MAX_RETRIES collisions', () => {
        generateShortCodeMock.mockReturnValue('aaaaaaa');
        insertUrlMock.mockImplementation(() => {
            throw uniqueConstraintError();
        });

        expect(() => createShortUrl('https://example.com', undefined)).toThrow('Failed to generate unique short code');
        expect(insertUrlMock).toHaveBeenCalledTimes(3); // MAX_RETRIES
    });
    it('passes null as the expiry date when none was provided', () => {
        generateShortCodeMock.mockReturnValue('abc1234');
        insertUrlMock.mockReturnValue(record);

        const result = createShortUrl('https://example.com', undefined);

        expect(result).toBe(record);
        expect(insertUrlMock).toHaveBeenCalledWith('https://example.com', 'abc1234', null);
    });
});
