'use client';

import { useEffect, type RefObject } from 'react';

import { createScene } from './gsap-context';

export function useScrollScene(
  ref: RefObject<HTMLElement | null>,
  sceneFactory: (el: HTMLElement) => void,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = createScene(() => {
      sceneFactory(el);
    }, el);

    return () => {
      ctx.revert();
    };
  }, [ref, sceneFactory]);
}
