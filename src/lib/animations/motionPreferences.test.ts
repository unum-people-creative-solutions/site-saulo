import gsap from 'gsap';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerMotionContexts } from './motionPreferences';

function mockMatchMedia(matchesFor: (query: string) => boolean) {
  return vi.fn((query: string): MediaQueryList => {
    const matches = matchesFor(query);
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

describe('registerMotionContexts', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it('calls reduced handler, not full, when prefers-reduced-motion: reduce', () => {
    window.matchMedia = mockMatchMedia((query) =>
      query.includes('prefers-reduced-motion: reduce'),
    );

    const mm = gsap.matchMedia();
    const full = vi.fn();
    const reduced = vi.fn();
    const mobile = vi.fn();

    registerMotionContexts(mm, { full, reduced, mobile });

    expect(reduced).toHaveBeenCalled();
    expect(full).not.toHaveBeenCalled();

    mm.revert();
  });
});
