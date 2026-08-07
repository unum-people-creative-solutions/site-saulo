type WhatsAppLeadData = {
  nome: string;
  tipoProjeto: string;
  email: string;
  mensagem?: string;
};

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
  return `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
}
