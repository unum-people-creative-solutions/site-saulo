'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import './ScrollArrow.css';

export type ScrollArrowHandle = {
  el: HTMLElement;
};

/**
 * Fixed-to-viewport arrow, persistent across the whole page (full motion
 * mode only — see ScrollArrow.css). scrollArrow.ts drives its position
 * (data-state: down/right/hidden) as the page scrolls through the gallery
 * and footer.
 *
 * Glyph is the same Uncut Sans ↓ used by ScrollCue / back-to-top. Contrast
 * against the pixels under the arrow uses `mix-blend-mode: difference`
 * (see ScrollArrow.css) — no painted halo.
 */
export const ScrollArrow = forwardRef<ScrollArrowHandle>(function ScrollArrow(
  _props,
  ref,
) {
  const elRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      get el() {
        if (!elRef.current) {
          throw new Error('ScrollArrow missing el');
        }
        return elRef.current;
      },
    }),
    [],
  );

  return (
    <div ref={elRef} className="scroll-arrow" data-state="down" aria-hidden="true">
      <span className="scroll-arrow__icon">&#8595;</span>
    </div>
  );
});

ScrollArrow.displayName = 'ScrollArrow';
