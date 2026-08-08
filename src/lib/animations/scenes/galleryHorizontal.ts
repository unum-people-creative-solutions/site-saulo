import { gsap, ScrollTrigger } from '../gsap-context';

/**
 * How far the track must translate to reveal its last card.
 *
 * Prefer scrollWidth (native). When the track is `overflow: visible`
 * (motion-driven mode), some engines report scrollWidth === clientWidth
 * even though flex children overflow — fall back to summing card widths.
 */
export function horizontalDistance(trackEl: HTMLElement): number {
  const fromScroll = trackEl.scrollWidth - trackEl.clientWidth;
  if (fromScroll > 1) return fromScroll;

  const styles = getComputedStyle(trackEl);
  const gap = parseFloat(styles.columnGap || styles.gap) || 0;
  const padInline =
    (parseFloat(styles.paddingLeft) || 0) +
    (parseFloat(styles.paddingRight) || 0);

  const children = Array.from(trackEl.children) as HTMLElement[];
  if (children.length === 0) return 0;

  let contentWidth = 0;
  for (let i = 0; i < children.length; i++) {
    contentWidth += children[i].getBoundingClientRect().width;
    if (i < children.length - 1) contentWidth += gap;
  }

  return Math.max(0, contentWidth + padInline - trackEl.clientWidth);
}

/**
 * Horizontal gallery scene (called inside gsap.context() by the integrator).
 *
 * Pins sectionEl; translates trackEl on x proportional to vertical scroll.
 * `end` is derived from the track's overflow distance and recalculated on
 * resize via ScrollTrigger.refresh().
 *
 * trackEl has `overflow-x: auto` in CSS — that's the no-JS/reduced-motion/
 * mobile fallback (T19/T41/T42), where nothing drives the transform and the
 * user must be able to scroll the track natively. Here, with the pin/scrub
 * active, native horizontal scroll must be switched off: left enabled, a
 * trackpad/scrollbar/keyboard gesture scrolls the track's own viewport
 * independently of (and out of sync with) the transform, which visually
 * reads as "the whole gallery container just slides away" instead of
 * revealing the next image. `data-motion-driven` marks that mode for CSS
 * (overflow: visible) and any future controls that need to know native
 * scrollLeft is inert while the pin/scrub is active.
 */
export function galleryHorizontal(
  sectionEl: HTMLElement,
  trackEl: HTMLElement,
): () => void {
  trackEl.dataset.motionDriven = 'true';

  gsap.to(trackEl, {
    x: () => -horizontalDistance(trackEl),
    ease: 'none',
    scrollTrigger: {
      trigger: sectionEl,
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => `+=${horizontalDistance(trackEl)}`,
      invalidateOnRefresh: true,
    },
  });

  const onResize = () => {
    ScrollTrigger.refresh();
  };

  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    delete trackEl.dataset.motionDriven;
  };
}
