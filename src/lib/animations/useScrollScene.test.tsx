import { cleanup, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const revert = vi.fn();

vi.mock('./gsap-context', () => ({
  createScene: vi.fn((fn: () => void) => {
    fn();
    return { revert };
  }),
}));

import { createScene } from './gsap-context';
import { useScrollScene } from './useScrollScene';

function TestScene({
  sceneFactory,
}: {
  sceneFactory: (el: HTMLElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollScene(ref, sceneFactory);
  return <div ref={ref} />;
}

describe('useScrollScene', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('calls sceneFactory on mount and revert on unmount', () => {
    const sceneFactory = vi.fn();

    const { unmount } = render(<TestScene sceneFactory={sceneFactory} />);

    expect(createScene).toHaveBeenCalled();
    expect(sceneFactory).toHaveBeenCalledTimes(1);
    expect(sceneFactory.mock.calls[0]?.[0]).toBeInstanceOf(HTMLElement);

    unmount();

    expect(revert).toHaveBeenCalledTimes(1);
  });
});
