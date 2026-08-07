import { render, screen } from '@testing-library/react';
import { siteAboutBlocks } from '@/content/site';
import { AboutSection } from './AboutSection';

describe('AboutSection', () => {
  it('T11: keeps the Sobre heading in the DOM while visually hiding it', () => {
    render(<AboutSection />);

    const heading = screen.getByRole('heading', { level: 2, name: 'Sobre' });

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('about-section__title--sr-only');
    expect(screen.getByText(siteAboutBlocks[0])).toBeInTheDocument();
    expect(screen.getByText(siteAboutBlocks[1])).toBeInTheDocument();
    expect(screen.getByText(siteAboutBlocks[2])).toBeInTheDocument();
    expect(screen.getByText(siteAboutBlocks[3])).toBeInTheDocument();
  });

  it('does not render a dedicated background image — shares the Hero backdrop', () => {
    const { container } = render(<AboutSection />);

    expect(container.querySelector('.about-section__image-layer')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });
});
