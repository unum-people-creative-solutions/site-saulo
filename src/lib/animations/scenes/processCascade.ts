import { gsap } from '../gsap-context';

const ENTER_DURATION = 0.7;
const CARDS_DURATION = 1.4;
/** Wait for each card to finish before the next starts. */
const CARDS_STAGGER = CARDS_DURATION;
const ENTER_EASE = 'power3.out';
const TOGGLE = 'play none none reverse';

/**
 * Process section staged reveal (no pin — client anti-fatigue).
 *
 * Visibility thresholds measured as how much of the section has entered
 * from the bottom of the viewport:
 *   ~30% → title + subtitle
 *   ~60% → 4 act cards (one at a time)
 *   ~90% → closing copy
 *   ~95% → CTA
 */
export function processCascade(
  sectionEl: HTMLElement,
  titleEl: HTMLElement,
  subtitleEl: HTMLElement,
  cardEls: HTMLElement[],
  closingEl: HTMLElement,
  ctaEl: HTMLElement,
): void {
  gsap.set([titleEl, subtitleEl, ...cardEls, closingEl, ctaEl], {
    opacity: 0,
    y: 24,
  });

  const visibleStart = (ratio: number) => () =>
    `top bottom-=${Math.round(sectionEl.offsetHeight * ratio)}`;

  const fadeIn = (
    targets: gsap.TweenTarget,
    vars: gsap.TweenVars = {},
  ) =>
    gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: ENTER_DURATION,
      ease: ENTER_EASE,
      ...vars,
    });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: visibleStart(0.3),
        toggleActions: TOGGLE,
      },
    })
    .add(fadeIn([titleEl, subtitleEl]));

  gsap
    .timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: visibleStart(0.6),
        toggleActions: TOGGLE,
      },
    })
    .add(
      fadeIn(cardEls, {
        duration: CARDS_DURATION,
        stagger: CARDS_STAGGER,
      }),
    );

  gsap
    .timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: visibleStart(0.9),
        toggleActions: TOGGLE,
      },
    })
    .add(fadeIn(closingEl));

  gsap
    .timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: visibleStart(0.95),
        toggleActions: TOGGLE,
      },
    })
    .add(fadeIn(ctaEl));
}
