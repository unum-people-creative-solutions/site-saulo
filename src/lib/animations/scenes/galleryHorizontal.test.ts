import { afterEach, describe, expect, it, vi } from 'vitest';

import { ScrollTrigger } from '../gsap-context';
import { galleryHorizontal } from './galleryHorizontal';

describe('galleryHorizontal', () => {
  afterEach(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill());
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('does not throw when called with section + track elements', () => {
    const sectionEl = document.createElement('section');
    const trackEl = document.createElement('div');
    sectionEl.appendChild(trackEl);
    document.body.appendChild(sectionEl);

    Object.defineProperty(trackEl, 'scrollWidth', {
      value: 3000,
      configurable: true,
    });
    Object.defineProperty(trackEl, 'clientWidth', {
      value: 1000,
      configurable: true,
    });

    expect(() => galleryHorizontal(sectionEl, trackEl)).not.toThrow();
  });

  it('derives ScrollTrigger end from trackEl scrollWidth − clientWidth', () => {
    const sectionEl = document.createElement('section');
    const trackEl = document.createElement('div');
    trackEl.style.overflowX = 'auto';
    sectionEl.appendChild(trackEl);
    document.body.appendChild(sectionEl);

    Object.defineProperty(trackEl, 'scrollWidth', {
      value: 3000,
      configurable: true,
    });
    Object.defineProperty(trackEl, 'clientWidth', {
      value: 1000,
      configurable: true,
    });

    galleryHorizontal(sectionEl, trackEl);

    const triggers = ScrollTrigger.getAll();
    expect(triggers.length).toBeGreaterThan(0);

    const pinned = triggers.find((t) => t.vars.pin === true);
    expect(pinned).toBeDefined();

    const end = pinned!.vars.end;
    expect(typeof end).toBe('function');
    expect((end as () => string)()).toBe('+=2000');
  });

  it('registers a resize listener that refreshes ScrollTrigger', () => {
    const refreshSpy = vi.spyOn(ScrollTrigger, 'refresh');
    const addSpy = vi.spyOn(window, 'addEventListener');

    const sectionEl = document.createElement('section');
    const trackEl = document.createElement('div');
    sectionEl.appendChild(trackEl);
    document.body.appendChild(sectionEl);

    Object.defineProperty(trackEl, 'scrollWidth', {
      value: 2000,
      configurable: true,
    });
    Object.defineProperty(trackEl, 'clientWidth', {
      value: 800,
      configurable: true,
    });

    galleryHorizontal(sectionEl, trackEl);

    // Our listener is registered after ScrollTrigger's own — take the last one
    const resizeCalls = addSpy.mock.calls.filter(([type]) => type === 'resize');
    expect(resizeCalls.length).toBeGreaterThan(0);
    const resizeHandler = resizeCalls.at(-1)?.[1] as EventListener | undefined;
    expect(resizeHandler).toBeTypeOf('function');

    refreshSpy.mockClear();
    resizeHandler?.(new Event('resize'));
    expect(refreshSpy).toHaveBeenCalled();
  });

  it('falls back to summing children when scrollWidth collapses', () => {
    const sectionEl = document.createElement('section');
    const trackEl = document.createElement('div');

    const a = document.createElement('article');
    const b = document.createElement('article');
    a.getBoundingClientRect = () =>
      ({
        width: 400,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON() {},
      }) as DOMRect;
    b.getBoundingClientRect = () =>
      ({
        width: 500,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON() {},
      }) as DOMRect;
    trackEl.append(a, b);
    sectionEl.appendChild(trackEl);
    document.body.appendChild(sectionEl);

    Object.defineProperty(trackEl, 'scrollWidth', {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(trackEl, 'clientWidth', {
      value: 1000,
      configurable: true,
    });

    const originalGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const style = originalGetComputedStyle(el);
      if (el !== trackEl) return style;
      return new Proxy(style, {
        get(target, prop, receiver) {
          if (prop === 'gap' || prop === 'columnGap') return '40px';
          if (prop === 'paddingLeft' || prop === 'paddingRight') return '32px';
          const value = Reflect.get(target, prop, receiver);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    });

    galleryHorizontal(sectionEl, trackEl);

    const pinned = ScrollTrigger.getAll().find((t) => t.vars.pin === true);
    expect(pinned).toBeDefined();
    const end = pinned!.vars.end as () => string;
    // 400 + 40 + 500 + 32 + 32 - 1000 = 4
    expect(end()).toBe('+=4');
  });
});
