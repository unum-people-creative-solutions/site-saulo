import { afterEach, describe, expect, it } from 'vitest';

import { gsap, ScrollTrigger } from '../gsap-context';
import { aboutReveal, aboutRevealScrubEnd } from './aboutReveal';

function mountAboutFixture(count = 3) {
  const section = document.createElement('section');
  const blocks = Array.from({ length: count }, (_, i) => {
    const el = document.createElement('p');
    el.textContent = `Block ${i}`;
    section.appendChild(el);
    return el;
  });
  document.body.appendChild(section);
  return { section, blocks };
}

describe('aboutReveal', () => {
  afterEach(() => {
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.globalTimeline.clear();
    document.body.innerHTML = '';
  });

  it('does not throw when called with section and blocks', () => {
    const { section, blocks } = mountAboutFixture();
    expect(() => aboutReveal(section, blocks)).not.toThrow();
  });

  it('sets initial block state via opacity (never display/visibility)', () => {
    const { section, blocks } = mountAboutFixture();
    aboutReveal(section, blocks);

    for (const block of blocks) {
      expect(block.style.display).toBe('');
      expect(block.style.visibility).toBe('');
      expect(Number(gsap.getProperty(block, 'opacity'))).toBe(0);
      expect(Number(gsap.getProperty(block, 'y'))).toBe(24);
    }
  });

  it('registers a pinned scrub ScrollTrigger scaled to block count', () => {
    const { section, blocks } = mountAboutFixture(4);
    aboutReveal(section, blocks);

    const triggers = ScrollTrigger.getAll().filter(
      (st) => st.trigger === section,
    );
    expect(triggers.length).toBeGreaterThan(0);
    expect(triggers[0]?.vars.pin).toBe(true);
    expect(triggers[0]?.vars.scrub).toBe(true);
    expect(triggers[0]?.vars.end).toBe('+=180%');
  });

  it('can disable pin when requested', () => {
    const { section, blocks } = mountAboutFixture(3);
    aboutReveal(section, blocks, { pin: false });

    const triggers = ScrollTrigger.getAll().filter(
      (st) => st.trigger === section,
    );
    expect(triggers[0]?.vars.pin).toBe(false);
  });

  it('aboutRevealScrubEnd scales with block count', () => {
    expect(aboutRevealScrubEnd(4)).toBe('+=180%');
    expect(aboutRevealScrubEnd(1)).toBe('+=60%');
  });
});
