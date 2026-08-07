import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { ingestLead } from './crm';

const lead = {
  nome: 'Maria Silva',
  telefone: '11999999999',
  email: 'maria@example.com',
  origem: 'Site Saulo Magno | Google Ads',
  gclid: 'abc',
  utm_source: 'google',
  utm_medium: 'cpc',
  utm_campaign: 'brand',
};

describe('ingestLead', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_GATEWAY_URL = 'https://api.example.com';
    process.env.CRM_API_KEY = 'test-crm-key';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('T06: POSTs /ingest with correct headers and body keys', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));

    await ingestLead(lead);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toMatch(/\/ingest$/);
    expect(init?.method).toBe('POST');

    const headers = new Headers(init?.headers);
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('X-API-Key')).toBe('test-crm-key');

    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({
      nome: lead.nome,
      telefone: lead.telefone,
      email: lead.email,
      origem: lead.origem,
    });
  });

  it('T07: rejects when API responds non-2xx', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('error', { status: 500 }),
    );

    await expect(ingestLead(lead)).rejects.toThrow();
  });
});
