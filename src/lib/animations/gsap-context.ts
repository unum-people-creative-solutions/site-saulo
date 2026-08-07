import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  if (process.env.NEXT_PUBLIC_E2E === '1') {
    (window as unknown as { __scrollTrigger?: typeof ScrollTrigger }).__scrollTrigger =
      ScrollTrigger;
  }
}

export function createScene(
  fn: () => void,
  scope?: Element | null,
): gsap.Context {
  return gsap.context(fn, scope ?? undefined);
}

export { gsap, ScrollTrigger };
