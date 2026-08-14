import { ScrollTrigger } from '../gsap-context';

export const SECTION_SELECTOR =
  '#hero, #sobre, #processo, #galeria, #depoimentos, footer.footer-section';

const LOCKED_SECTION_ID = 'depoimentos';

const MAGNET_VIEWPORT = 0.35;
const MAGNET_GAP = 0.25;
const MERGE_PX = 16;
const AT_POINT_PX = 2;

export type PinRange = {
  trigger: HTMLElement;
  start: number;
  end: number;
};

export type SnapRange = {
  start: number;
  end: number;
};

export type SnapModel = {
  points: number[];
  interiors: SnapRange[];
  lockedPoints: number[];
};

function mergeEntries(
  entries: { y: number; locked: boolean }[],
  maxScroll: number,
): { y: number; locked: boolean }[] {
  const sorted = [...entries]
    .map((entry) => ({
      y: Math.min(Math.max(0, entry.y), Math.max(0, maxScroll)),
      locked: entry.locked,
    }))
    .sort((a, b) => a.y - b.y);

  const merged: { y: number; locked: boolean }[] = [];
  for (const entry of sorted) {
    const previous = merged.at(-1);
    if (previous === undefined || entry.y - previous.y > MERGE_PX) {
      merged.push(entry);
    } else {
      previous.locked = previous.locked || entry.locked;
    }
  }
  return merged;
}

function sectionTopY(
  section: HTMLElement,
  pinRanges: PinRange[],
  scrollY: number,
): number {
  const pin = pinRanges.find((range) => range.trigger === section);
  if (pin) return pin.start;
  return scrollY + section.getBoundingClientRect().top;
}

export function buildSnapModel(options: {
  sections: HTMLElement[];
  pinRanges: PinRange[];
  viewportHeight: number;
  scrollY: number;
  maxScroll: number;
}): SnapModel {
  const merged = mergeEntries(
    options.sections.map((section) => ({
      y: sectionTopY(section, options.pinRanges, options.scrollY),
      locked: section.id === LOCKED_SECTION_ID,
    })),
    options.maxScroll,
  );

  const points = merged.map((entry) => entry.y);
  const lockedPoints = merged
    .filter((entry) => entry.locked)
    .map((entry) => entry.y);

  const interiors: SnapRange[] = [];
  for (let index = 0; index < merged.length - 1; index++) {
    if (merged[index].locked) continue;

    const start = merged[index].y;
    const end = merged[index + 1].y;
    const gap = end - start;
    if (gap <= 48) continue;

    const edge = Math.min(
      options.viewportHeight * MAGNET_VIEWPORT,
      gap * MAGNET_GAP,
    );
    if (end - edge <= start + edge) continue;
    interiors.push({ start: start + edge, end: end - edge });
  }

  return { points, interiors, lockedPoints };
}

export function pickSnapY(
  y: number,
  _direction: number,
  model: SnapModel,
): number | null {
  if (model.points.length === 0) return null;
  if (model.interiors.some((range) => y > range.start && y < range.end)) {
    return null;
  }

  let best = model.points[0];
  let bestDist = Math.abs(y - best);
  for (const point of model.points) {
    const dist = Math.abs(y - point);
    if (dist < bestDist) {
      best = point;
      bestDist = dist;
    }
  }

  if (bestDist <= AT_POINT_PX) return null;
  return best;
}

function readPinRanges(): PinRange[] {
  return ScrollTrigger.getAll().flatMap((trigger) => {
    if (!trigger.pin || !(trigger.trigger instanceof HTMLElement)) return [];
    return [
      {
        trigger: trigger.trigger,
        start: trigger.start,
        end: trigger.end,
      },
    ];
  });
}

function liveModel(): SnapModel {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>(SECTION_SELECTOR),
  );
  return buildSnapModel({
    sections,
    pinRanges: readPinRanges(),
    viewportHeight: window.innerHeight,
    scrollY: window.scrollY,
    maxScroll: ScrollTrigger.maxScroll(window),
  });
}

/**
 * Seats each section to the viewport on arrival. Native scroll stays live —
 * leftover wheel is not swallowed. Pin interiors (Sobre, galeria) keep
 * free scrub. `#depoimentos` has no free-scroll mix with the footer, but
 * still seats when arriving from the gallery (nearest snap, not skip-ahead).
 */
export function sectionSnap(): () => void {
  if (process.env.NEXT_PUBLIC_E2E === '1') {
    return () => {};
  }

  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    snap: {
      snapTo: (progress, self) => {
        const max = ScrollTrigger.maxScroll(window);
        if (max <= 0) return progress;
        const y = progress * max;
        const target = pickSnapY(y, self?.direction ?? 1, liveModel());
        if (target == null) return progress;
        return target / max;
      },
      duration: 0.55,
      delay: 0.06,
      ease: 'power2.out',
      inertia: false,
    },
  });

  return () => {
    trigger.kill();
  };
}
