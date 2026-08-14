import { afterEach, describe, expect, it, vi } from 'vitest';

import { ScrollTrigger } from '../gsap-context';
import { buildSnapModel, pickSnapY, sectionSnap } from './sectionSnap';

function stubRect(el: HTMLElement, top: number, height: number) {
  Object.defineProperty(el, 'offsetHeight', { configurable: true, value: height });
  el.getBoundingClientRect = () =>
    ({
      top,
      left: 0,
      bottom: top + height,
      right: 400,
      width: 400,
      height,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;
}

describe('buildSnapModel / pickSnapY', () => {
  it('snaps to the next section once scroll is close to its start', () => {
    const hero = document.createElement('section');
    const about = document.createElement('section');
    stubRect(hero, 0, 900);
    stubRect(about, 900, 900);

    const model = buildSnapModel({
      sections: [hero, about],
      pinRanges: [],
      viewportHeight: 900,
      scrollY: 0,
      maxScroll: 900,
    });

    expect(model.points).toEqual([0, 900]);

    // Mid-hero: still free, so the header scrub can play.
    expect(pickSnapY(400, 1, model)).toBeNull();

    // Near about: seat the incoming section.
    expect(pickSnapY(720, 1, model)).toBe(900);

    // Near hero while going up: seat hero again.
    expect(pickSnapY(180, -1, model)).toBe(0);

    // Already on hero: do not jump to about.
    expect(pickSnapY(0, 1, model)).toBeNull();
    expect(pickSnapY(80, 1, model)).toBe(0);
  });

  it('uses the pin start as the snap point and leaves the pin interior free', () => {
    const about = document.createElement('section');
    const process = document.createElement('section');
    stubRect(about, 0, 900); // currently pinned — live top is 0
    stubRect(process, 900, 900);

    const model = buildSnapModel({
      sections: [about, process],
      pinRanges: [{ trigger: about, start: 900, end: 1980 }],
      viewportHeight: 900,
      scrollY: 1200,
      maxScroll: 1980,
    });

    expect(model.points).toContain(900);
    expect(pickSnapY(1400, 1, model)).toBeNull();
    expect(pickSnapY(1900, 1, model)).toBe(1980);
  });

  it('returns null when already seated on a snap point', () => {
    const hero = document.createElement('section');
    stubRect(hero, 0, 900);

    const model = buildSnapModel({
      sections: [hero],
      pinRanges: [],
      viewportHeight: 900,
      scrollY: 0,
      maxScroll: 0,
    });

    expect(pickSnapY(0, 1, model)).toBeNull();
  });

  it('seats testimonials when scrolling down from the gallery, instead of skipping to the footer', () => {
    const gallery = document.createElement('section');
    gallery.id = 'galeria';
    const testimonials = document.createElement('section');
    testimonials.id = 'depoimentos';
    const footer = document.createElement('footer');
    footer.className = 'footer-section';
    stubRect(gallery, 0, 900);
    // Live viewport rects at scrollY 2050: depoimentos top is just above the fold.
    stubRect(testimonials, -50, 900);
    stubRect(footer, 850, 900);

    const model = buildSnapModel({
      sections: [gallery, testimonials, footer],
      pinRanges: [{ trigger: gallery, start: 0, end: 2000 }],
      viewportHeight: 900,
      scrollY: 2050,
      maxScroll: 2900,
    });

    expect(model.points).toEqual([0, 2000, 2900]);
    expect(model.lockedPoints).toContain(2000);

    // Just past the gallery pin — must land on depoimentos, not the footer.
    expect(pickSnapY(2050, 1, model)).toBe(2000);
    expect(pickSnapY(2100, 1, model)).toBe(2000);

    // Only when closer to the footer should it seat the footer.
    expect(pickSnapY(2600, 1, model)).toBe(2900);

    // Scrolling up from the footer still seats depoimentos.
    expect(pickSnapY(2300, -1, model)).toBe(2000);
  });
});

describe('sectionSnap', () => {
  afterEach(() => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('registers a page-wide snap watcher and removes it on cleanup', () => {
    const hero = document.createElement('section');
    hero.id = 'hero';
    stubRect(hero, 0, 900);
    document.body.append(hero);

    const before = ScrollTrigger.getAll().length;
    const cleanup = sectionSnap();

    expect(ScrollTrigger.getAll().length).toBe(before + 1);

    cleanup();
    expect(ScrollTrigger.getAll().length).toBe(before);
  });
});
