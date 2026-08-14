import { expect, test } from '@playwright/test';

import {
  countPinOrScrubTriggers,
  expectCoreNarrativeVisible,
  pinnedTriggerIds,
  waitForScrollTriggerSeam,
} from './helpers/motion';

test.describe('T41: reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('T41: reduced motion registers zero pin/scrub triggers, all content visible', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForScrollTriggerSeam(page);

    const pinnedCount = await countPinOrScrubTriggers(page);
    expect(pinnedCount).toBe(0);

    await expectCoreNarrativeVisible(page);

    const footer = page.getByRole('button', { name: 'Iniciar um contato.' });
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });
});

test.describe('T42: below 1024px', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('T42: below 1024px only Sobre may pin; gallery stays free to scroll', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForScrollTriggerSeam(page);

    // About text reveal matches desktop (pinned scrub). No other pins.
    expect(await pinnedTriggerIds(page)).toEqual(['sobre']);

    const track = page.locator('#galeria .gallery-section__track');
    await expect(track).toBeAttached();

    const overflows = await track.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(overflows).toBe(true);

    const snapType = await track.evaluate((el) => getComputedStyle(el).scrollSnapType);
    expect(snapType === 'none' || snapType === '').toBe(true);

    const before = await track.evaluate((el) => el.scrollLeft);
    await track.evaluate((el) => {
      el.scrollBy({ left: 120, behavior: 'instant' as ScrollBehavior });
    });
    const after = await track.evaluate((el) => el.scrollLeft);
    expect(after).toBeGreaterThan(before);

    // Mandatory snap would pull the track back to a card's start edge.
    await expect
      .poll(async () => track.evaluate((el) => el.scrollLeft), { timeout: 500 })
      .toBe(after);
  });

  test('footer CTA rests below the fixed header wordmark', async ({ page }) => {
    await page.goto('/');
    await waitForScrollTriggerSeam(page);

    const footer = page.locator('footer.footer-section');
    await footer.evaluate((el) => el.scrollIntoView({ block: 'start' }));

    await expect
      .poll(async () =>
        footer.evaluate((el) => Math.round(el.getBoundingClientRect().top)),
      )
      .toBeLessThanOrEqual(2);

    const gap = await page.evaluate(() => {
      const title = document.querySelector('.hero-section__title');
      const cta = document.querySelector('.footer-section__title');
      if (!title || !cta) return null;

      const range = document.createRange();
      range.selectNodeContents(title);
      const wordmarkBox = range.getBoundingClientRect();
      const ctaBox = cta.getBoundingClientRect();

      return ctaBox.top - (wordmarkBox.bottom || title.getBoundingClientRect().bottom);
    });

    expect(gap).toBeGreaterThan(8);
  });
});
