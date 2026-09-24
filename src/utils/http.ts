export class ApiError extends Error {
    readonly status?: number;
    readonly body?: unknown;
    constructor (
        message: string, status?: number, body?: unknown
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.body = body;
    }

    get isNetworkError() {
        return this.status === undefined;
    }
}

export async function makeRequest<T>(
    input: string,
    init?: RequestInit,
): Promise<T> {
    let response: Response;

    try {
        response = await fetch(input, init);
    } catch {
        throw new ApiError(
            "Network error, please check your connection.",
        );
    }

    if(!response.ok) {
        const {message, body} = await parseError(response);
        throw new ApiError(message, response.status, body);
    }

    if(response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

async function parseError(response: Response) {
    try {
        const body = await response.json();

        return {
            message:
                typeof body?.error === "string"
                    ? body.error
                    : `Request failed with status ${response.status}`,
            body,
        };
    } catch {
        return {
            message:
                response.status >= 500
                    ? "Something went wrong on our end. Please try again."
                    : `Request failed with status ${response.status}`,
        };
    }
}