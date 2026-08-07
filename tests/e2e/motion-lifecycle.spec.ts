import { expect, test } from '@playwright/test';

import {
  heroImageTransform,
  scrollTriggerCount,
  waitForScrollTriggersRegistered,
} from './helpers/motion';

test.describe('T43: ScrollTrigger lifecycle', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('T43: reload does not leak ScrollTrigger instances', async ({ page }) => {
    await page.goto('/');
    await waitForScrollTriggersRegistered(page);
    const count1 = await scrollTriggerCount(page);
    expect(count1).toBeGreaterThan(0);

    await page.reload();
    await waitForScrollTriggersRegistered(page);
    const count2 = await scrollTriggerCount(page);

    await page.reload();
    await waitForScrollTriggersRegistered(page);
    const count3 = await scrollTriggerCount(page);

    expect(count2).toBe(count1);
    expect(count3).toBe(count1);
  });
});

test.describe('T49: hero mouse parallax', () => {
  test('T49: fine pointer moves hero image transform; coarse does not', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await page.waitForSelector('.hero-section__image-layer');

    const before = await heroImageTransform(page);

    const hero = page.locator('#hero');
    const box = await hero.boundingBox();
    expect(box).toBeTruthy();

    await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.2);
    await page.waitForTimeout(100);
    await page.mouse.move(box!.x + box!.width * 0.8, box!.y + box!.height * 0.8);
    await page.waitForTimeout(700);

    const after = await heroImageTransform(page);
    const isMobile = testInfo.project.name.startsWith('mobile');

    if (isMobile) {
      expect(after).toBe(before);
    } else {
      // Desktop chromium (and other fine-pointer projects): parallax should react
      expect(after).not.toBe(before);
    }
  });
});
