import {makeRequest} from "@/utils/http";
import type {UrlRecord} from "../../stb-url-shortener-backend/src/db/url";

export interface ShortenUrlRequest {
    url: string;
    password?: string; // encoded
    expiryDate?: string | null;
    tag?: string;
}

export interface ShortenUrlResponse {
    shortCode: string;
}

export interface PaginationResponse {
    items: UrlRecord[],
    page: number,
    pageSize: number,
    total: number,
    totalPages: number;
}

export async function shortenUrl(
    request: ShortenUrlRequest
): Promise<ShortenUrlResponse> {
    return makeRequest<ShortenUrlResponse>("/api/shorten", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(request),
    });
}

export async function deleteUrl(id: number): Promise<void> {
    // Not using makeRequest here: the endpoint answers 201 with an empty body, and
    // makeRequest only skips body parsing for 204, so it would throw SyntaxError.
    const response = await fetch("/api/url", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id}),
    });

    if(!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? `Request failed with status ${response.status}`);
    }
}

export async function getUrls(page: number, pageSize: number): Promise<PaginationResponse> {
    return makeRequest<PaginationResponse>(`/api/urls?page=${page}&pageSize=${pageSize}`);
}
