import { expect, test } from '@playwright/test';

test.describe('polish-and-launch discovery', () => {
  test('T53: metadata and structured data are present and valid', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description).toBeTruthy();
    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute('content');
    expect(ogImage).toBeTruthy();
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');
    expect(canonical).toBeTruthy();

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(() => JSON.parse(jsonLd ?? '')).not.toThrow();
    const parsed = JSON.parse(jsonLd ?? '{}');
    expect(parsed.telephone).toBeTruthy();
    expect(parsed.email).toBeTruthy();
  });

  test('T54: initial home load makes no external-origin requests', async ({
    page,
    baseURL,
  }) => {
    const origin = new URL(baseURL ?? 'http://localhost:3000').origin;
    const requested: string[] = [];

    page.on('request', (request) => {
      requested.push(request.url());
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    expect(requested.length).toBeGreaterThan(0);

    for (const url of requested) {
      const requestOrigin = new URL(url).origin;
      expect(
        requestOrigin,
        `external request detected: ${url}`,
      ).toBe(origin);
    }
  });

  test('T55: hero video degrades under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const video = page.locator('video');
    // HeroMedia: prefers-reduced-motion → static image only; <video> stays out of DOM
    const count = await video.count();
    if (count > 0) {
      expect(
        await video.evaluate((el: HTMLVideoElement) => el.paused),
      ).toBe(true);
    } else {
      expect(count).toBe(0);
    }
  });

  test('T56: no single image response exceeds 500KB', async ({ page }) => {
    const sizes: { url: string; size: number }[] = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (/\.(jpg|jpeg|png|webp|avif)(\?|$)/i.test(url)) {
        const headers = response.headers();
        const len = Number(headers['content-length'] ?? 0);
        if (len > 0) sizes.push({ url, size: len });
      }
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    const oversized = sizes.filter((s) => s.size > 500 * 1024);
    expect(oversized, JSON.stringify(oversized)).toEqual([]);
  });

  test('T57: process video path is disallowed and not in sitemap', async ({
    page,
    baseURL,
  }) => {
    const robots = await page.request.get(`${baseURL}/robots.txt`);
    const robotsText = await robots.text();
    expect(robotsText).toMatch(/Disallow:.*processo-video/i);

    const sitemap = await page.request.get(`${baseURL}/sitemap.xml`);
    const sitemapText = await sitemap.text();
    expect(sitemapText).not.toMatch(/processo-video/i);
  });
});
