import { z } from 'zod';

export const leadSchema = z.object({
  nome: z
    .string()
    .refine(
      (v) => v.trim().split(/\s+/).length >= 2,
      'Informe nome e sobrenome',
    ),
  telefone: z
    .string()
    .refine(
      (v) => /^\d{10,11}$/.test(v.replace(/\D/g, '')),
      'Telefone inválido',
    ),
  email: z.string().email('E-mail inválido'),
  tipoProjeto: z.enum([
    'reforma_residencial',
    'reforma_comercial',
    'construcao_residencial',
    'construcao_corporativa',
    'projeto_interiores',
  ]),
  mensagem: z.string().max(500).optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
