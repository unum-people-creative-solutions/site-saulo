import { expect, test } from '@playwright/test';

test.describe('T19: structure without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('T19: gallery track overflows and all six sections render in HTML', async ({
    page,
  }) => {
    await page.goto('/');

    const track = page.locator('#galeria .gallery-section__track');
    const aboutTitle = page.locator('#sobre-title');
    await expect(track).toBeAttached();

    const overflows = await track.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(overflows).toBe(true);

    await expect(page.locator('#hero')).toContainText(/lorem ipsum/i);
    await expect(aboutTitle).toHaveText('Sobre');
    await expect(aboutTitle).toHaveClass(/about-section__title--sr-only/);
    await expect(page.locator('#sobre .about-section__block').first()).toBeVisible();
    await expect(page.locator('#processo')).toContainText('Jornada do projeto');
    await expect(page.locator('#galeria')).toBeVisible();
    await expect(page.locator('#depoimentos')).toBeVisible();
    await expect(page.locator('footer')).toContainText('Iniciar um contato.');
  });
});

test('T19c: hero phrase rests below the vertical middle of the viewport (matches client reference)', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const headerBox = await page
    .locator('.hero-section__header')
    .boundingBox();
  const phraseBox = await page
    .locator('#hero .hero-section__phrase-wrap')
    .boundingBox();

  expect(headerBox).not.toBeNull();
  expect(phraseBox).not.toBeNull();

  // Client reference: the phrase sits clearly below the viewport's vertical
  // middle, well below the wordmark/CTA header row above it.
  expect(phraseBox!.y).toBeGreaterThan(450);
  expect(phraseBox!.y).toBeGreaterThan(headerBox!.y + headerBox!.height + 150);
});

test('T19b: footer anchors navigate to matching sections', async ({ page }) => {
  await page.goto('/');

  const anchors = [
    { name: 'SOBRE', hash: '#sobre', id: '#sobre' },
    { name: 'PROCESSO', hash: '#processo', id: '#processo' },
    { name: 'GALERIA', hash: '#galeria', id: '#galeria' },
  ] as const;

  for (const { name, hash, id } of anchors) {
    await page.getByRole('link', { name }).click();
    await expect(page).toHaveURL(new RegExp(`${hash}$`));
    expect(await page.locator(id).isVisible()).toBe(true);
  }
});
