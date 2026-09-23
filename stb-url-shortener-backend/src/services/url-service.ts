import {insertUrl, UrlRecord} from "../db/url";
import {generateShortCode} from "../utils/short-code";

const MAX_RETRIES = 3;

function isUniqueConstraintError(error: unknown): boolean {
    return (
        error instanceof Error &&
        "code" in error &&
        error.code === "SQLITE_CONSTRAINT_UNIQUE"
    );
}

export function generateShortUrl(originalUrl: string, expiryDate: string | undefined): UrlRecord | undefined {
    for(let i = 0; i < MAX_RETRIES; i++) {
        const shortCode = generateShortCode();
        try {
            const urlRecord = insertUrl(originalUrl, shortCode, expiryDate ?? null);
            return urlRecord;
        } catch(error) {
            if(!isUniqueConstraintError(error)) {
                throw error;
            }
        }
    }

    throw new Error("Failed to generate unique short code");
}