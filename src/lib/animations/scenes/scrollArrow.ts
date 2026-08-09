import { ScrollTrigger } from '../gsap-context';

type ArrowState = 'down' | 'right' | 'hidden';

/** Section top at mid-viewport ≈ 50% of the screen shows the section. */
const VISIBLE_50 = 'top 50%';

/**
 * Drives the persistent ScrollArrow:
 * - ↓ by default
 * - → once the gallery is ~50% on screen, until depoimentos hits ~50%
 * - ↓ again through depoimentos
 * - hidden once the footer arrives (~50% on screen)
 *
 * Contrast against the surface under the arrow is handled in CSS via
 * `mix-blend-mode: difference` (ScrollArrow.css).
 */
export function scrollArrow(
  arrowEl: HTMLElement,
  gallerySectionEl: HTMLElement,
  testimonialsSectionEl: HTMLElement,
  footerSectionEl: HTMLElement,
): () => void {
  const setState = (state: ArrowState) => {
    arrowEl.dataset.state = state;
  };

  const galleryTrigger = ScrollTrigger.create({
    trigger: gallerySectionEl,
    start: VISIBLE_50,
    endTrigger: testimonialsSectionEl,
    end: VISIBLE_50,
    invalidateOnRefresh: true,
    onEnter: () => setState('right'),
    onLeave: () => setState('down'),
    onEnterBack: () => setState('right'),
    onLeaveBack: () => setState('down'),
  });

  const footerTrigger = ScrollTrigger.create({
    trigger: footerSectionEl,
    start: VISIBLE_50,
    invalidateOnRefresh: true,
    onEnter: () => setState('hidden'),
    onLeaveBack: () => {
      setState(galleryTrigger.isActive ? 'right' : 'down');
    },
  });

  setState('down');

  return () => {
    galleryTrigger.kill();
    footerTrigger.kill();
    delete arrowEl.dataset.state;
  };
}
