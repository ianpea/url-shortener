import request from 'supertest';
import {beforeEach, describe, expect, it} from 'vitest';
import {app} from './app';
import {db} from './db/database';
import {insertUrl} from './db/url';
import {normalizeUrl} from './utils/url';

// supertest talks to `app` directly, so no port is bound and no real server is needed.
beforeEach(() => {
    db.exec("DELETE FROM urls; DELETE FROM sqlite_sequence WHERE name = 'urls';");
});

describe('normalizeUrl', () => {
    it('keeps a url that already has a scheme', () => {
        expect(normalizeUrl('https://example.com')).toBe('https://example.com');
        expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('prefixes a bare domain with https://', () => {
        expect(normalizeUrl('example.com/path')).toBe('https://example.com/path');
    });
});

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

    it('rejects a malformed expiry date', async () => {
        const response = await request(app).post('/api/shorten').send({url: 'abc.com', expiryDate: 'tomorrow'});

        expect(response.status).toBe(400);
        expect(typeof response.body.error).toBe('string');
    });

    it('normalizes a bare domain and stores a future expiry date', async () => {
        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const created = await request(app).post('/api/shorten').send({url: 'abc.com', expiryDate});
        expect(created.status).toBe(201);

        const fetched = await request(app).get(`/api/urls/${created.body.shortCode}`);

        expect(fetched.status).toBe(200);
        expect(fetched.body).toEqual({url: 'https://abc.com', expiryDate, tag: null});
    });

    it('stores an optional trimmed tag and returns it in the URL history', async () => {
        const created = await request(app).post('/api/shorten').send({url: 'abc.com', tag: '  Instagram  '});
        expect(created.status).toBe(201);

        const history = await request(app).get('/api/urls');

        expect(history.body.items[0]).toMatchObject({
            originalUrl: 'https://abc.com',
            tag: 'Instagram',
        });

        const fetched = await request(app).get(`/api/urls/${created.body.shortCode}`);
        expect(fetched.body).toEqual({url: 'https://abc.com', expiryDate: null, tag: 'Instagram'});
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
        expect(response.body).toEqual({expired: true, expiryDate, tag: null});
    });

    it('returns the stored url and expiry date for a valid short code', async () => {
        insertUrl('https://example.com', 'ok12345', null);

        const response = await request(app).get('/api/urls/ok12345');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({url: 'https://example.com', expiryDate: null, tag: null});
    });

    it('returns 400 when the short code is well formed but unknown', async () => {
        const response = await request(app).get('/api/urls/nope123');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Short code not found"});
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

    it('reports total/totalPages and slices the items by pageSize', async () => {
        insertUrl('https://example1.com', 'code001', null);
        insertUrl('https://example2.com', 'code002', null);
        insertUrl('https://example3.com', 'code003', null);

        const page1 = await request(app).get('/api/urls?page=1&pageSize=2');

        expect(page1.status).toBe(200);
        expect(page1.body.total).toBe(3);
        expect(page1.body.totalPages).toBe(2);
        expect(page1.body.items).toHaveLength(2);

        const page2 = await request(app).get('/api/urls?page=2&pageSize=2');

        expect(page2.body.items).toHaveLength(1);
    });

    it('returns an empty page when the offset is past the end', async () => {
        insertUrl('https://example1.com', 'code001', null);

        const response = await request(app).get('/api/urls?page=3&pageSize=5');

        expect(response.body.items).toEqual([]);
    });

    it('returns 400 when page is below the minimum', async () => {
        const response = await request(app).get('/api/urls?page=0');

        expect(response.status).toBe(400);
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

    it('returns 400 when the id does not match a stored url', async () => {
        const response = await request(app).delete('/api/url').send({id: 999});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Unable to delete, please try again."});
    });
});
