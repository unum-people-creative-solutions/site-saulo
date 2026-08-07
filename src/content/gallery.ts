import { GalleryItemSchema, type GalleryItem } from './types';

/**
 * Galeria provisória (isPlaceholder: true).
 * Cards no padrão do storyboard: single / stack / quote.
 * Reusa hero.jpg / footer.jpg até o cliente entregar o grid final.
 */
const galleryItemsRaw: GalleryItem[] = [
  {
    kind: 'single',
    image: {
      slug: 'sala-lareira',
      src: '/media/hero.jpg',
      alt: 'Sala de estar com lareira e parede ripada — placeholder',
      isPlaceholder: true,
    },
  },
  {
    kind: 'quote',
    text: 'Arquitetura é o espaço onde a vida acontece.',
    image: {
      slug: 'corredor-luz',
      src: '/media/footer.jpg',
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
        src: '/media/hero.jpg',
        alt: 'Pátio com jardim vertical — placeholder',
        isPlaceholder: true,
      },
      {
        slug: 'living-escada',
        src: '/media/footer.jpg',
        alt: 'Living com escada em madeira — placeholder',
        isPlaceholder: true,
      },
    ],
  },
  {
    kind: 'single',
    image: {
      slug: 'fachada-residencial',
      src: '/media/footer.jpg',
      alt: 'Fachada residencial — placeholder',
      isPlaceholder: true,
    },
  },
  {
    kind: 'quote',
    text: 'Cada projeto nasce do encontro entre lugar e pessoas.',
    image: {
      slug: 'suite-janela',
      src: '/media/hero.jpg',
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
        src: '/media/footer.jpg',
        alt: 'Cozinha integrada ao living — placeholder',
        isPlaceholder: true,
      },
      {
        slug: 'escritorio-aberto',
        src: '/media/hero.jpg',
        alt: 'Escritório aberto e iluminado — placeholder',
        isPlaceholder: true,
      },
    ],
  },
];

export const galleryItems = galleryItemsRaw.map((item) =>
  GalleryItemSchema.parse(item),
);
