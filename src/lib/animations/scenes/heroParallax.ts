import { gsap, ScrollTrigger } from '../gsap-context';

/**
 * Hero media motion (called inside gsap.context() by the integrator).
 *
 * Scale: set via gsap.set to 1.1 (110%) — not CSS.
 * Mouse: ±3% of section size as x/y, only when (pointer: fine) and the Hero
 *        is still intersecting the viewport.
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
  sectionEl: HTMLElement,
): (() => void) | void {
  gsap.set(imageEl, { scale: 1.1, x: 0, y: 0, yPercent: 0 });

  const finePointer = window.matchMedia('(pointer: fine)').matches;
  let onMouseMove: ((event: MouseEvent) => void) | undefined;

  const lockImage = () => {
    gsap.set(imageEl, { x: 0, y: 0, yPercent: 0 });
  };

  if (finePointer) {
    onMouseMove = (event: MouseEvent) => {
      const rect = sectionEl.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      if (rect.width === 0 || rect.height === 0) return;

      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      const x = (nx - 0.5) * 2 * 0.03 * rect.width;
      const y = (ny - 0.5) * 2 * 0.03 * rect.height;

      gsap.to(imageEl, {
        x,
        y,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    sectionEl.addEventListener('mousemove', onMouseMove);
  }

  // Clear any mouse offset as soon as the Hero starts leaving, so the
  // shared backdrop is centered for Sobre / Journey.
  const lockTrigger = ScrollTrigger.create({
    trigger: sectionEl,
    start: 'top top',
    end: 'top+=80 top',
    onLeave: lockImage,
    onEnterBack: lockImage,
  });

  return () => {
    if (onMouseMove) {
      sectionEl.removeEventListener('mousemove', onMouseMove);
    }
    lockTrigger.kill();
    lockImage();
  };
}
