import {afterEach, describe, expect, it, vi} from 'vitest';
import {copyShortUrl, normalizeUrl, validate} from './url';

describe('validate', () => {
    it('returns no error for a valid URL', () => {
        expect(validate('https://example.com')).toBe('');
    });

    it('stays silent while the field is empty', () => {
        expect(validate('')).toBe('');
    });

    it('rejects whitespace-only input', () => {
        expect(validate('   ')).toBe(' Please enter a URL');
    });

    it('rejects URLs containing spaces', () => {
        expect(validate('https://example.com/a b')).toBe('URL cannot contain spaces');
    });
});

describe('normalizeUrl', () => {
    it('keeps an existing http:// prefix', () => {
        expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('keeps an existing https:// prefix', () => {
        expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('uses http:// for localhost', () => {
        expect(normalizeUrl('localhost:3000')).toBe('http://localhost:3000');
    });

    it('defaults everything else to https://', () => {
        expect(normalizeUrl('example.com/path')).toBe('https://example.com/path');
    });
});

describe('copyShortUrl', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('copies an absolute short URL to the clipboard', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal('navigator', {clipboard: {writeText}});

        const shortUrl = await copyShortUrl('abc1234');

        expect(shortUrl).toBe(`${window.location.origin}/abc1234`);
        expect(writeText).toHaveBeenCalledWith(shortUrl);
    });
});
