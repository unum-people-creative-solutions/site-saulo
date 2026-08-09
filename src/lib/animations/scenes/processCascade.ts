import { gsap } from '../gsap-context';

const ENTER_DURATION = 0.7;
// 30% faster than the original 1.4s, then another 20% on top: 0.784s.
const CARDS_DURATION = 0.6;
/** Wait for each card to finish before the next starts. */
const CARDS_STAGGER = CARDS_DURATION;
const ENTER_EASE = 'power3.out';
const TOGGLE = 'play none none reverse';

/** When a card's top crosses this viewport line, it fades in (mobile). */
const MOBILE_CARD_START = 'top 80%';

export type ProcessCascadeOptions = {
  /**
   * `section` (default / desktop): thresholds by how much of the section
   * has entered; cards stagger as one group.
   * `per-card` (mobile): each card (and stage) reveals when it crosses
   * the viewport height line — one beat per screen as you scroll.
   */
  mode?: 'section' | 'per-card';
};

/**
 * Process section staged reveal (no pin — client anti-fatigue).
 *
 * Desktop (`section`):
 *   Visibility thresholds measured as how much of the section has entered
 *   from the bottom of the viewport:
 *     ~30% → title + subtitle
 *     ~60% → 4 act cards (one at a time)
 *     ~90% → closing copy
 *     ~95% → CTA
 *
 * Mobile (`per-card`):
 *   Each element fades in when its top hits 80% of the viewport height,
 *   so cards appear as the screen descends past them.
 */
export function processCascade(
  sectionEl: HTMLElement,
  titleEl: HTMLElement,
  subtitleEl: HTMLElement,
  cardEls: HTMLElement[],
  closingEl: HTMLElement,
  ctaEl: HTMLElement,
  options: ProcessCascadeOptions = {},
): void {
  const mode = options.mode ?? 'section';
  const stages = [titleEl, subtitleEl, ...cardEls, closingEl, ctaEl];

  gsap.set(stages, {
    opacity: 0,
    y: 24,
  });

  if (mode === 'per-card') {
    revealPerViewport([titleEl, subtitleEl], cardEls, closingEl, ctaEl);
    return;
  }

  revealBySectionRatio(
    sectionEl,
    titleEl,
    subtitleEl,
    cardEls,
    closingEl,
    ctaEl,
  );
}

function fadeIn(targets: gsap.TweenTarget, vars: gsap.TweenVars = {}) {
  return gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration: ENTER_DURATION,
    ease: ENTER_EASE,
    ...vars,
  });
}

function revealBySectionRatio(
  sectionEl: HTMLElement,
  titleEl: HTMLElement,
  subtitleEl: HTMLElement,
  cardEls: HTMLElement[],
  closingEl: HTMLElement,
  ctaEl: HTMLElement,
) {
  const visibleStart = (ratio: number) => () =>
    `top bottom-=${Math.round(sectionEl.offsetHeight * ratio)}`;

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

function revealPerViewport(
  headerEls: HTMLElement[],
  cardEls: HTMLElement[],
  closingEl: HTMLElement,
  ctaEl: HTMLElement,
) {
  // Header pair as one beat when the title crosses the line.
  gsap
    .timeline({
      scrollTrigger: {
        trigger: headerEls[0],
        start: MOBILE_CARD_START,
        toggleActions: TOGGLE,
      },
    })
    .add(fadeIn(headerEls));

  for (const card of cardEls) {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: card,
          start: MOBILE_CARD_START,
          toggleActions: TOGGLE,
        },
      })
      .add(fadeIn(card));
  }

  gsap
    .timeline({
      scrollTrigger: {
        trigger: closingEl,
        start: MOBILE_CARD_START,
        toggleActions: TOGGLE,
      },
    })
    .add(fadeIn(closingEl));

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ctaEl,
        start: MOBILE_CARD_START,
        toggleActions: TOGGLE,
      },
    })
    .add(fadeIn(ctaEl));
}
