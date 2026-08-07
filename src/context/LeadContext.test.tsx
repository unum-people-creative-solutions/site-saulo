import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LeadProvider, useLead } from './LeadContext';

function setSearch(search: string) {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, search, href: `http://localhost/${search}` },
    writable: true,
    configurable: true,
  });
}

function Probe() {
  const { params } = useLead();
  return (
    <div>
      <span data-testid="gclid">{params.gclid ?? ''}</span>
      <span data-testid="utm_source">{params.utm_source ?? ''}</span>
      <span data-testid="utm_medium">{params.utm_medium ?? ''}</span>
    </div>
  );
}

describe('LeadContext / useLead (T05)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setSearch('');
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    setSearch('');
  });

  it('captures URL params, persists to sessionStorage, and survives remount without query', async () => {
    setSearch('?gclid=abc&utm_source=google&utm_medium=cpc');

    const { unmount } = render(
      <LeadProvider>
        <Probe />
      </LeadProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('gclid')).toHaveTextContent('abc');
    });
    expect(screen.getByTestId('utm_source')).toHaveTextContent('google');
    expect(screen.getByTestId('utm_medium')).toHaveTextContent('cpc');

    const stored = window.sessionStorage.getItem('saulo:tracking');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.gclid).toBe('abc');
    expect(parsed.utm_source).toBe('google');
    expect(parsed.utm_medium).toBe('cpc');
    expect(parsed).not.toHaveProperty('nome');
    expect(parsed).not.toHaveProperty('telefone');
    expect(parsed).not.toHaveProperty('email');

    unmount();
    setSearch('');

    render(
      <LeadProvider>
        <Probe />
      </LeadProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('gclid')).toHaveTextContent('abc');
    });
    expect(screen.getByTestId('utm_source')).toHaveTextContent('google');
    expect(screen.getByTestId('utm_medium')).toHaveTextContent('cpc');
  });
});
