import { ScrollTrigger } from '../gsap-context';
import { horizontalDistance } from './galleryHorizontal';

// Deliberately excludes #galeria: the client wants the arrow to stay
// white there regardless of the photo behind it (only 'down'-state
// stops, like testimonials, get the ink swap).
const LIGHT_SECTION_SELECTOR = '#depoimentos';
const ON_LIGHT_CLASS = 'scroll-arrow--on-light';

type ArrowState = 'down' | 'right' | 'hidden';

function overlaps(
  a: Pick<DOMRect, 'top' | 'bottom'>,
  b: Pick<DOMRect, 'top' | 'bottom'>,
): boolean {
  return a.top < b.bottom && a.bottom > b.top;
}

/**
 * Drives the persistent ScrollArrow: points down and sits at the bottom
 * by default, turns to point right once ~50% of the gallery is in view
 * (`top 50%` — earlier than the pin at `top top`), stays right through
 * the horizontal scrub, reverts to down after it, and hides once the
 * footer is reached. Contrast class is still toggled for testimonials;
 * the glyph itself uses a dual-tone stroke (see ScrollArrow.css).
 */
export function scrollArrow(
  arrowEl: HTMLElement,
  gallerySectionEl: HTMLElement,
  galleryTrackEl: HTMLElement,
  footerSectionEl: HTMLElement,
): () => void {
  const setState = (state: ArrowState) => {
    arrowEl.dataset.state = state;
  };

  // Right-state starts when half the viewport shows the gallery, but must
  // still cover the full pin window (pin start → +horizontalDistance).
  // From `top 50%` to `top top` is half a viewport of scroll, then the
  // pin itself adds `horizontalDistance`.
  const galleryTrigger = ScrollTrigger.create({
    trigger: gallerySectionEl,
    start: 'top 50%',
    end: () =>
      `+=${window.innerHeight * 0.5 + horizontalDistance(galleryTrackEl)}`,
    invalidateOnRefresh: true,
    onEnter: () => setState('right'),
    onLeave: () => setState('down'),
    onEnterBack: () => setState('right'),
    onLeaveBack: () => setState('down'),
  });

  const footerTrigger = ScrollTrigger.create({
    trigger: footerSectionEl,
    start: 'top bottom',
    onEnter: () => setState('hidden'),
    onLeaveBack: () => setState('down'),
  });

  const syncContrast = () => {
    const rect = arrowEl.getBoundingClientRect();
    const overLight = Array.from(
      document.querySelectorAll<HTMLElement>(LIGHT_SECTION_SELECTOR),
    ).some((section) => overlaps(section.getBoundingClientRect(), rect));
    arrowEl.classList.toggle(ON_LIGHT_CLASS, overLight);
  };

  const contrastTrigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: syncContrast,
    onRefresh: syncContrast,
  });

  setState('down');
  syncContrast();

  return () => {
    galleryTrigger.kill();
    footerTrigger.kill();
    contrastTrigger.kill();
    delete arrowEl.dataset.state;
    arrowEl.classList.remove(ON_LIGHT_CLASS);
  };
}
