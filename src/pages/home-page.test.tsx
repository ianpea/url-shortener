import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {HomePage} from './home-page';
import {shortenUrl} from '@/api/url-api';

vi.mock('@/api/url-api', () => ({
    shortenUrl: vi.fn(),
    deleteUrl: vi.fn(),
    getUrls: vi.fn().mockResolvedValue({items: [], page: 1, pageSize: 10, total: 0, totalPages: 0}),
}));

function renderHomePage() {
    const queryClient = new QueryClient({
        defaultOptions: {queries: {retry: false}},
    });
    render(
        <QueryClientProvider client={queryClient}>
            <HomePage />
        </QueryClientProvider>,
    );
    return userEvent.setup();
}

describe('HomePage validation feedback', () => {
    it('shows the error on submit', async () => {
        const user = renderHomePage();

        await user.type(screen.getByPlaceholderText('https://www.example.com'), 'https://example.com/a b');
        await user.click(screen.getByRole('button', {name: /Shorten/i}));

        expect(await screen.findByText('URL cannot contain spaces')).toBeInTheDocument();
    });

    it('clears the error once the value changes', async () => {
        const user = renderHomePage();

        const input = screen.getByPlaceholderText('https://www.example.com');
        await user.type(input, 'https://example.com/a b');
        await user.click(screen.getByRole('button', {name: /Shorten/i}));
        expect(await screen.findByText('URL cannot contain spaces')).toBeInTheDocument();

        await user.type(input, 'c');

        await waitFor(() => {
            expect(screen.queryByText('URL cannot contain spaces')).not.toBeInTheDocument();
        });
    });

    it('shows the tag toggle before expiry and submits the optional tag', async () => {
        vi.mocked(shortenUrl).mockResolvedValue({shortCode: 'abc1234'});
        const user = renderHomePage();
        const tagToggle = screen.getByRole('button', {name: 'Toggle tag'});
        const expiryToggle = screen.getByRole('button', {name: 'Toggle expiry'});

        expect(tagToggle.compareDocumentPosition(expiryToggle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

        await user.click(tagToggle);
        await user.click(expiryToggle);
        const tagInput = screen.getByLabelText('Tag');
        const expiryInput = screen.getByRole('button', {name: /Expiry date/i});
        expect(tagInput.compareDocumentPosition(expiryInput) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

        await user.type(tagInput, 'Instagram');
        await user.type(screen.getByPlaceholderText('https://www.example.com'), 'https://example.com/a/long/destination/path');
        await user.click(screen.getByRole('button', {name: /Shorten my link/i}));

        await waitFor(() => expect(shortenUrl).toHaveBeenCalledWith(
            expect.objectContaining({tag: 'Instagram'}),
            expect.anything(),
        ));
    });
});
