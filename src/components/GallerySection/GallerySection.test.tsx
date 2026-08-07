import { render, screen } from '@testing-library/react';
import { galleryItems } from '@/content/gallery';
import { GallerySection } from './GallerySection';

vi.mock('next/image', () => ({
  default: ({
    alt,
    src,
    ...rest
  }: {
    alt: string;
    src: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
  }) => {
    const { fill: _fill, sizes: _sizes, ...imgProps } = rest;
    return <img alt={alt} src={typeof src === 'string' ? src : ''} {...imgProps} />;
  },
}));

describe('GallerySection', () => {
  it('T14: renders single/stack/quote cards with non-empty alts and no arrow controls', () => {
    render(<GallerySection items={galleryItems} />);

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    for (const img of images) {
      expect(img.getAttribute('alt')).toBeTruthy();
    }

    expect(document.querySelectorAll('.gallery-card--single').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.gallery-card--stack').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.gallery-card--quote').length).toBeGreaterThan(0);

    const quoteTexts = galleryItems
      .filter((item) => item.kind === 'quote')
      .map((item) => item.text);
    for (const text of quoteTexts) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }

    expect(
      screen.queryByRole('button', { name: 'Projeto anterior' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Próximo projeto' }),
    ).not.toBeInTheDocument();
  });
});
