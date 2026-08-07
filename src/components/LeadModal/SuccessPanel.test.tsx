import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SuccessPanel } from './SuccessPanel';

describe('SuccessPanel', () => {
  it('renders thank-you message and Fechar calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<SuccessPanel onClose={onClose} />);

    expect(
      screen.getByText(
        'Recebemos sua mensagem! Entraremos em contato em até 24 horas.',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
