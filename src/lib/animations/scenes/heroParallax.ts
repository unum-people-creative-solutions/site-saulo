import { gsap, ScrollTrigger } from '../gsap-context';

/** ±1.5% of section size — stays well inside the 5% overscan margin that
 *  scale 1.1 leaves on each edge, even though the effect now spans two
 *  sections' worth of mouse movement (Hero + Sobre) instead of one. */
const PARALLAX_AMPLITUDE = 0.015;

/**
 * Hero + Sobre shared media motion (called inside gsap.context() by the
 * integrator).
 *
 * Scale: set via gsap.set to 1.1 (110%) — not CSS.
 * Mouse: ±1.5% of section size as x/y, only when (pointer: fine). The
 *        listener is bound to both Hero and Sobre — same shared backdrop,
 *        same handler — so the effect continues as the mouse moves from one
 *        into the other, not just while over Hero.
 * Scroll: intentionally none. The media is a shared fixed backdrop through
 *         Sobre / Journey — scroll-linked y drift made it sink while rolling
 *         and must stay off.
 *
 * Transform is applied to the image-layer wrapper only — never to <video>
 * nodes. A second playing <video> (or per-element transforms on video) can
 * escape the parallax matrix and paint offset; soft-loop uses a canvas
 * frame inside this same wrapper instead.
 */
export function heroParallax(
  imageEl: HTMLElement,
  heroSectionEl: HTMLElement,
  aboutSectionEl: HTMLElement,
): (() => void) | void {
  gsap.set(imageEl, { scale: 1.1, x: 0, y: 0, yPercent: 0 });

  const finePointer = window.matchMedia('(pointer: fine)').matches;
  let onHeroMouseMove: ((event: MouseEvent) => void) | undefined;
  let onAboutMouseMove: ((event: MouseEvent) => void) | undefined;

  const lockImage = () => {
    gsap.set(imageEl, { x: 0, y: 0, yPercent: 0 });
  };

  const makeMouseMoveHandler =
    (sectionEl: HTMLElement) => (event: MouseEvent) => {
      const rect = sectionEl.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      if (rect.width === 0 || rect.height === 0) return;

      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      const x = (nx - 0.5) * 2 * PARALLAX_AMPLITUDE * rect.width;
      const y = (ny - 0.5) * 2 * PARALLAX_AMPLITUDE * rect.height;

      gsap.to(imageEl, {
        x,
        y,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

  if (finePointer) {
    onHeroMouseMove = makeMouseMoveHandler(heroSectionEl);
    onAboutMouseMove = makeMouseMoveHandler(aboutSectionEl);
    heroSectionEl.addEventListener('mousemove', onHeroMouseMove);
    aboutSectionEl.addEventListener('mousemove', onAboutMouseMove);
  }

  // Clear any mouse offset once Sobre itself has fully scrolled past, so
  // the shared backdrop is centered by the time Journey takes over.
  const lockTrigger = ScrollTrigger.create({
    trigger: aboutSectionEl,
    start: 'top top',
    end: 'bottom top',
    onLeave: lockImage,
    onEnterBack: lockImage,
  });

  return () => {
    if (onHeroMouseMove) {
      heroSectionEl.removeEventListener('mousemove', onHeroMouseMove);
    }
    if (onAboutMouseMove) {
      aboutSectionEl.removeEventListener('mousemove', onAboutMouseMove);
    }
    lockTrigger.kill();
    lockImage();
  };
}
