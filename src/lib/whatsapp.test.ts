import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildWhatsAppUrl } from './whatsapp';

describe('buildWhatsAppUrl', () => {
  const number = '5511999999999';

  beforeEach(() => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = number;
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  });

  it('T25: URL contains configured number and decoded text has nome, tipoProjeto, email', () => {
    const url = buildWhatsAppUrl({
      nome: 'Maria Silva',
      tipoProjeto: 'reforma residencial',
      email: 'maria@example.com',
    });

    expect(url.startsWith(`https://wa.me/${number}?text=`)).toBe(true);

    const text = decodeURIComponent(url.split('?text=')[1]!);
    expect(text).toContain('Maria Silva');
    expect(text).toContain('reforma residencial');
    expect(text).toContain('maria@example.com');
  });

  it('T25: encodeURIComponent preserves accented names', () => {
    const url = buildWhatsAppUrl({
      nome: 'João Ferreira',
      tipoProjeto: 'construção residencial',
      email: 'joao@example.com',
      mensagem: 'Quero orçamento',
    });

    const encoded = url.split('?text=')[1]!;
    expect(encoded).not.toContain('João');
    expect(encoded).toContain(encodeURIComponent('João Ferreira'));

    const text = decodeURIComponent(encoded);
    expect(text).toContain('João Ferreira');
    expect(text).toContain('Quero orçamento');
  });

  it('omits empty mensagem line', () => {
    const url = buildWhatsAppUrl({
      nome: 'Maria Silva',
      tipoProjeto: 'reforma residencial',
      email: 'maria@example.com',
      mensagem: '',
    });

    const text = decodeURIComponent(url.split('?text=')[1]!);
    expect(text).toBe(
      [
        'Olá, Saulo! Sou Maria Silva.',
        'Tipo de projeto: reforma residencial',
        'E-mail: maria@example.com',
      ].join('\n'),
    );
  });
});
