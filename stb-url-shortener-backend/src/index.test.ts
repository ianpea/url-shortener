import request from 'supertest';
import {describe, expect, it} from 'vitest';
import {insertUrl} from './db/url';
import {app} from './index';

// supertest talks to `app` directly, so no port is bound and no real server is needed.
describe('POST /api/shorten', () => {
    it('returns 400 when the url is not a valid web url', async () => {
        const response = await request(app).post('/api/shorten').send({url: 'not a url'});

        expect(response.status).toBe(400);
        expect(typeof response.body.error).toBe('string');
    });

    it('shortens a valid url: 201 with a 7 character shortCode', async () => {
        const response = await request(app).post('/api/shorten').send({url: 'abc.com'});

        expect(response.status).toBe(201);
        expect(response.body).toEqual({shortCode: expect.any(String)});
        expect(response.body.shortCode).toHaveLength(7);
    });
    it('rejects an expiry date that is already in the past', async () => {
        const past = new Date();
        past.setFullYear(1999);
        const response = await request(app).post('/api/shorten').send({url: 'abc.com', expiryDate: past.toISOString()});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Expiry date must be in the future"});
        expect(response.body.shortCode).toBeUndefined();
    });
});

describe('GET /api/urls/:shortCode', () => {
    it('returns 400 for a short code that is not exactly 7 characters', async () => {
        const response = await request(app).get('/api/urls/ahsdh123');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Invalid short code"});
    });
    it('returns 400 with {expired: true} once the expiry date has passed', async () => {
        const expiryDate = '1999-01-01T00:00:00.000Z';
        insertUrl('https://example.com', 'exp1234', expiryDate);

        const response = await request(app).get('/api/urls/exp1234');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({expired: true, expiryDate});
    });
});

describe('GET /api/urls', () => {
    // req.query values are strings, so this covers the coercion in paginationSchema.
    it('falls back to page 1 and pageSize 5 when no query is given', async () => {
        const response = await request(app).get('/api/urls');

        expect(response.body.page).toEqual(1);
        expect(response.body.pageSize).toEqual(5);
    });

    it('returns 400 when pageSize is above the allowed maximum', async () => {
        const response = await request(app).get('/api/urls?page=1&pageSize=101');
        expect(response.body).toEqual({error: "Unable to retrieve history, please try again."});
    });
});

describe('DELETE /api/url', () => {
    it('returns 400 when the body has no numeric id', async () => {
        const response = await request(app).delete('/api/url').send({});
        expect(response.body).toEqual({error: "Invalid input: expected number, received undefined"});
    });
    it('returns 201 when a url was deleted', async () => {
        insertUrl('https://example1.com', 'shortCode1', '');
        const response = await request(app).delete('/api/url').send({id: 1});
        expect(response.status).toBe(201);
    });
});
