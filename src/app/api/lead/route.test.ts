import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/crm', () => ({
  ingestLead: vi.fn(),
}));

import { ingestLead } from '@/lib/crm';
import { POST } from './route';

const validBody = {
  nome: 'Maria Silva',
  telefone: '11999999999',
  email: 'maria@example.com',
  tipoProjeto: 'reforma_residencial',
  mensagem: 'Quero reformar a sala',
  origem: 'Site Saulo Magno | Google Ads',
  gclid: 'gclid-abc',
  utm_source: 'google',
  utm_medium: 'cpc',
  utm_campaign: 'brand',
};

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/lead', () => {
  beforeEach(() => {
    vi.mocked(ingestLead).mockReset();
    vi.mocked(ingestLead).mockResolvedValue(undefined);
  });

  it('T30: calls ingestLead with validated fields and never leaks CRM_API_KEY or upstream body', async () => {
    const upstreamLeak =
      'upstream raw body CRM_API_KEY=super-secret-key internal stack';
    vi.mocked(ingestLead).mockRejectedValueOnce(new Error(upstreamLeak));

    const response = await POST(makeRequest(validBody));
    const text = await response.text();

    expect(ingestLead).toHaveBeenCalledOnce();
    expect(ingestLead).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: validBody.nome,
        telefone: validBody.telefone,
        email: validBody.email,
        origem: validBody.origem,
        gclid: validBody.gclid,
        utm_source: validBody.utm_source,
        utm_medium: validBody.utm_medium,
        utm_campaign: validBody.utm_campaign,
      }),
    );

    expect(response.status).toBe(502);
    expect(text).not.toContain('CRM_API_KEY');
    expect(text).not.toContain('super-secret-key');
    expect(text).not.toContain('upstream raw body');
    expect(text).not.toContain(upstreamLeak);
  });

  it('T30b: returns 200 and forwards tracking fields on success', async () => {
    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(200);
    expect(ingestLead).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Maria Silva',
        origem: validBody.origem,
        gclid: 'gclid-abc',
        utm_source: 'google',
      }),
    );
  });

  it('T30c: does not call ingestLead when body fails leadSchema', async () => {
    const response = await POST(
      makeRequest({ ...validBody, nome: 'Maria', email: 'not-an-email' }),
    );

    expect(response.status).toBe(400);
    expect(ingestLead).not.toHaveBeenCalled();
  });
});
