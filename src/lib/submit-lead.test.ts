import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { submitLead } from './submit-lead';

const leadData = {
  nome: 'Maria Silva',
  telefone: '11999999999',
  email: 'maria@example.com',
  tipoProjeto: 'reforma_residencial' as const,
  mensagem: 'Quero reformar a sala',
  origem: 'Site Saulo Magno | Google Ads',
  gclid: 'gclid-abc',
  utm_source: 'google',
  utm_medium: 'cpc',
  utm_campaign: 'brand',
};

describe('submitLead', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('T24: awaits /api/lead before signaling redirect readiness (order proof)', async () => {
    const order: string[] = [];

    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          order.push('fetch-called');
          queueMicrotask(() => {
            order.push('fetch-resolved');
            resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
          });
        }),
    );

    const done = submitLead(leadData, 'whatsapp').then(() => {
      order.push('submit-returned');
    });

    await done;

    expect(order).toEqual([
      'fetch-called',
      'fetch-resolved',
      'submit-returned',
    ]);
    expect(fetch).toHaveBeenCalledWith(
      '/api/lead',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(leadData),
      }),
    );
  });

  it('T27: whatsapp mode resolves on /api/lead failure and logs the error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetch).mockResolvedValue(
      new Response('upstream boom', { status: 500 }),
    );

    await expect(submitLead(leadData, 'whatsapp')).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    const logged = consoleSpy.mock.calls
      .flat()
      .map((arg) => String(arg))
      .join(' ');
    expect(logged.length).toBeGreaterThan(0);
  });

  it('email mode rejects when /api/lead fails', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('fail', { status: 500 }),
    );

    await expect(submitLead(leadData, 'email')).rejects.toThrow();
  });
});
