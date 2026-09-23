export interface ShortenUrlRequest {
    url: string;
    password?: string; // encoded
    expiryDate?: string | null;
}

export interface ShortenUrlResponse {
    shortCode: string;
}

export interface PaginationResponse {
    items: any[],
    page: number,
    pageSize: number,
    total: number,
    totalPages: number;
}

export async function shortenUrl(
    request: ShortenUrlRequest
): Promise<ShortenUrlResponse> {
    const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
    });

    if(!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? `Request failed with status ${response.status}`);
    }
    return response.json();
}

export async function deleteUrl(id: number): Promise<void> {
    const response = await fetch('/api/url', {
        method: "DELETE",

        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({id})
    });
    if(!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? `Request failed with status ${response.status}`);
    }
}

export async function getUrls(page: number, pageSize: number): Promise<PaginationResponse> {
    const response = await fetch(`/api/urls?page=${page}&pageSize=${pageSize}`);

    if(!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? `Request failed with status ${response.status}`);
    }

    return response.json();

}