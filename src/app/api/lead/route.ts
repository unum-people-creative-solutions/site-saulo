import { NextResponse } from 'next/server';

import { ingestLead } from '@/lib/crm';
import { leadSchema } from '@/lib/lead-schema';

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body === null || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const parsed = leadSchema.safeParse(record);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid lead data' }, { status: 400 });
  }

  const origem = optionalString(record.origem);
  if (!origem) {
    return NextResponse.json({ error: 'Invalid lead data' }, { status: 400 });
  }

  try {
    await ingestLead({
      nome: parsed.data.nome,
      telefone: parsed.data.telefone,
      email: parsed.data.email,
      origem,
      gclid: optionalString(record.gclid),
      utm_source: optionalString(record.utm_source),
      utm_medium: optionalString(record.utm_medium),
      utm_campaign: optionalString(record.utm_campaign),
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to process lead' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
