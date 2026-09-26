import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentProps} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {UrlInput} from './url-input';

function renderUrlInput(props: Partial<ComponentProps<typeof UrlInput>> = {}) {
    const onChange = vi.fn();
    render(
        <UrlInput value="" onChange={onChange} {...props} />
    );
    return {onChange};
}

describe('UrlInput', () => {
    it('renders the label and the provided placeholder', () => {
        renderUrlInput({placeholder: 'https://www.example.com'});

        expect(screen.getByText('Enter your destination link')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'https://www.example.com');
    });

    it('falls back to the default placeholder', () => {
        renderUrlInput();

        expect(screen.getByPlaceholderText('Enter a URL')).toBeInTheDocument();
    });

    it('focuses the input when autoFocus is set', () => {
        renderUrlInput({autoFocus: true});

        expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('emits typed characters through onChange', async () => {
        const user = userEvent.setup();
        const {onChange} = renderUrlInput();

        await user.type(screen.getByPlaceholderText('Enter a URL'), 'abc');

        expect(onChange).toHaveBeenCalledTimes(3);
        expect(onChange).toHaveBeenLastCalledWith('c');
    });
});
