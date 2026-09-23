export function validate(value: string): string {
    if(value.length == 0) return '';
    if(!value.trim()) return ' Please enter a URL';
    if(value.includes(' ')) return 'URL cannot contain spaces';
    return '';
}

export async function copyShortUrl(shortCode: string): Promise<string> {
    const shortUrl = `${window.location.origin}/${shortCode}`;
    await navigator.clipboard.writeText(shortUrl);
    return shortUrl;
}

/**
 * Normalize a URL from without http:// or https://, to one with either one.
 * Shared code with same backend function - normalizeUrl.
 * @returns The normalized URL.
 */
export function normalizeUrl(url: string): string {
    if(url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    if(url.startsWith("localhost")) {
        return `http://${url}`;
    }

    return `https://${url}`;
}