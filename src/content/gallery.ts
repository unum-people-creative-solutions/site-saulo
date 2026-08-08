import { GalleryItemSchema, type GalleryItem } from './types';

/**
 * Galeria provisória (isPlaceholder: true).
 * Cards no padrão do storyboard: single / stack / quote.
 * Assets em `public/media/galeria/` — trocar pelos arquivos finais do cliente.
 */
const galleryItemsRaw: GalleryItem[] = [
  {
    kind: 'single',
    image: {
      slug: 'sala-lareira',
      src: '/media/galeria/sala-lareira.jpg',
      alt: 'Sala de estar com lareira e parede ripada — placeholder',
      isPlaceholder: true,
    },
  },
  {
    kind: 'quote',
    text: 'Arquitetura é o espaço onde a vida acontece.',
    image: {
      slug: 'corredor-luz',
      src: '/media/galeria/corredor-luz.jpg',
      alt: 'Corredor iluminado — placeholder',
      aspect: 'portrait',
      isPlaceholder: true,
    },
  },
  {
    kind: 'stack',
    images: [
      {
        slug: 'patio-jardim',
        src: '/media/galeria/patio-jardim.jpg',
        alt: 'Pátio com jardim vertical — placeholder',
        isPlaceholder: true,
      },
      {
        slug: 'living-escada',
        src: '/media/galeria/living-escada.jpg',
        alt: 'Living com escada em madeira — placeholder',
        isPlaceholder: true,
      },
    ],
  },
  {
    kind: 'single',
    image: {
      slug: 'fachada-residencial',
      src: '/media/galeria/fachada-residencial.jpg',
      alt: 'Fachada residencial — placeholder',
      isPlaceholder: true,
    },
  },
  {
    kind: 'quote',
    text: 'Cada projeto nasce do encontro entre lugar e pessoas.',
    image: {
      slug: 'suite-janela',
      src: '/media/galeria/suite-janela.jpg',
      alt: 'Suíte com janela ampla — placeholder',
      aspect: 'landscape',
      isPlaceholder: true,
    },
  },
  {
    kind: 'stack',
    images: [
      {
        slug: 'cozinha-integrada',
        src: '/media/galeria/cozinha-integrada.jpg',
        alt: 'Cozinha integrada ao living — placeholder',
        isPlaceholder: true,
      },
      {
        slug: 'escritorio-aberto',
        src: '/media/galeria/escritorio-aberto.jpg',
        alt: 'Escritório aberto e iluminado — placeholder',
        isPlaceholder: true,
      },
    ],
  },
];

export const galleryItems = galleryItemsRaw.map((item) =>
  GalleryItemSchema.parse(item),
);
