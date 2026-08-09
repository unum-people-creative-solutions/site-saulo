import { ScrollTrigger } from '../gsap-context';

const PAN_START = 10;
const PAN_END = 100;

/**
 * Mobile-only horizontal pan across the hero video's crop. `object-fit:
 * cover` on a narrow portrait viewport only shows a thin center slice of
 * the (16:9) video — most of the frame, including the more interesting
 * edges, gets cropped away. Panning that slice from 10% → 100% across
 * Hero through the end of the Sobre text reveal keeps the video motion
 * tied to the same scroll window as `aboutReveal` (not cutting off at
 * mid-Sobre).
 *
 * Sets `--hero-pan-x` on the image-layer wrapper; `.hero-section__image`
 * reads it as its object-position (HeroSection.css) — video and canvas
 * share the one custom property instead of being targeted individually.
 *
 * Requires `aboutReveal` to be registered first so its pin ScrollTrigger
 * exists (MotionOrchestrator mobile context already orders it that way).
 */
export function heroMobilePan(
  imageEl: HTMLElement,
  heroSectionEl: HTMLElement,
  aboutSectionEl: HTMLElement,
): void {
  imageEl.style.setProperty('--hero-pan-x', `${PAN_START}%`);

  ScrollTrigger.create({
    trigger: heroSectionEl,
    start: 'top top',
    scrub: true,
    invalidateOnRefresh: true,
    // Absolute scroll position where aboutReveal's pin scrub finishes —
    // keeps video pan progress === 1 at the same beat the last text block
    // lands.
    end: () => {
      const aboutRevealSt = ScrollTrigger.getAll().find(
        (st) => st.trigger === aboutSectionEl && Boolean(st.vars.pin),
      );
      if (aboutRevealSt) {
        return aboutRevealSt.end;
      }
      return (
        aboutSectionEl.getBoundingClientRect().bottom + window.scrollY
      );
    },
    onUpdate: (self) => {
      const pct = PAN_START + self.progress * (PAN_END - PAN_START);
      imageEl.style.setProperty('--hero-pan-x', `${pct}%`);
    },
  });
}
