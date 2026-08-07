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

  it('does not register mousemove when pointer: fine is false (T49)', () => {
    stubMatchMedia(false);

    const sectionEl = document.createElement('section');
    const imageEl = document.createElement('img');
    sectionEl.appendChild(imageEl);
    document.body.appendChild(sectionEl);

    const addSpy = vi.spyOn(sectionEl, 'addEventListener');

    heroParallax(imageEl, sectionEl);

    const mousemoveCalls = addSpy.mock.calls.filter(
      ([type]) => type === 'mousemove',
    );
    expect(mousemoveCalls).toHaveLength(0);

    sectionEl.remove();
  });

  it('registers mousemove when pointer: fine is true', () => {
    stubMatchMedia(true);

    const sectionEl = document.createElement('section');
    const imageEl = document.createElement('img');
    sectionEl.appendChild(imageEl);
    document.body.appendChild(sectionEl);

    const addSpy = vi.spyOn(sectionEl, 'addEventListener');

    heroParallax(imageEl, sectionEl);

    const mousemoveCalls = addSpy.mock.calls.filter(
      ([type]) => type === 'mousemove',
    );
    expect(mousemoveCalls.length).toBeGreaterThanOrEqual(1);

    sectionEl.remove();
  });

  it('does not register a scroll-scrubbed yPercent tween on the image', () => {
    stubMatchMedia(false);

    const sectionEl = document.createElement('section');
    const imageEl = document.createElement('img');
    sectionEl.appendChild(imageEl);
    document.body.appendChild(sectionEl);

    heroParallax(imageEl, sectionEl);

    const scrubbed = ScrollTrigger.getAll().filter(
      (st) => st.vars.scrub && st.vars.trigger === sectionEl,
    );
    expect(scrubbed).toHaveLength(0);
    expect(Number(gsap.getProperty(imageEl, 'yPercent'))).toBeCloseTo(0, 0);

    sectionEl.remove();
  });

  it('locks the image centered shortly after scroll starts', () => {
    stubMatchMedia(false);

    const sectionEl = document.createElement('section');
    const imageEl = document.createElement('img');
    sectionEl.appendChild(imageEl);
    document.body.appendChild(sectionEl);

    heroParallax(imageEl, sectionEl);
    gsap.set(imageEl, { x: 40, y: 20 });

    const trigger = ScrollTrigger.getAll().at(-1)!;
    expect(trigger.vars.end).toBe('top+=80 top');
    trigger.vars.onLeave?.(trigger);

    expect(Number(gsap.getProperty(imageEl, 'x'))).toBeCloseTo(0, 0);
    expect(Number(gsap.getProperty(imageEl, 'y'))).toBeCloseTo(0, 0);

    sectionEl.remove();
  });
});
