import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentProps} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {StbAlertDialog} from './stb-alert-dialog';

function renderDialog(props: Partial<ComponentProps<typeof StbAlertDialog>> = {}) {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
        <StbAlertDialog
            open
            title="Shortened URL is longer"
            description={<div>The generated URL will be longer.</div>}
            onConfirm={onConfirm}
            onClose={onClose}
            {...props}
        />,
    );
    return {onConfirm, onClose};
}

describe('StbAlertDialog', () => {
    it('renders the title, description and default actions when open', () => {
        renderDialog();

        expect(screen.getByText('Shortened URL is longer')).toBeInTheDocument();
        expect(screen.getByText('The generated URL will be longer.')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Continue/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Cancel/i})).toBeInTheDocument();
    });

    it('calls onConfirm and onClose from their buttons', async () => {
        const user = userEvent.setup();
        const {onConfirm, onClose} = renderDialog();

        await user.click(screen.getByRole('button', {name: /Continue/i}));
        expect(onConfirm).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole('button', {name: /Cancel/i}));
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });
});
