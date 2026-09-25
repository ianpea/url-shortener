import {act, render, screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {RedirectPage} from './redirect-page';
import {formatExpiry} from '@/utils/date';

const SHORT_CODE = 'abc1234';
const ORIGINAL_URL = 'https://example.com/a-very-long-page';
const EXPIRY_DATE = '2027-01-02T03:04:05.000Z';
const REDIRECT_DELAY_MS = 3000;

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {'Content-Type': 'application/json'},
    });
}

function renderRedirectPage(initialEntry = `/${SHORT_CODE}`) {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path='/:shortCode' element={<RedirectPage />} />
            </Routes>
        </MemoryRouter>,
    );
}

/** Counts the loading placeholders rendered by the page. */
function skeletonCount(container: HTMLElement) {
    return container.querySelectorAll('[data-slot="skeleton"]').length;
}

/**
 * jsdom makes `window.location` (and its `href`) non-configurable, so it cannot be
 * replaced or spied on like a normal global. Assigning `window.location.href` ends up
 * in the setter of jsdom's internal Location implementation, so we intercept that one
 * instead and record whatever the page tried to navigate to.
 */
function captureLocationHref() {
    const locationImpl = (window as unknown as {_document: {_location: {href: string;};};})._document._location;
    const navigated: string[] = [];

    vi.spyOn(locationImpl, 'href', 'set').mockImplementation((value: string) => {
        navigated.push(value);
    });

    return navigated;
}

describe('RedirectPage', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('shows the destination url it fetched for the short code', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({url: ORIGINAL_URL, expiryDate: EXPIRY_DATE}));

        renderRedirectPage();

        expect(await screen.findByText(ORIGINAL_URL)).toBeInTheDocument();
        expect(fetch).toHaveBeenCalledWith(`/api/urls/${SHORT_CODE}`, undefined);
        expect(screen.getByText('Redirecting you to...')).toBeInTheDocument();
        expect(screen.getByText(`Expires at ${formatExpiry(EXPIRY_DATE)}`)).toBeInTheDocument();
        expect(screen.queryByText(/URL expired/)).not.toBeInTheDocument();
    });

    it('shows placeholders while the lookup is still in flight', async () => {
        let resolveFetch: (response: Response) => void = () => { };
        vi.mocked(fetch).mockReturnValue(new Promise<Response>((resolve) => {
            resolveFetch = resolve;
        }));

        const {container} = renderRedirectPage();

        expect(skeletonCount(container)).toBe(2);
        expect(screen.queryByText(ORIGINAL_URL)).not.toBeInTheDocument();

        await act(async () => {
            resolveFetch(jsonResponse({url: ORIGINAL_URL, expiryDate: EXPIRY_DATE}));
        });

        expect(screen.getByText(ORIGINAL_URL)).toBeInTheDocument();
        expect(screen.getByText(`Expires at ${formatExpiry(EXPIRY_DATE)}`)).toBeInTheDocument();
    });

    it('redirects to the destination once the 3 second delay has passed', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({url: ORIGINAL_URL, expiryDate: EXPIRY_DATE}));
        const navigated = captureLocationHref();
        const setTimeoutSpy = vi.spyOn(window, 'setTimeout');

        renderRedirectPage();

        expect(await screen.findByText(ORIGINAL_URL)).toBeInTheDocument();

        const call = setTimeoutSpy.mock.calls.find(([, delay]) => delay === REDIRECT_DELAY_MS);
        expect(call).toBeDefined();
        expect(navigated).toEqual([]);

        (call![0] as () => void)();

        expect(navigated).toEqual([ORIGINAL_URL]);
    });

    it('shows the expired notice and never redirects when the link has expired', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({expired: true, expiryDate: EXPIRY_DATE}, 400));
        const navigated = captureLocationHref();
        const setTimeoutSpy = vi.spyOn(window, 'setTimeout');

        renderRedirectPage();

        expect(await screen.findByText(/URL expired, create a new one/)).toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'here'})).toHaveAttribute('href', '/');
        expect(screen.getByText(`Expired at ${formatExpiry(EXPIRY_DATE)}`)).toBeInTheDocument();
        expect(screen.queryByText('Redirecting you to...')).not.toBeInTheDocument();

        expect(setTimeoutSpy.mock.calls.some(([, delay]) => delay === REDIRECT_DELAY_MS)).toBe(false);
        expect(navigated).toEqual([]);
    });

    it('reports an unknown short code instead of hanging on the lookup', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({error: 'Short code not found'}, 400));
        const navigated = captureLocationHref();
        const setTimeoutSpy = vi.spyOn(window, 'setTimeout');

        const {container} = renderRedirectPage();

        expect(await screen.findByText('Unable to open that link.')).toBeInTheDocument();
        expect(screen.getByText('Short code not found')).toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'here'})).toHaveAttribute('href', '/');
        expect(screen.queryByText('Redirecting you to...')).not.toBeInTheDocument();
        expect(skeletonCount(container)).toBe(0);

        expect(setTimeoutSpy.mock.calls.some(([, delay]) => delay === REDIRECT_DELAY_MS)).toBe(false);
        expect(navigated).toEqual([]);
    });

    it('reports a network failure', async () => {
        vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));
        const navigated = captureLocationHref();

        renderRedirectPage();

        expect(await screen.findByText('Unable to open that link.')).toBeInTheDocument();
        expect(screen.getByText('Network error, please check your connection.')).toBeInTheDocument();
        expect(navigated).toEqual([]);
    });

    it('falls back to a generic message when the error body is not JSON', async () => {
        vi.mocked(fetch).mockResolvedValue(new Response('<html>oops</html>', {status: 500}));

        renderRedirectPage();

        expect(await screen.findByText('Something went wrong on our end. Please try again.')).toBeInTheDocument();
        expect(screen.queryByText('Redirecting you to...')).not.toBeInTheDocument();
    });

    it('does not look anything up when the route has no short code', async () => {
        render(
            <MemoryRouter>
                <RedirectPage />
            </MemoryRouter>,
        );

        await act(async () => { });

        expect(fetch).not.toHaveBeenCalled();
        expect(screen.queryByText(ORIGINAL_URL)).not.toBeInTheDocument();
    });
});
