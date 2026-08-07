import { describe, expect, it } from 'vitest';

import { leadSchema } from './lead-schema';

const validLead = {
  nome: 'Maria Silva',
  telefone: '11999999999',
  email: 'maria@example.com',
  tipoProjeto: 'reforma_residencial' as const,
  mensagem: 'Quero reformar a sala',
};

function issueMessage(result: ReturnType<typeof leadSchema.safeParse>, path: string) {
  expect(result.success).toBe(false);
  if (result.success) return '';
  const issue = result.error.issues.find((i) => i.path.join('.') === path);
  expect(issue).toBeDefined();
  return issue!.message;
}

describe('leadSchema', () => {
  it('accepts a valid lead', () => {
    const result = leadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  it('rejects nome with a single word', () => {
    const result = leadSchema.safeParse({ ...validLead, nome: 'Maria' });
    expect(issueMessage(result, 'nome')).toBe('Informe nome e sobrenome');
  });

  it('rejects telefone with fewer than 10 digits', () => {
    const result = leadSchema.safeParse({ ...validLead, telefone: '119999999' });
    expect(issueMessage(result, 'telefone')).toBe('Telefone inválido');
  });

  it('rejects email without @', () => {
    const result = leadSchema.safeParse({ ...validLead, email: 'mariaexample.com' });
    expect(issueMessage(result, 'email')).toBe('E-mail inválido');
  });

  it('rejects tipoProjeto outside the enum', () => {
    const result = leadSchema.safeParse({
      ...validLead,
      tipoProjeto: 'outro',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === 'tipoProjeto');
      expect(issue).toBeDefined();
    }
  });

  it('rejects missing required fields with field-specific issues', () => {
    const result = leadSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toEqual(
        expect.arrayContaining(['nome', 'telefone', 'email', 'tipoProjeto']),
      );
    }
  });
});
