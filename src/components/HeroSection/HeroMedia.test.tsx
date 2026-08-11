import { render, waitFor } from '@testing-library/react';
import { HeroMedia } from './HeroMedia';

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

  it('renders neither image nor video when prefers-reduced-motion: reduce', () => {
    mockMatchMedia(true);

    // No waitFor: the mode-detecting effect is synchronous, so
    // render()'s act() wrapper has already flushed it — asserting
    // immediately (rather than on an eventually-true condition that's
    // already true pre-effect) actually exercises the reduced-motion
    // branch instead of trivially matching the initial 'pending' render.
    const { container } = render(<HeroMedia />);

    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.innerHTML).toBe('');
  });

  it('renders the video (no static image ever mounts) when motion is allowed', async () => {
    mockMatchMedia(false);

    const { container } = render(<HeroMedia />);

    await waitFor(() => {
      expect(container.querySelector('video')).not.toBeNull();
    });

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelectorAll('video')).toHaveLength(1);
    expect(container.querySelector('video')).toHaveAttribute('loop');
    expect(container.querySelector('source')).toHaveAttribute(
      'src',
      '/media/hero-video.mp4',
    );
  });

  it('marks the video ready and plays it after loadeddata', async () => {
    mockMatchMedia(false);

    const { container } = render(<HeroMedia />);

    const video = await waitFor(() => {
      const el = container.querySelector('video');
      expect(el).not.toBeNull();
      return el as HTMLVideoElement;
    });

    const playSpy = vi.spyOn(video, 'play').mockResolvedValue(undefined);

    video.dispatchEvent(new Event('loadeddata'));

    await waitFor(() => {
      expect(video).toHaveAttribute('data-ready', 'true');
    });
    expect(playSpy).toHaveBeenCalled();
  });

  it('marks the video as failed when play() rejects', async () => {
    mockMatchMedia(false);

    const { container } = render(<HeroMedia />);

    const video = await waitFor(() => {
      const el = container.querySelector('video');
      expect(el).not.toBeNull();
      return el as HTMLVideoElement;
    });

    vi.spyOn(video, 'play').mockRejectedValue(new Error('playback failed'));

    video.dispatchEvent(new Event('loadeddata'));

    await waitFor(() => {
      expect(container.querySelector('video')).toBeNull();
    });
  });

  it('renders neither image nor video when navigator.connection.saveData is true', () => {
    mockMatchMedia(false);
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true },
    });

    const { container } = render(<HeroMedia />);

    expect(container.querySelector('video')).toBeNull();
    expect(container.innerHTML).toBe('');
  });
});
