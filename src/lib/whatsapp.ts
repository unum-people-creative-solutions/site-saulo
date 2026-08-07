import { siteWhatsAppNumber } from '@/content/site';

type WhatsAppLeadData = {
  nome: string;
  tipoProjeto: string;
  email: string;
  mensagem?: string;
};

/** Prefer env override; fall back to the public office number in `siteContacts`. */
export function resolveWhatsAppNumber(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const digits = (fromEnv && fromEnv.length > 0 ? fromEnv : siteWhatsAppNumber).replace(
    /\D/g,
    '',
  );

  if (digits.length < 10) {
    throw new Error('WhatsApp number is not configured');
  }

  return digits;
}

export function buildWhatsAppUrl(data: WhatsAppLeadData): string {
  const lines = [
    `Olá, Saulo! Sou ${data.nome}.`,
    `Tipo de projeto: ${data.tipoProjeto}`,
    `E-mail: ${data.email}`,
  ];

  const mensagem = data.mensagem?.trim();
  if (mensagem) {
    lines.push(mensagem);
  }

  const texto = lines.join('\n');
  return `https://wa.me/${resolveWhatsAppNumber()}?text=${encodeURIComponent(texto)}`;
}
