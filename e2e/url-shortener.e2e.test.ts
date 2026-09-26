import {afterAll, beforeAll, beforeEach, describe, expect, it} from "vitest";
import {deleteUrl, getUrls, shortenUrl} from "@/api/url-api";
import {ApiError, makeRequest} from "@/utils/http";
import {resetDatabase, seedUrl, startApi, stopApi} from "./harness";

interface UrlLookupResponse {
    url: string;
    expiryDate: string | null;
}

/**
 * The exact request `RedirectPage` makes when it resolves a short code, so the
 * lookup half of these flows runs through the same `makeRequest`/`ApiError` path
 * the UI uses.
 */
function lookupUrl(shortCode: string) {
    return makeRequest<UrlLookupResponse>(`/api/urls/${shortCode}`);
}

/** Runs the request and returns the failure, failing the test if it resolved. */
async function captureApiError(run: () => Promise<unknown>): Promise<ApiError> {
    const error = await run().then(
        () => undefined,
        (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);
    return error as ApiError;
}

beforeAll(async () => {
    await startApi();
});

afterAll(async () => {
    await stopApi();
});

beforeEach(() => {
    resetDatabase();
});

describe("shorten then resolve", () => {
    it("round-trips a url through the api and back out of the lookup", async () => {
        const {shortCode} = await shortenUrl({url: "example.com/some/long/path"});

        expect(shortCode).toHaveLength(7);

        await expect(lookupUrl(shortCode)).resolves.toEqual({
            url: "https://example.com/some/long/path",
            tag: null,
            expiryDate: null,
        });
    });

    it("keeps a future expiry date attached to the short code", async () => {
        const expiryDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        const {shortCode} = await shortenUrl({url: "https://example.com/expiring", expiryDate});

        await expect(lookupUrl(shortCode)).resolves.toEqual({
            url: "https://example.com/expiring",
            tag: null,
            expiryDate,
        });
    });

    it("reports an unparseable url as a 400 ApiError", async () => {
        const error = await captureApiError(() => shortenUrl({url: "not a url"}));

        expect(error.status).toBe(400);
        expect(error.message).toBe("Invalid URL");
        expect(error.body).toHaveProperty("error");
    });
});

describe("resolve failures", () => {
    it("returns 400 for a well-formed short code that was never issued", async () => {
        const error = await captureApiError(() => lookupUrl("zzzzzzz"));

        expect(error.status).toBe(400);
        expect(error.message).toBe("Short code not found");
    });

    it("returns 400 for a short code that is not exactly 7 characters", async () => {
        const error = await captureApiError(() => lookupUrl("abc"));

        expect(error.status).toBe(400);
        expect(error.message).toBe("Invalid short code");
    });

    it("labels an expired link through the error body instead of a generic failure", async () => {
        const expiryDate = "1999-01-01T00:00:00.000Z";
        seedUrl({originalUrl: "https://example.com/expired", shortCode: "exp1234", expiryDate});

        const error = await captureApiError(() => lookupUrl("exp1234"));

        expect(error.status).toBe(400);
        expect(error.body).toEqual({expired: true, expiryDate, tag: null});
    });
    it("rejects localhost url", async () => {
        const error = await captureApiError(() => shortenUrl({url: "localhost:5173/path1"}));
        expect(error.message).toBe("Invalid URL");
    });

    it("rejects a pageSize above the allowed maximum of 100", async () => {
        const error = await captureApiError(() => getUrls(1, 101));
        expect(error.message).toBe('Unable to retrieve history, please try again.');
    });
});

describe("history listing", () => {
    it("includes a freshly shortened url", async () => {
        const {shortCode} = await shortenUrl({url: "https://example.com/one"});

        const history = await getUrls(1, 5);

        expect(history).toMatchObject({page: 1, pageSize: 5, total: 1, totalPages: 1});
        expect(history.items.map((item) => item.shortCode)).toEqual([shortCode]);
        expect(history.items[0]).toMatchObject({originalUrl: "https://example.com/one", expiryDate: null});
    });

    it("orders the newest urls first and pages through them", async () => {
        // Seeded with explicit timestamps: created_at only has second precision,
        // so rows written by the API in the same second would tie.
        seedUrl({originalUrl: "https://example.com/oldest", shortCode: "oldest1", createdAt: "2024-01-01 00:00:00"});
        seedUrl({originalUrl: "https://example.com/middle", shortCode: "middle1", createdAt: "2024-02-01 00:00:00"});
        seedUrl({originalUrl: "https://example.com/newest", shortCode: "newest1", createdAt: "2024-03-01 00:00:00"});

        const firstPage = await getUrls(1, 2);

        expect(firstPage).toMatchObject({page: 1, pageSize: 2, total: 3, totalPages: 2});
        expect(firstPage.items.map((item) => item.shortCode)).toEqual(["newest1", "middle1"]);

        const secondPage = await getUrls(2, 2);

        expect(secondPage.items.map((item) => item.shortCode)).toEqual(["oldest1"]);
    });
});

describe("delete flow", () => {
    it("hides a soft deleted url from both the lookup and the history", async () => {
        const {shortCode} = await shortenUrl({url: "https://example.com/to-delete"});
        const [{id}] = (await getUrls(1, 5)).items;

        await deleteUrl(id);

        const error = await captureApiError(() => lookupUrl(shortCode));
        expect(error.status).toBe(400);
        expect(error.message).toBe("Short code not found");

        expect((await getUrls(1, 5)).total).toBe(0);
    });
});

