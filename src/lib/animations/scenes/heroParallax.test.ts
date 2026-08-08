import { afterEach, describe, expect, it, vi } from 'vitest';

import { gsap, ScrollTrigger } from '../gsap-context';
import { heroParallax } from './heroParallax';

function stubMatchMedia(pointerFine: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string): MediaQueryList => {
      const matches =
        query.includes('(pointer: fine)') ? pointerFine : false;
      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  );
}

describe('heroParallax', () => {
  afterEach(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill());
    gsap.globalTimeline.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function mountFixture() {
    const heroEl = document.createElement('section');
    const aboutEl = document.createElement('section');
    const imageEl = document.createElement('img');
    heroEl.appendChild(imageEl);
    document.body.append(heroEl, aboutEl);
    return { heroEl, aboutEl, imageEl };
  }

  it('does not register mousemove when pointer: fine is false (T49)', () => {
    stubMatchMedia(false);
    const { heroEl, aboutEl, imageEl } = mountFixture();

    const heroAddSpy = vi.spyOn(heroEl, 'addEventListener');
    const aboutAddSpy = vi.spyOn(aboutEl, 'addEventListener');

    heroParallax(imageEl, heroEl, aboutEl);

    expect(
      heroAddSpy.mock.calls.filter(([type]) => type === 'mousemove'),
    ).toHaveLength(0);
    expect(
      aboutAddSpy.mock.calls.filter(([type]) => type === 'mousemove'),
    ).toHaveLength(0);

    heroEl.remove();
    aboutEl.remove();
  });

  it('registers mousemove on both Hero and Sobre when pointer: fine is true', () => {
    stubMatchMedia(true);
    const { heroEl, aboutEl, imageEl } = mountFixture();

    const heroAddSpy = vi.spyOn(heroEl, 'addEventListener');
    const aboutAddSpy = vi.spyOn(aboutEl, 'addEventListener');

    heroParallax(imageEl, heroEl, aboutEl);

    expect(
      heroAddSpy.mock.calls.filter(([type]) => type === 'mousemove'),
    ).toHaveLength(1);
    expect(
      aboutAddSpy.mock.calls.filter(([type]) => type === 'mousemove'),
    ).toHaveLength(1);

    heroEl.remove();
    aboutEl.remove();
  });

  it('does not register a scroll-scrubbed yPercent tween on the image', () => {
    stubMatchMedia(false);
    const { heroEl, aboutEl, imageEl } = mountFixture();

    heroParallax(imageEl, heroEl, aboutEl);

    const scrubbed = ScrollTrigger.getAll().filter((st) => st.vars.scrub);
    expect(scrubbed).toHaveLength(0);
    expect(Number(gsap.getProperty(imageEl, 'yPercent'))).toBeCloseTo(0, 0);

    heroEl.remove();
    aboutEl.remove();
  });

  it('locks the image centered once Sobre has fully scrolled past', () => {
    stubMatchMedia(false);
    const { heroEl, aboutEl, imageEl } = mountFixture();

    heroParallax(imageEl, heroEl, aboutEl);
    gsap.set(imageEl, { x: 40, y: 20 });

    const trigger = ScrollTrigger.getAll().at(-1)!;
    expect(trigger.vars.trigger).toBe(aboutEl);
    expect(trigger.vars.end).toBe('bottom top');
    trigger.vars.onLeave?.(trigger);

    expect(Number(gsap.getProperty(imageEl, 'x'))).toBeCloseTo(0, 0);
    expect(Number(gsap.getProperty(imageEl, 'y'))).toBeCloseTo(0, 0);

    heroEl.remove();
    aboutEl.remove();
  });
});
