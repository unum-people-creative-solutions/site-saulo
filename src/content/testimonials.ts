import { TestimonialSchema, type Testimonial } from './types';

const testimonialsRaw: Testimonial[] = [
  {
    id: 't-01',
    quote:
      'O processo foi claro do início ao fim. Sentimos que cada decisão tinha intenção e cuidado.',
    authorName: 'Nome e Sobrenome Fictício',
    projectType: 'projeto residencial',
    avatar: '/media/hero.jpg',
    isPlaceholder: true,
  },
  {
    id: 't-02',
    quote:
      'Acompanhar a jornada em atos deu segurança. O projeto amadureceu com a gente.',
    authorName: 'Cliente Fictício Silva',
    projectType: 'projeto de interiores',
    avatar: '/media/footer.jpg',
    isPlaceholder: true,
  },
  {
    id: 't-03',
    quote:
      'Do reconhecimento à implantação, tudo se encaixou. Espaço e vida no mesmo ritmo.',
    authorName: 'Maria Fictícia Santos',
    projectType: 'projeto comercial',
    avatar: '/media/hero.jpg',
    isPlaceholder: true,
  },
  {
    id: 't-04',
    quote:
      'Detalhe e realismo em cada fase. A obra refletiu exatamente o que imaginamos juntos.',
    authorName: 'João Fictício Oliveira',
    projectType: 'projeto corporativo',
    avatar: '/media/footer.jpg',
    isPlaceholder: true,
  },
];

export const testimonials = testimonialsRaw.map((item) =>
  TestimonialSchema.parse(item),
);
