import { afterEach, describe, expect, it } from 'vitest';

import { gsap, ScrollTrigger } from '../gsap-context';
import { stickyHeader } from './stickyHeader';

describe('stickyHeader', () => {
  afterEach(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill());
  });

  function stubRect(el: HTMLElement) {
    el.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        bottom: 800,
        right: 400,
        width: 400,
        height: 800,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
  }

  function makeEls() {
    const heroSectionEl = document.createElement('section');
    const headerEl = document.createElement('header');
    const ctaEl = document.createElement('a');

    for (const el of [heroSectionEl, headerEl, ctaEl]) {
      stubRect(el);
    }

    document.body.append(heroSectionEl, headerEl, ctaEl);

    return { heroSectionEl, headerEl, ctaEl };
  }

  it('does not throw and registers exactly one ScrollTrigger for the entrance scrub', () => {
    const { heroSectionEl, headerEl, ctaEl } = makeEls();

    const before = ScrollTrigger.getAll().length;

    expect(() => stickyHeader(heroSectionEl, headerEl, ctaEl)).not.toThrow();

    expect(ScrollTrigger.getAll().length).toBe(before + 1);

    heroSectionEl.remove();
    headerEl.remove();
    ctaEl.remove();
  });

  it('starts offset near the vertical middle of the viewport and scrubs to y:0 — never touches position/visibility/opacity', () => {
    const { heroSectionEl, headerEl, ctaEl } = makeEls();

    stickyHeader(heroSectionEl, headerEl, ctaEl);

    // gsap.fromTo's "from" state is applied synchronously on creation.
    const expectedStart = Math.round(window.innerHeight * 0.38);
    for (const el of [headerEl, ctaEl]) {
      const y = gsap.getProperty(el, 'y');
      expect(y).toBeCloseTo(expectedStart, 0);

      // The header is a single, always position:fixed (via CSS) element —
      // this scene must only ever animate `y`. Toggling position/visibility
      // is exactly what previously clipped it or made it reappear looking
      // like a different element.
      expect(el.style.position).toBe('');
      expect(el.style.visibility).toBe('');
      expect(el.style.opacity).toBe('');
    }

    heroSectionEl.remove();
    headerEl.remove();
    ctaEl.remove();
  });

  it('accepts a smaller startRatio for mobile so the header sits higher on first paint', () => {
    const { heroSectionEl, headerEl, ctaEl } = makeEls();

    stickyHeader(heroSectionEl, headerEl, ctaEl, 0.22);

    const expectedStart = Math.round(window.innerHeight * 0.22);
    expect(gsap.getProperty(headerEl, 'y')).toBeCloseTo(expectedStart, 0);

    heroSectionEl.remove();
    headerEl.remove();
    ctaEl.remove();
  });

  it('holds y:0 once the scrub range is exceeded, and reverses cleanly scrolling back', () => {
    const { heroSectionEl, headerEl, ctaEl } = makeEls();

    stickyHeader(heroSectionEl, headerEl, ctaEl);
    const trigger = ScrollTrigger.getAll().at(-1)!;

    // Simulate finishing the scrub (scrolled past the 420px range).
    trigger.progress = 1;
    trigger.animation?.progress(1);
    expect(gsap.getProperty(headerEl, 'y')).toBeCloseTo(0, 0);

    // Scrolling back to the very top reverses to the original offset.
    trigger.progress = 0;
    trigger.animation?.progress(0);
    const expectedStart = Math.round(window.innerHeight * 0.38);
    expect(gsap.getProperty(headerEl, 'y')).toBeCloseTo(expectedStart, 0);

    heroSectionEl.remove();
    headerEl.remove();
    ctaEl.remove();
  });
});
