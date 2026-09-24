import {afterEach, describe, expect, it, vi} from 'vitest';
import {ApiError, makeRequest} from './http';

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {'Content-Type': 'application/json'},
    });
}

/** Asserts the promise rejects with an ApiError and hands it back for further checks. */
async function expectApiError(promise: Promise<unknown>): Promise<ApiError> {
    try {
        await promise;
    } catch(error) {
        expect(error).toBeInstanceOf(ApiError);
        return error as ApiError;
    }
    throw new Error('Expected makeRequest to reject, but it resolved');
}

describe('makeRequest', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns the parsed JSON body on success', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({shortCode: 'abc1234'})));

        await expect(makeRequest('/api/shorten')).resolves.toEqual({shortCode: 'abc1234'});
    });

    it('resolves with undefined on 204 No Content', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, {status: 204})));

        await expect(makeRequest('/api/url')).resolves.toBeUndefined();
    });

    it('surfaces the server error message from a JSON body', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({error: 'Code already taken'}, 409)));

        const error = await expectApiError(makeRequest('/api/shorten'));

        expect(error.message).toBe('Code already taken');
        expect(error.status).toBe(409);
        expect(error.body).toEqual({error: 'Code already taken'});
        expect(error.isNetworkError).toBe(false);
    });

    it('falls back to a generic message when the error body is not JSON', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>oops</html>', {status: 500})));

        const error = await expectApiError(makeRequest('/api/urls'));

        expect(error.message).toBe('Something went wrong on our end. Please try again.');
        expect(error.status).toBe(500);
    });

    it('reports 4xx failures without a JSON body by status', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json', {status: 404})));

        const error = await expectApiError(makeRequest('/api/urls'));

        expect(error.message).toBe('Request failed with status 404');
    });

    it('wraps fetch rejections in a network ApiError', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

        const error = await expectApiError(makeRequest('/api/urls'));

        expect(error.isNetworkError).toBe(true);
        expect(error.message).toBe('Network error, please check your connection.');
    });
});
