import type { LeadFormData } from '@/lib/lead-schema';

export type SubmitLeadInput = LeadFormData & {
  origem: string;
  gclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export async function submitLead(
  data: SubmitLeadInput,
  mode: 'email' | 'whatsapp',
): Promise<void> {
  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Lead submission failed with status ${response.status}`);
    }
  } catch (error) {
    if (mode === 'whatsapp') {
      console.error('Lead submission failed before WhatsApp redirect', error);
      return;
    }
    throw error;
  }
}
