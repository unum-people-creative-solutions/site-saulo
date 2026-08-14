import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroSection } from './HeroSection';

const openModal = vi.fn();

vi.mock('@/context/LeadContext', () => ({
  useLead: () => ({
    openModal,
    closeModal: vi.fn(),
    isModalOpen: false,
    params: {},
    origem: 'organico',
  }),
}));

vi.mock('next/image', () => ({
  default: function MockImage({
    alt,
    src,
    ...rest
  }: {
    alt: string;
    src: string;
  }) {
    const { fill: _fill, ...domProps } = rest as { fill?: boolean };
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt} src={src} {...domProps} />
    );
  },
}));

vi.mock('./HeroMedia', () => ({
  HeroMedia: function MockHeroMedia() {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt="" src="/media/hero.jpg" />
    );
  },
}));

describe('HeroSection', () => {
  beforeEach(() => {
    openModal.mockClear();
  });

  it('T10: renders exactly one heading level 1 when HeroSection is alone', () => {
    render(<HeroSection />);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
  });

  it('T29: CTA calls openModal and does not render wa.me href', async () => {
    const user = userEvent.setup();
    const { container } = render(<HeroSection />);

    await user.click(
      screen.getByRole('button', { name: 'QUERO FALAR SOBRE UM PROJETO' }),
    );

    expect(openModal).toHaveBeenCalledTimes(1);
    expect(container.innerHTML).not.toContain('wa.me');
    expect(container.querySelector('a[href*="wa.me"]')).toBeNull();
  });

  it('keeps the wordmark and CTA in a dedicated header row above the phrase', () => {
    const { container } = render(<HeroSection />);

    const header = container.querySelector('.hero-section__header');
    const headerGroup = container.querySelector('.hero-section__header-group');
    const title = screen.getByRole('heading', { level: 1 });
    const cta = screen.getByRole('button', {
      name: 'QUERO FALAR SOBRE UM PROJETO',
    });
    const phrase = screen.getByText(/lorem ipsum dolor sit amet/i);

    expect(header).toContainElement(headerGroup);
    expect(header).toContainElement(cta);
    expect(headerGroup).toContainElement(title);
    expect(header).not.toContainElement(phrase);
  });

  it('renders the shared backdrop as a sibling of #hero, not inside it', () => {
    const { container } = render(<HeroSection />);

    const hero = container.querySelector('#hero');
    const backdrop = container.querySelector('.hero-section__backdrop');
    const frame = container.querySelector('.hero-section__frame');
    const imageLayer = container.querySelector('.hero-section__image-layer');

    expect(hero).not.toBeNull();
    expect(backdrop).not.toBeNull();
    expect(frame).not.toBeNull();
    expect(imageLayer).not.toBeNull();
    expect(hero?.contains(backdrop)).toBe(false);
    expect(backdrop?.contains(frame)).toBe(true);
    expect(frame?.contains(imageLayer)).toBe(true);
  });
});

