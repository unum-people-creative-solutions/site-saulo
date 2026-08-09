import { expect, type Page } from '@playwright/test';

export type ScrollTriggerLike = {
  pin?: unknown;
  trigger?: Element | string | null;
  vars?: { scrub?: unknown; pin?: unknown };
};

declare global {
  interface Window {
    __scrollTrigger?: {
      getAll: () => ScrollTriggerLike[];
    };
  }
}

export async function waitForScrollTriggerSeam(page: Page) {
  await page.waitForFunction(
    () => typeof window.__scrollTrigger?.getAll === 'function',
    undefined,
    { timeout: 15_000 },
  );
}

/** Wait until full-motion scenes have registered at least one ScrollTrigger. */
export async function waitForScrollTriggersRegistered(page: Page, min = 1) {
  await waitForScrollTriggerSeam(page);
  await page.waitForFunction(
    (minimum) => (window.__scrollTrigger?.getAll().length ?? 0) >= minimum,
    min,
    { timeout: 15_000 },
  );
}

export async function countPinOrScrubTriggers(page: Page): Promise<number> {
  return page.evaluate(() => {
    const all = window.__scrollTrigger?.getAll() ?? [];
    return all.filter((t) => t.pin || t.vars?.scrub).length;
  });
}

export async function countPinTriggers(page: Page): Promise<number> {
  return page.evaluate(() => {
    const all = window.__scrollTrigger?.getAll() ?? [];
    return all.filter((t) => Boolean(t.pin)).length;
  });
}

/** Ids of elements currently pinned by ScrollTrigger (empty string if none). */
export async function pinnedTriggerIds(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const all = window.__scrollTrigger?.getAll() ?? [];
    return all
      .filter((t) => Boolean(t.pin))
      .map((t) => {
        const trigger = t.trigger;
        if (trigger instanceof Element) {
          return trigger.id || trigger.tagName.toLowerCase();
        }
        return String(trigger ?? '');
      });
  });
}

export async function scrollTriggerCount(page: Page): Promise<number> {
  return page.evaluate(() => window.__scrollTrigger?.getAll().length ?? -1);
}

async function expectAboutHeadingHiddenAccessibly(page: Page) {
  const aboutHeading = page.locator('#sobre-title');
  await expect(aboutHeading).toHaveText('Sobre');
  await expect(aboutHeading).toHaveClass(/about-section__title--sr-only/);

  const isVisuallyHidden = await aboutHeading.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return (
      style.position === 'absolute' &&
      (style.left === '-9999px' ||
        style.clipPath === 'inset(50%)' ||
        style.clip === 'rect(0px, 0px, 0px, 0px)')
    );
  });

  expect(isVisuallyHidden).toBe(true);
}

/** About blocks, process acts, footer CTA — queryable without relying on utility classes. */
export async function expectCoreNarrativeVisible(page: Page) {
  await expectAboutHeadingHiddenAccessibly(page);

  const aboutBlocks = page.locator('#sobre .about-section__block');
  await expect(aboutBlocks).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(aboutBlocks.nth(i)).toBeVisible();
  }

  for (const title of [
    'RECONHECIMENTO',
    'CONCEPÇÃO',
    'ALINHAMENTO',
    'IMPLANTAÇÃO',
  ] as const) {
    await expect(
      page.getByRole('heading', { name: title, level: 3 }),
    ).toBeVisible();
  }

  await expect(
    page.getByRole('button', { name: 'Iniciar um contato.' }),
  ).toBeVisible();
}

/** T44: present in DOM; no display:none / visibility:hidden (opacity may be 0). */
export async function expectNarrativeAccessibleInitially(page: Page) {
  await expectAboutHeadingHiddenAccessibly(page);

  const aboutBlocks = page.locator('#sobre .about-section__block');
  await expect(aboutBlocks).toHaveCount(4);

  for (const title of [
    'RECONHECIMENTO',
    'CONCEPÇÃO',
    'ALINHAMENTO',
    'IMPLANTAÇÃO',
  ] as const) {
    await expect(
      page.getByRole('heading', { name: title, level: 3 }),
    ).toBeAttached();
  }

  const galleryImages = page.getByRole('img').filter({
    hasNot: page.locator('[alt=""]'),
  });
  await expect(galleryImages.first()).toBeAttached();
  expect(await galleryImages.count()).toBeGreaterThanOrEqual(4);

  const hidden = await page.evaluate(() => {
    const selectors = [
      '#sobre .about-section__block',
      '#processo .process-card',
      '#galeria .gallery-card',
    ];
    const bad: string[] = [];
    for (const selector of selectors) {
      for (const el of document.querySelectorAll<HTMLElement>(selector)) {
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') {
          bad.push(selector);
        }
      }
    }
    return bad;
  });

  expect(hidden).toEqual([]);
}

export async function wheelBy(page: Page, deltaY: number) {
  await page.mouse.wheel(0, deltaY);
}

export async function sectionViewportTop(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => el.getBoundingClientRect().top);
}

export async function isSectionInViewport(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return r.top < vh && r.bottom > 0;
  });
}

export async function trackTranslateX(page: Page): Promise<number> {
  return page.locator('#galeria .gallery-section__track').evaluate((el) => {
    const transform = getComputedStyle(el).transform;
    if (!transform || transform === 'none') return 0;
    const match = transform.match(/matrix\(([^)]+)\)/);
    if (!match) return 0;
    const parts = match[1].split(',').map((v) => Number.parseFloat(v.trim()));
    return parts[4] ?? 0;
  });
}

export async function heroImageTransform(page: Page): Promise<string> {
  return page
    .locator('.hero-section__image-layer')
    .evaluate((el) => getComputedStyle(el).transform);
}
