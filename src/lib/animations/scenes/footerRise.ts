import { gsap } from '../gsap-context';

/** How far into the testimonials viewport the CTA sits at scrub start. */
export const START_ABOVE_FOOTER_RATIO = 0.3;

const COLOR_ON_PAPER = '#130F0B';
const COLOR_ON_FOOTER = '#FFFFFF';

/**
 * Footer rise scene (called inside gsap.context() by the integrator).
 *
 * The background image fills the footer's hero block permanently (it's
 * `min-height: 100svh` in CSS) — it never animates. Only the title scrubs
 * into place:
 *
 * 1. It starts already visible in depoimentos, in the lower third of that
 *    screen, below the testimonials card.
 * 2. As the footer scrolls in (`top bottom` → `top top`), the title rides
 *    down into its natural resting position inside the footer.
 *
 * Color scrubs with the same progress: ink on paper → white on the dark
 * footer, so the CTA stays legible in both surfaces.
 */
export function footerRise(sectionEl: HTMLElement, titleEl: HTMLElement): void {
  const titleOffsetFromSectionTop = Math.max(
    0,
    titleEl.getBoundingClientRect().top - sectionEl.getBoundingClientRect().top,
  );

  const distanceAboveFooter = Math.round(
    window.innerHeight * START_ABOVE_FOOTER_RATIO,
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
