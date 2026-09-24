import {beforeEach, describe, expect, it, vi} from 'vitest';
import {CHARACTERS, SHORT_CODE_LEN} from '../constants';
import {generateShortCode} from './short-code';

// `randomInt` is wrapped rather than replaced: the tests that pin exact alphabet
// indices get a predictable code, everything else keeps genuine randomness.
const {randomIntMock} = vi.hoisted(() => ({
    randomIntMock: vi.fn<(max: number) => number>(),
}));

vi.mock('node:crypto', async (importOriginal) => {
    const actual = await importOriginal<typeof import('node:crypto')>();
    randomIntMock.mockImplementation((max) => actual.randomInt(max));
    return {...actual, randomInt: randomIntMock};
});

function pinIndices(indices: number[]): void {
    for(const index of indices) {
        randomIntMock.mockReturnValueOnce(index);
    }
}

describe('generateShortCode', () => {
    it('returns a code whose length matches SHORT_CODE_LEN', () => {
        expect(generateShortCode()).toHaveLength(SHORT_CODE_LEN);
    });

    it('only ever emits characters from the base62 alphabet', () => {
        for(let i = 0; i < 50; i++) {
            for(const char of generateShortCode()) {
                expect(CHARACTERS).toContain(char);
            }
        }
    });

    it('produces a fresh code on each call', () => {
        const codes = new Set(Array.from({length: 100}, () => generateShortCode()));

        expect(codes.size).toBe(100);
    });

    describe('character selection', () => {
        beforeEach(() => {
            randomIntMock.mockClear();
        });

        it('builds the code by indexing into the alphabet', () => {
            pinIndices([0, 1, 2, 3, 4, 5, 6]);

            expect(generateShortCode()).toBe('0123456');
        });

        it('asks for one value below the alphabet length per character', () => {
            pinIndices(Array.from({length: SHORT_CODE_LEN}, () => 0));

            expect(generateShortCode()).toBe('0'.repeat(SHORT_CODE_LEN));
            expect(randomIntMock).toHaveBeenCalledTimes(SHORT_CODE_LEN);
            expect(randomIntMock).toHaveBeenCalledWith(CHARACTERS.length);
        });
    });
});
