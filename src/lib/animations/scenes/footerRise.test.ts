import { afterEach, describe, expect, it } from 'vitest';

import { gsap, ScrollTrigger } from '../gsap-context';
import { footerRise } from './footerRise';

function mockRect(
  el: HTMLElement,
  rect: Pick<DOMRect, 'top' | 'left' | 'bottom' | 'right' | 'width' | 'height'>,
) {
  el.getBoundingClientRect = () =>
    ({
      ...rect,
      x: rect.left,
      y: rect.top,
      toJSON: () => ({}),
    }) as DOMRect;
}

function buildFooterDom({
  titleOffsetFromSectionTop = 150,
  bridgePaddingPx = 320,
}: {
  titleOffsetFromSectionTop?: number;
  bridgePaddingPx?: number;
} = {}) {
  const sectionEl = document.createElement('footer');
  const titleEl = document.createElement('h2');
  const testimonialsEl = document.createElement('section');
  testimonialsEl.id = 'depoimentos';

  // top:1000 (not 0) — 'top bottom'/'top center' resolve to scrollY values
  // *ahead* of the test's initial scrollY:0, so the trigger starts unstarted
  // (progress 0, "from" state applied) instead of already-past-end.
  mockRect(sectionEl, {
    top: 1000,
    left: 0,
    bottom: 1800,
    right: 400,
    width: 400,
    height: 800,
  });
  mockRect(titleEl, {
    top: 1000 + titleOffsetFromSectionTop,
    left: 0,
    bottom: 1000 + titleOffsetFromSectionTop + 48,
    right: 400,
    width: 400,
    height: 48,
  });

  const originalGetComputedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
    const style = originalGetComputedStyle(el);
    if (el !== testimonialsEl) return style;

    return new Proxy(style, {
      get(target, prop, receiver) {
        if (prop === 'paddingBottom') return `${bridgePaddingPx}px`;
        const value = Reflect.get(target, prop, receiver);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  });

  sectionEl.append(titleEl);
  document.body.append(testimonialsEl, sectionEl);

  return { sectionEl, titleEl, titleOffsetFromSectionTop, bridgePaddingPx };
}

describe('footerRise', () => {
  afterEach(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill());
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('does not throw when called with section and title', () => {
    const els = buildFooterDom();

    expect(() => footerRise(els.sectionEl, els.titleEl)).not.toThrow();
  });

  it('registers exactly one ScrollTrigger for the title entrance scrub', () => {
    const els = buildFooterDom();
    const before = ScrollTrigger.getAll().length;

    footerRise(els.sectionEl, els.titleEl);

    expect(ScrollTrigger.getAll().length).toBe(before + 1);
  });

  it('starts the title in the bridge, closer to the footer than to the widget', () => {
    const els = buildFooterDom({
      titleOffsetFromSectionTop: 160,
      bridgePaddingPx: 320,
    });

    footerRise(els.sectionEl, els.titleEl);

    // titleOffset + START_ABOVE_FOOTER (128) = 160 + 128 = 288 upward
    const expectedStart = -(els.titleOffsetFromSectionTop + 128);
    expect(gsap.getProperty(els.titleEl, 'y')).toBeCloseTo(expectedStart, 0);
    expect(gsap.getProperty(els.titleEl, 'color')).toBe('rgb(19, 15, 11)');
    expect(els.titleEl.style.position).toBe('');
    expect(els.titleEl.style.visibility).toBe('');
    expect(els.titleEl.style.opacity).toBe('');
  });

  it('clamps the start so a short bridge still keeps a gap from the widget', () => {
    const els = buildFooterDom({
      titleOffsetFromSectionTop: 160,
      bridgePaddingPx: 80,
    });

    footerRise(els.sectionEl, els.titleEl);

    // bridge 80 − min gap 32 = 48 above footer (not the full 128)
    const expectedStart = -(els.titleOffsetFromSectionTop + 48);
    expect(gsap.getProperty(els.titleEl, 'y')).toBeCloseTo(expectedStart, 0);
  });
});
