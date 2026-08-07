import { gsap } from '../gsap-context';

/**
 * Pinned about section: text blocks reveal in sequence via opacity/y scrub.
 * Initial state uses opacity only — never display/visibility — so content
 * remains present under reduced-motion when this scene does not run.
 *
 * Scroll distance scales with block count (N blocks → +=(N-1)*100%).
 */
export function aboutReveal(
  sectionEl: HTMLElement,
  blockEls: HTMLElement[],
): void {
  gsap.set(blockEls, { opacity: 0, y: 24 });

  const scrubDistance = `${Math.max(blockEls.length - 1, 1) * 100}%`;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionEl,
      pin: true,
      scrub: true,
      start: 'top top',
      end: `+=${scrubDistance}`,
    },
  });

  for (const block of blockEls) {
    tl.to(block, { opacity: 1, y: 0, ease: 'none' });
  }
}
