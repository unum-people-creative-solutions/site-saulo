import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CookieBanner } from './CookieBanner';

const CONSENT_KEY = 'saulo:cookie-consent';

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('shows when no consent, persists accept, and stays hidden after remount', async () => {
    const user = userEvent.setup();

    const { unmount } = render(<CookieBanner />);

    expect(
      await screen.findByRole('heading', { name: 'Configuração de Cookies' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Fechar aviso de cookies' }),
    ).toBeInTheDocument();

    const accept = screen.getByRole('button', { name: 'Aceitar' });
    expect(accept).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Configurar' }),
    ).not.toBeInTheDocument();

    await user.click(accept);

    expect(localStorage.getItem(CONSENT_KEY)).toBeTruthy();

    unmount();
    render(<CookieBanner />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Aceitar' })).toBeNull();
    });
  });
});
