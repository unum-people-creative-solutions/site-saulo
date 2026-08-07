import { render, screen } from '@testing-library/react';
import { Wordmark } from './Wordmark';

vi.mock('next/image', () => ({
  default: function MockImage({
    alt,
    src,
    className,
    width,
    height,
  }: {
    alt: string;
    src: string;
    className?: string;
    width?: number;
    height?: number;
  }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        src={src}
        className={className}
        width={width}
        height={height}
      />
    );
  },
}));

describe('Wordmark', () => {
  it('T01: exposes accessible name "Saulo Magno Arquitetos" and hides decorative lockup', () => {
    render(<Wordmark variant="hero" />);

    const region = screen.getByLabelText('Saulo Magno Arquitetos');
    expect(region).toBeInTheDocument();

    const arquit = screen.getByText('ARQUIT');
    expect(arquit.closest('[aria-hidden="true"]')).not.toBeNull();

    const etos = screen.getByText('ETOS');
    expect(etos.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('stacked variant renders the provided logo image', () => {
    render(<Wordmark variant="stacked" />);

    const logo = screen.getByRole('img', { name: 'Saulo Magno Arquitetos' });
    expect(logo).toHaveAttribute('src', '/brand/logo.png');
    expect(screen.queryByText('ARQUIT')).toBeNull();
  });
});
