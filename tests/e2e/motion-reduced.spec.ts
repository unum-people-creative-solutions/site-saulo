import { expect, test } from '@playwright/test';

import {
  countPinOrScrubTriggers,
  countPinTriggers,
  expectCoreNarrativeVisible,
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

  test('T42: below 1024px registers zero pin', async ({ page }) => {
    await page.goto('/');
    await waitForScrollTriggerSeam(page);

    const pinCount = await countPinTriggers(page);
    expect(pinCount).toBe(0);

    const track = page.locator('#galeria .gallery-section__track');
    await expect(track).toBeAttached();

    const overflows = await track.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(overflows).toBe(true);

    const before = await track.evaluate((el) => el.scrollLeft);
    await track.evaluate((el) => {
      el.scrollBy({ left: 120, behavior: 'instant' as ScrollBehavior });
    });
    const after = await track.evaluate((el) => el.scrollLeft);
    expect(after).toBeGreaterThan(before);
  });
});
