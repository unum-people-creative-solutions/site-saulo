import { afterEach, describe, expect, it } from 'vitest';

import { gsap, ScrollTrigger } from '../gsap-context';
import { aboutReveal } from './aboutReveal';
import { heroMobilePan } from './heroMobilePan';

describe('heroMobilePan', () => {
  afterEach(() => {
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.globalTimeline.clear();
    document.body.innerHTML = '';
  });

  it('ends at the same scroll position as the aboutReveal pin scrub', () => {
    const hero = document.createElement('section');
    hero.style.height = '800px';
    const image = document.createElement('div');
    hero.appendChild(image);

    const about = document.createElement('section');
    about.id = 'sobre';
    about.style.height = '800px';
    const blocks = Array.from({ length: 4 }, (_, i) => {
      const el = document.createElement('p');
      el.className = 'about-section__block';
      el.textContent = `Block ${i}`;
      about.appendChild(el);
      return el;
    });

    document.body.append(hero, about);

    aboutReveal(about, blocks);
    heroMobilePan(image, hero, about);
    ScrollTrigger.refresh();

    const aboutSt = ScrollTrigger.getAll().find(
      (st) => st.trigger === about && Boolean(st.vars.pin),
    );
    const panSt = ScrollTrigger.getAll().find((st) => st.trigger === hero);

    expect(aboutSt).toBeDefined();
    expect(panSt).toBeDefined();
    expect(panSt!.end).toBe(aboutSt!.end);
  });
});
