import { describe, expect, it } from 'vitest';
import { GalleryItemSchema } from './types';

describe('GalleryItemSchema (T13)', () => {
  it('rejects single card image without alt and names the field in the error', () => {
    const result = GalleryItemSchema.safeParse({
      kind: 'single',
      image: {
        slug: 'casa-exemplo',
        src: '/media/hero.jpg',
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const altIssue = result.error.issues.find((issue) =>
      issue.path.includes('alt'),
    );
    expect(altIssue).toBeDefined();
    expect(altIssue?.message).toBeTruthy();
  });

  it('accepts the three storyboard card kinds', () => {
    expect(
      GalleryItemSchema.parse({
        kind: 'single',
        image: {
          slug: 'a',
          src: '/media/hero.jpg',
          alt: 'Retrato',
        },
      }).kind,
    ).toBe('single');

    expect(
      GalleryItemSchema.parse({
        kind: 'stack',
        images: [
          { slug: 'b', src: '/media/hero.jpg', alt: 'Paisagem 1' },
          { slug: 'c', src: '/media/footer.jpg', alt: 'Paisagem 2' },
        ],
      }).kind,
    ).toBe('stack');

    expect(
      GalleryItemSchema.parse({
        kind: 'quote',
        text: 'Frase.',
        image: {
          slug: 'd',
          src: '/media/hero.jpg',
          alt: 'Apoio',
          aspect: 'portrait',
        },
      }).kind,
    ).toBe('quote');
  });
});
