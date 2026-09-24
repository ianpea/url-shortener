import {describe, expect, it} from 'vitest';
import {generateShortCode} from './short-code';
import {CHARACTERS} from '../constants';

describe('generateShortCode', () => {
    it('returns a 7 character code built from base62 characters', () => {
        const code = generateShortCode();

        expect(code).toHaveLength(7);
        expect(code).toMatch(/^[0-9A-Za-z]{7}$/);
    });

    it('only ever emits characters from the base62 alphabet', () => {
        const code = generateShortCode();
        for(const char of code) {
            expect(CHARACTERS).toContain(char);
        }
    });
});
