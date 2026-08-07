import { afterEach, describe, expect, it } from 'vitest';

import { gsap, ScrollTrigger } from '../gsap-context';
import { processCascade } from './processCascade';

function mountProcessFixture() {
  const section = document.createElement('section');
  const title = document.createElement('h2');
  title.textContent = 'Processo';
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Subtitle';
  const cards = [0, 1, 2, 3].map((i) => {
    const el = document.createElement('article');
    el.textContent = `Card ${i}`;
    return el;
  });
  const closing = document.createElement('p');
  closing.textContent = 'Closing';
  const cta = document.createElement('button');
  cta.textContent = 'CTA';

  section.append(title, subtitle, ...cards, closing, cta);
  document.body.appendChild(section);

  return { section, title, subtitle, cards, closing, cta };
}

describe('processCascade', () => {
  afterEach(() => {
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.globalTimeline.clear();
    document.body.innerHTML = '';
  });

  it('does not throw when called with full element set', () => {
    const { section, title, subtitle, cards, closing, cta } =
      mountProcessFixture();
    expect(() =>
      processCascade(section, title, subtitle, cards, closing, cta),
    ).not.toThrow();
  });

  it('registers four staged ScrollTriggers and never pins', () => {
    const { section, title, subtitle, cards, closing, cta } =
      mountProcessFixture();
    processCascade(section, title, subtitle, cards, closing, cta);

    const triggers = ScrollTrigger.getAll().filter(
      (st) => st.trigger === section,
    );
    expect(triggers).toHaveLength(4);

    for (const st of triggers) {
      expect(st.vars.pin).toBeFalsy();
      expect(st.pin).toBeFalsy();
      expect(st.vars.toggleActions).toBe('play none none reverse');
    }
  });

  it('hides all stages initially via opacity (never display/visibility)', () => {
    const { section, title, subtitle, cards, closing, cta } =
      mountProcessFixture();
    processCascade(section, title, subtitle, cards, closing, cta);

    for (const el of [title, subtitle, ...cards, closing, cta]) {
      expect(el.style.display).toBe('');
      expect(el.style.visibility).toBe('');
      expect(Number(gsap.getProperty(el, 'opacity'))).toBe(0);
      expect(Number(gsap.getProperty(el, 'y'))).toBe(24);
    }
  });
});
