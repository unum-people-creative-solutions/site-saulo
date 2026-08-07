import 'server-only';

export type LeadData = {
  nome: string;
  telefone: string;
  email?: string;
  origem: string;
  gclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export async function ingestLead(data: LeadData): Promise<void> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? '').replace(
    /\/+$/,
    '',
  );
  const url = `${baseUrl}/ingest`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.CRM_API_KEY ?? '',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`CRM ingest failed with status ${response.status}`);
  }
}
