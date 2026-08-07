import { gsap } from '../gsap-context';

/**
 * How far above the footer top the CTA sits at scrub start.
 * Keeps the handoff in the paper bridge, but closer to the rising footer
 * than to the testimonials widget (revisão visual 2026-08-07).
 */
const START_ABOVE_FOOTER_PX = 128;

/** Floor: never park the CTA on top of the testimonials controls. */
const MIN_GAP_FROM_WIDGET_PX = 32;

const COLOR_ON_PAPER = '#130F0B';
const COLOR_ON_FOOTER = '#FFFFFF';

/**
 * Footer rise scene (called inside gsap.context() by the integrator).
 *
 * The background image fills the footer's hero block permanently (it's
 * `min-height: 100svh` in CSS) — it never animates. Only the title scrubs
 * into place:
 *
 * 1. It starts in the previous section — in the paper bridge *below* the
 *    testimonials widget and *above* the footer — so it reads as a handoff
 *    from depoimentos, not as a collision with the quote/controls.
 * 2. As the footer scrolls in (`top bottom` → `top top`), the title rides
 *    down into its natural resting position inside the footer.
 *
 * At scrub start the footer top sits on the viewport bottom. Translating by
 * `-(titleOffset + distanceAboveFooter)` parks the title that many pixels
 * above the footer edge (clamped so a minimum gap to the widget remains).
 *
 * Color scrubs with the same progress: ink on paper → white on the dark
 * footer, so the CTA stays legible in both surfaces.
 */
export function footerRise(sectionEl: HTMLElement, titleEl: HTMLElement): void {
  const titleOffsetFromSectionTop = Math.max(
    0,
    titleEl.getBoundingClientRect().top - sectionEl.getBoundingClientRect().top,
  );

  const testimonialsEl = document.getElementById('depoimentos');
  const bridgePaddingPx = testimonialsEl
    ? Number.parseFloat(getComputedStyle(testimonialsEl).paddingBottom) || 0
    : 0;

  const distanceAboveFooter = Math.min(
    START_ABOVE_FOOTER_PX,
    Math.max(0, bridgePaddingPx - MIN_GAP_FROM_WIDGET_PX),
  );

  const startY = -Math.round(titleOffsetFromSectionTop + distanceAboveFooter);

  gsap.fromTo(
    titleEl,
    { y: startY, color: COLOR_ON_PAPER },
    {
      y: 0,
      color: COLOR_ON_FOOTER,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
      },
    },
  );
}
