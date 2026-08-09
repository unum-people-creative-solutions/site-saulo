import { gsap } from '../gsap-context';

export type AboutRevealOptions = {
  /**
   * Desktop default: pin the section while blocks scrub in.
   * Pass `false` only if a caller must avoid pins (legacy); mobile now
   * uses the same pinned choreography as desktop.
   */
  pin?: boolean;
};

/** Scroll length of the about pin scrub — `(N-1)*60%` of the viewport. */
export function aboutRevealScrubEnd(blockCount: number): string {
  return `+=${Math.max(blockCount - 1, 1) * 60}%`;
}

/**
 * Pinned about section: text blocks reveal in sequence via opacity/y scrub.
 * Initial state uses opacity only — never display/visibility — so content
 * remains present under reduced-motion when this scene does not run.
 *
 * Scroll distance scales with block count (N blocks → +=(N-1)*60%) — 60%
 * per block instead of 100%, so text appears faster relative to scroll.
 */
export function aboutReveal(
  sectionEl: HTMLElement,
  blockEls: HTMLElement[],
  options: AboutRevealOptions = {},
): void {
  const pin = options.pin ?? true;

  gsap.set(blockEls, { opacity: 0, y: 24 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionEl,
      pin,
      scrub: true,
      start: 'top top',
      end: aboutRevealScrubEnd(blockEls.length),
    },
  });

  for (const block of blockEls) {
    tl.to(block, { opacity: 1, y: 0, ease: 'none' });
  }
}
