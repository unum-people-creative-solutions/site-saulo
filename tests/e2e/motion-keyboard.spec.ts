import { expect, test, type Page } from '@playwright/test';

import { waitForScrollTriggersRegistered } from './helpers/motion';

const FOCUSABLE =
  ':is(a,button,input,select,textarea,[tabindex]):not([tabindex="-1"])';

type FocusSnapshot = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  tag: string;
  name: string;
  section: 'about' | 'galeria' | null;
  scrollY: number;
};

async function readActiveFocus(page: Page) {
  return page.evaluate<FocusSnapshot | null>(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const r = el.getBoundingClientRect();
    return {
      top: r.top,
      bottom: r.bottom,
      left: r.left,
      right: r.right,
      tag: el.tagName,
      name:
        el.getAttribute('aria-label') ||
        el.textContent?.trim().slice(0, 80) ||
        el.tagName,
      scrollY: window.scrollY,
      section: el.closest('#sobre')
        ? 'about'
        : el.closest('#galeria')
          ? 'galeria'
          : null,
    };
  });
}

function expectFocusInViewport(
  box: FocusSnapshot,
  viewport: { width: number; height: number },
  step: number,
) {
  expect(
    box.top,
    `focus top out of viewport at step ${step} (${box.name})`,
  ).toBeGreaterThanOrEqual(-1);
  expect(
    box.bottom,
    `focus bottom out of viewport at step ${step} (${box.name})`,
  ).toBeLessThanOrEqual(viewport.height + 1);
  expect(
    box.left,
    `focus left out of viewport at step ${step} (${box.name})`,
  ).toBeGreaterThanOrEqual(-1);
  expect(
    box.right,
    `focus right out of viewport at step ${step} (${box.name})`,
  ).toBeLessThanOrEqual(viewport.width + 1);
}

test.describe('T45: keyboard focus stays in viewport', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('T45: focus never leaves the viewport while tabbing through the page', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForScrollTriggersRegistered(page);

    const focusableCount = await page.locator(FOCUSABLE).count();
    expect(focusableCount).toBeGreaterThan(0);

    const viewport = page.viewportSize()!;

    for (let i = 0; i < focusableCount; i++) {
      await page.keyboard.press('Tab');

      const box = await readActiveFocus(page);

      if (!box) continue;

      expectFocusInViewport(box, viewport, i + 1);
    }
  });

  test('T45b: focus entering a not-yet-engaged pinned section stays visible', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForScrollTriggersRegistered(page);

    const focusableCount = await page.locator(FOCUSABLE).count();
    expect(focusableCount).toBeGreaterThan(0);

    const viewport = page.viewportSize()!;
    let reachedPinnedSection = false;

    for (let i = 0; i < focusableCount; i++) {
      await page.keyboard.press('Tab');

      const box = await readActiveFocus(page);
      if (!box) continue;

      expectFocusInViewport(box, viewport, i + 1);

      if (box.section === 'about' || box.section === 'galeria') {
        reachedPinnedSection = true;
        break;
      }
    }

    expect(reachedPinnedSection).toBe(true);
  });
});
