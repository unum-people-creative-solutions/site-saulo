import { afterEach, describe, expect, it, vi } from 'vitest';

import { ScrollTrigger } from '../gsap-context';
import { heroBackdrop } from './heroBackdrop';

function stubRect(el: HTMLElement, top: number, height: number) {
  el.getBoundingClientRect = () =>
    ({
      top,
      left: 0,
      bottom: top + height,
      right: 400,
      width: 400,
      height,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;
}

describe('heroBackdrop', () => {
  afterEach(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill());
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('stays active while Journey is still on or below the viewport', () => {
    const backdropEl = document.createElement('div');
    const journeyEl = document.createElement('section');
    journeyEl.id = 'processo';
    // Below the fold — Sobre remnant may still be visible above.
    stubRect(journeyEl, 1200, 900);

    document.body.append(backdropEl, journeyEl);

    heroBackdrop(backdropEl, journeyEl);
    const watcher = ScrollTrigger.getAll().at(-1)!;
    watcher.vars.onUpdate?.(watcher);

    expect(backdropEl.getAttribute('data-released')).toBeNull();
  });

  it('stays active while Journey fills the viewport (Sobre may still peek)', () => {
    const backdropEl = document.createElement('div');
    const journeyEl = document.createElement('section');
    stubRect(journeyEl, 0, 900);

    document.body.append(backdropEl, journeyEl);

    heroBackdrop(backdropEl, journeyEl);
    const watcher = ScrollTrigger.getAll().at(-1)!;
    watcher.vars.onUpdate?.(watcher);

    expect(backdropEl.getAttribute('data-released')).toBeNull();
  });

  it('releases only after Journey has scrolled fully past the top', () => {
    const backdropEl = document.createElement('div');
    const video = document.createElement('video');
    vi.spyOn(video, 'pause').mockImplementation(() => undefined);
    backdropEl.append(video);

    const journeyEl = document.createElement('section');
    stubRect(journeyEl, 0, 900);
    document.body.append(backdropEl, journeyEl);

    const cleanup = heroBackdrop(backdropEl, journeyEl);
    const watcher = ScrollTrigger.getAll().at(-1)!;

    stubRect(journeyEl, -1000, 900);
    watcher.vars.onUpdate?.(watcher);

    expect(backdropEl.getAttribute('data-released')).toBe('true');

    cleanup();
    expect(backdropEl.getAttribute('data-released')).toBeNull();
  });
});
