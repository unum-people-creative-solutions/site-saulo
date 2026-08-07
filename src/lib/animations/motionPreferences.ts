import type gsap from 'gsap';

type MotionContextHandler = (ctx: gsap.Context) => void | (() => void);

export type MotionContextHandlers = {
  full: MotionContextHandler;
  reduced: MotionContextHandler;
  mobile: MotionContextHandler;
};

/**
 * Registers motion contexts via gsap.matchMedia().
 * Priority (safe-by-default — when in doubt, do not animate):
 * 1. prefers-reduced-motion: reduce → no pin/scrub scenes
 * 2. max-width: 1023px → simple reveals only (no GSAP horizontal scroll)
 * 3. min-width: 1024px + no-preference → full pin/scrub scenes
 */
export function registerMotionContexts(
  mm: gsap.MatchMedia,
  handlers: MotionContextHandlers,
): void {
  mm.add('(prefers-reduced-motion: reduce)', handlers.reduced);
  mm.add('(max-width: 1023px)', handlers.mobile);
  mm.add(
    '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
    handlers.full,
  );
}
