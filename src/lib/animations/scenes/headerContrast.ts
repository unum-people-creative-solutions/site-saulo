import { ScrollTrigger } from '../gsap-context';

const ON_LIGHT_CLASS = 'hero-section__header--on-light';
const LIGHT_SECTION_SELECTOR = '#galeria, #depoimentos';
const FOOTER_SELECTOR = 'footer.footer-section';

function overlaps(
  a: Pick<DOMRect, 'top' | 'bottom'>,
  b: Pick<DOMRect, 'top' | 'bottom'>,
): boolean {
  return a.top < b.bottom && a.bottom > b.top;
}

/**
 * Keeps the fixed header (wordmark + CTA) legible as it floats over the
 * page: white on dark sections, ink on paper sections (galeria /
 * depoimentos).
 *
 * Uses live geometry — not precomputed start/end ranges — so pin-spacers
 * from about/gallery don't shift the contrast window onto the wrong
 * section. Footer wins over the testimonials bridge: as soon as the dark
 * footer overlaps the header, stay white even if #depoimentos' bottom
 * padding still intersects the same band.
 */
export function headerContrast(headerEl: HTMLElement): () => void {
  const sync = () => {
    const headerRect = headerEl.getBoundingClientRect();

    const footer = document.querySelector<HTMLElement>(FOOTER_SELECTOR);
    if (footer && overlaps(footer.getBoundingClientRect(), headerRect)) {
      headerEl.classList.remove(ON_LIGHT_CLASS);
      return;
    }

    const overLight = Array.from(
      document.querySelectorAll<HTMLElement>(LIGHT_SECTION_SELECTOR),
    ).some((section) => overlaps(section.getBoundingClientRect(), headerRect));

    headerEl.classList.toggle(ON_LIGHT_CLASS, overLight);
  };

  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: sync,
    onRefresh: sync,
  });

  sync();

  return () => {
    trigger.kill();
    headerEl.classList.remove(ON_LIGHT_CLASS);
  };
}
