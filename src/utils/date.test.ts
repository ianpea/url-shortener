import {describe, expect, it} from 'vitest';
import {formatExpiry} from './date';

describe('formatExpiry', () => {
    it('renders a date as dd/MM/yyyy HH:mm in local time', () => {
        // Local-time constructor keeps the expectation timezone-independent.
        expect(formatExpiry(new Date(2027, 0, 2, 3, 4, 5))).toBe('02/01/2027 03:04');
    });

    it('uses 24-hour time and zero-pads every part', () => {
        expect(formatExpiry(new Date(2026, 8, 9, 23, 5, 0))).toBe('09/09/2026 23:05');
    });

    it('accepts an ISO string', () => {
        expect(formatExpiry(new Date(2027, 0, 2, 3, 4).toISOString())).toBe('02/01/2027 03:04');
    });

    it('returns an empty string for missing or invalid input', () => {
        expect(formatExpiry(null)).toBe('');
        expect(formatExpiry(undefined)).toBe('');
        expect(formatExpiry('not-a-date')).toBe('');
    });
});
