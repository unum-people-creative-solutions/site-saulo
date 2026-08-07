import { afterEach, describe, expect, it } from 'vitest';

import { ScrollTrigger } from '../gsap-context';
import { headerContrast } from './headerContrast';

function stubRect(el: HTMLElement, top: number, height: number) {
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

function runUpdate() {
  const trigger = ScrollTrigger.getAll().at(-1)!;
  trigger.vars.onUpdate?.(trigger);
}

describe('headerContrast', () => {
  afterEach(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill());
    document.body.replaceChildren();
  });

  it('registers a single scroll watcher and cleans the on-light class', () => {
    const headerEl = document.createElement('div');
    headerEl.className = 'hero-section__header';
    stubRect(headerEl, 0, 96);

    document.body.append(headerEl);

    const before = ScrollTrigger.getAll().length;
    const cleanup = headerContrast(headerEl);

    expect(ScrollTrigger.getAll().length).toBe(before + 1);

    headerEl.classList.add('hero-section__header--on-light');
    cleanup();
    expect(headerEl.classList.contains('hero-section__header--on-light')).toBe(
      false,
    );
  });

  it('is ink only while a paper section geometrically overlaps the header', () => {
    const headerEl = document.createElement('div');
    headerEl.className = 'hero-section__header';
    stubRect(headerEl, 0, 96);

    const gallery = document.createElement('section');
    gallery.id = 'galeria';
    stubRect(gallery, 2000, 800);

    document.body.append(headerEl, gallery);

    headerContrast(headerEl);
    expect(headerEl.classList.contains('hero-section__header--on-light')).toBe(
      false,
    );

    stubRect(gallery, 0, 800);
    runUpdate();

    expect(headerEl.classList.contains('hero-section__header--on-light')).toBe(
      true,
    );
  });

  it('stays white when the footer overlaps the header, even if depoimentos still intersects', () => {
    const headerEl = document.createElement('div');
    headerEl.className = 'hero-section__header';
    stubRect(headerEl, 0, 96);

    const testimonials = document.createElement('section');
    testimonials.id = 'depoimentos';
    // Bridge padding still crossing the header band.
    stubRect(testimonials, -700, 800);

    const footer = document.createElement('footer');
    footer.className = 'footer-section';
    stubRect(footer, 40, 900);

    document.body.append(headerEl, testimonials, footer);

    headerContrast(headerEl);
    runUpdate();

    expect(headerEl.classList.contains('hero-section__header--on-light')).toBe(
      false,
    );
  });
});
