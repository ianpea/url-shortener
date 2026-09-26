import type {Server} from "node:http";
import type {AddressInfo} from "node:net";
import {db} from "../url-shortener-backend/src/db/database";
import {app} from "../url-shortener-backend/src/app";

let server: Server | undefined;
let baseUrl = "";
let nativeFetch: typeof fetch | undefined;

/**
 * Boots the real Express app on an ephemeral port and rewrites the global `fetch`
 * so the frontend's relative requests ("/api/...") reach it. In Node a relative
 * URL has nothing to resolve against, so without this shim the browser-only
 * request paths used by `src/api/url-api.ts` and `src/utils/http.ts` would throw.
 */
export async function startApi(): Promise<string> {
    server = await new Promise<Server>((resolve) => {
        const listening = app.listen(0, () => resolve(listening));
    });

    const {port} = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;

    nativeFetch ??= globalThis.fetch;
    const original = nativeFetch;

    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
        if(typeof input === "string" && input.startsWith("/")) {
            return original(`${baseUrl}${input}`, init);
        }
        return original(input, init);
    }) as typeof fetch;

    return baseUrl;
}

export async function stopApi(): Promise<void> {
    if(nativeFetch) {
        globalThis.fetch = nativeFetch;
        nativeFetch = undefined;
    }

    if(!server) return;

    const running = server;
    server = undefined;
    await new Promise<void>((resolve, reject) => {
        running.close((error) => (error ? reject(error) : resolve()));
    });
}

/** Wipes the throwaway database so every test starts from a known state. */
export function resetDatabase(): void {
    db.exec("DELETE FROM urls; DELETE FROM sqlite_sequence WHERE name = 'urls';");
}

interface SeedUrlOptions {
    originalUrl: string;
    shortCode: string;
    expiryDate?: string | null;
    createdAt?: string;
}

/**
 * Inserts a row straight into the real database. This exists for states the API
 * itself will not create, e.g. a link whose expiry date is already in the past.
 */
export function seedUrl({
    originalUrl,
    shortCode,
    expiryDate = null,
    createdAt,
}: SeedUrlOptions): number {
    const row = db.prepare(
        `INSERT INTO urls (original_url, short_code, expiry_date, created_at)
         VALUES (?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
         RETURNING id`,
    ).get(originalUrl, shortCode, expiryDate, createdAt ?? null) as {id: number;};

    return row.id;
}
