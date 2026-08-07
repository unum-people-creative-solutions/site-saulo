import { render, waitFor } from '@testing-library/react';
import { HeroMedia } from './HeroMedia';

vi.mock('next/image', () => ({
  default: function MockImage({
    alt,
    src,
    className,
    sizes,
  }: {
    alt: string;
    src: string;
    className?: string;
    sizes?: string;
  }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt} src={src} className={className} sizes={sizes} />
    );
  },
}));

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList => ({
      matches: query.includes('prefers-reduced-motion: reduce') ? matches : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe('HeroMedia', () => {
  afterEach(() => {
    mockMatchMedia(false);
    delete (navigator as Navigator & { connection?: unknown }).connection;
  });

  it('renders static image and no video when prefers-reduced-motion: reduce', async () => {
    mockMatchMedia(true);

    const { container } = render(<HeroMedia />);

    await waitFor(() => {
      expect(container.querySelector('img')).not.toBeNull();
    });

    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).toHaveAttribute('src', '/media/hero.jpg');
  });

  it('does not mount hero.jpg under the video when motion is allowed', async () => {
    mockMatchMedia(false);

    const { container } = render(<HeroMedia />);

    await waitFor(() => {
      expect(container.querySelector('video')).not.toBeNull();
    });

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelectorAll('video')).toHaveLength(1);
    expect(container.querySelector('canvas.hero-section__loop-frame')).not.toBeNull();
    expect(container.querySelector('source')).toHaveAttribute(
      'src',
      '/media/hero-video.mp4',
    );
  });

  it('marks the video ready after loadeddata bootstrap', async () => {
    mockMatchMedia(false);

    const { container } = render(<HeroMedia />);

    const video = await waitFor(() => {
      const el = container.querySelector('video');
      expect(el).not.toBeNull();
      return el as HTMLVideoElement;
    });

    Object.defineProperty(video, 'videoWidth', { value: 16, configurable: true });
    Object.defineProperty(video, 'videoHeight', { value: 9, configurable: true });
    Object.defineProperty(video, 'seeking', { value: false, configurable: true });
    vi.spyOn(video, 'pause').mockImplementation(() => undefined);
    vi.spyOn(video, 'play').mockResolvedValue(undefined);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    vi.spyOn(canvas!, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

    video.dispatchEvent(new Event('loadeddata'));

    await waitFor(() => {
      expect(video).toHaveAttribute('data-ready', 'true');
    });
  });

  it('renders static image and no video when navigator.connection.saveData is true', async () => {
    mockMatchMedia(false);
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true },
    });

    const { container } = render(<HeroMedia />);

    await waitFor(() => {
      const image = container.querySelector('img');
      expect(image).not.toBeNull();
      expect(image).toHaveAttribute('src', '/media/hero.jpg');
    });

    expect(container.querySelector('video')).toBeNull();
  });
});
