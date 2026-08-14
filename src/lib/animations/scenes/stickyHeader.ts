import { gsap } from '../gsap-context';

/**
 * Sticky header scene (called inside gsap.context() by the integrator).
 *
 * The header/CTA are the single, persistent header element — always
 * `position: fixed` via plain CSS (see HeroSection.css), living outside
 * every section's DOM subtree so no section's `isolation: isolate` +
 * `overflow: hidden` media layer can ever clip or trap it. This scene's only
 * job is a purely cosmetic `y` transform: the header visually starts at
 * `innerHeight * startRatio` (0.38 desktop, lower on mobile) and scrubs
 * up to `y: 0` (its fixed `top: 0`) as the user scrolls the first ~420px
 * of the Hero. Once the scrub
 * completes it simply stays there — same element, same transparent
 * appearance, no further toggling of position/visibility/opacity needed,
 * and scrolling back up smoothly re-drives the same tween in reverse.
 */
export function stickyHeader(
  heroSectionEl: HTMLElement,
  headerEl: HTMLElement,
  ctaEl: HTMLElement,
  startRatio = 0.38,
): void {
  const targets = [headerEl, ctaEl];
  const startY = Math.round(window.innerHeight * startRatio);

  gsap.fromTo(
    targets,
    { y: startY },
    {
      y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSectionEl,
        start: 'top top',
        end: '+=420',
        scrub: true,
      },
    },
  );
}
