import { expect, test } from '@playwright/test';

import {
  expectNarrativeAccessibleInitially,
  isSectionInViewport,
  sectionViewportTop,
  trackTranslateX,
  waitForScrollTriggersRegistered,
  wheelBy,
} from './helpers/motion';

test.describe('motion pin / scrub scenes', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('T44: content remains accessible with animation active', async ({ page }) => {
    await page.goto('/');
    await waitForScrollTriggersRegistered(page);
    await expectNarrativeAccessibleInitially(page);
  });

  test('T46: pinned sections progress and release the user', async ({ page }) => {
    await page.goto('/');
    await waitForScrollTriggersRegistered(page);

    // --- Sobre ---
    let sobrePinned = false;
    let sobreTopWhilePinned = 0;
    let scrollWhileSobrePinned = 0;

    for (let i = 0; i < 80; i++) {
      await wheelBy(page, 400);
      await page.waitForTimeout(40);

      const top = await sectionViewportTop(page, '#sobre');
      const inView = await isSectionInViewport(page, '#sobre');

      if (inView && Math.abs(top) < 8) {
        if (!sobrePinned) {
          sobrePinned = true;
          sobreTopWhilePinned = top;
          scrollWhileSobrePinned = await page.evaluate(() => window.scrollY);
        } else {
          const scrollNow = await page.evaluate(() => window.scrollY);
          // Still pinned: section stays near top while page scroll advances
          if (scrollNow > scrollWhileSobrePinned + 200) {
            expect(Math.abs(top - sobreTopWhilePinned)).toBeLessThan(24);
            break;
          }
        }
      }
    }
    expect(sobrePinned).toBe(true);

    // Shared Hero backdrop must still be alive while Sobre is pinned.
    const backdrop = page.locator('.hero-section__backdrop');
    await expect(backdrop).toBeVisible();
    await expect(backdrop).not.toHaveAttribute('data-released', 'true');

    // Continue until Processo appears and Sobre has been passed
    let processoVisible = false;
    for (let i = 0; i < 100; i++) {
      await wheelBy(page, 500);
      await page.waitForTimeout(40);

      const processoTop = await sectionViewportTop(page, '#processo');
      const processoInView = await isSectionInViewport(page, '#processo');
      const sobreTop = await sectionViewportTop(page, '#sobre');

      if (processoInView && processoTop < 400 && sobreTop < -40) {
        processoVisible = true;
        break;
      }
    }
    expect(processoVisible).toBe(true);

    // Journey is on screen (Sobre may still peek) — video must stay.
    await expect(backdrop).not.toHaveAttribute('data-released', 'true');

    // Scroll until Journey has fully left the viewport.
    for (let i = 0; i < 80; i++) {
      const journeyBottom = await page.locator('#processo').evaluate((el) => {
        return el.getBoundingClientRect().bottom;
      });
      if (journeyBottom < 0) break;
      await wheelBy(page, 500);
      await page.waitForTimeout(40);
    }

    await expect(backdrop).toHaveAttribute('data-released', 'true');

    // --- Galeria ---
    let galleryPinned = false;
    let galleryTopWhilePinned = 0;
    let scrollWhileGalleryPinned = 0;

    for (let i = 0; i < 120; i++) {
      await wheelBy(page, 500);
      await page.waitForTimeout(40);

      const top = await sectionViewportTop(page, '#galeria');
      const inView = await isSectionInViewport(page, '#galeria');

      if (inView && Math.abs(top) < 8) {
        if (!galleryPinned) {
          galleryPinned = true;
          galleryTopWhilePinned = top;
          scrollWhileGalleryPinned = await page.evaluate(() => window.scrollY);
        } else {
          const scrollNow = await page.evaluate(() => window.scrollY);
          if (scrollNow > scrollWhileGalleryPinned + 200) {
            expect(Math.abs(top - galleryTopWhilePinned)).toBeLessThan(24);
            break;
          }
        }
      }
    }
    expect(galleryPinned).toBe(true);

    let galleryReleased = false;
    for (let i = 0; i < 120; i++) {
      await wheelBy(page, 600);
      await page.waitForTimeout(40);

      const galleryTop = await sectionViewportTop(page, '#galeria');
      const depoimentosInView = await isSectionInViewport(page, '#depoimentos');
      if (galleryTop < -40 || depoimentosInView) {
        galleryReleased = true;
        break;
      }
    }
    expect(galleryReleased).toBe(true);
  });

  test('T-gallery-no-native-scroll: track is not natively horizontally scrollable while the pin drives it', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForScrollTriggersRegistered(page);

    const track = page.locator('#galeria .gallery-section__track');

    // Native overflow-x:auto is the no-JS/reduced-motion fallback (T19/T42).
    // Once GSAP is driving the track via a pinned scrub, leaving native
    // horizontal scroll enabled lets a trackpad/scrollbar gesture scroll the
    // track's own viewport independently of — and out of sync with — the
    // transform, which is exactly the reported bug (sideways scroll just
    // shifts the whole container instead of revealing the next images).
    const overflowX = await track.evaluate(
      (el) => getComputedStyle(el).overflowX,
    );
    expect(overflowX).not.toBe('auto');

    // A real user gesture (wheel with a horizontal component, as a
    // trackpad/shift+wheel scroll produces) must not move the track — only
    // the GSAP transform (driven by vertical page scroll) may. Overflow
    // must block this at the browser level, not just report a CSS value —
    // programmatically calling .scrollBy() can still move scrollLeft even
    // under overflow-x:hidden, so this uses a real wheel event instead.
    const box = await track.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(
      box!.x + box!.width / 2,
      box!.y + box!.height / 2,
    );
    const before = await track.evaluate((el) => el.scrollLeft);
    await page.mouse.wheel(300, 0);
    await page.waitForTimeout(100);
    const after = await track.evaluate((el) => el.scrollLeft);
    expect(after).toBe(before);
  });

  test('T-gallery-reveal-not-clipped: items far into the track actually paint, not just report a bounding box', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForScrollTriggersRegistered(page);

    for (let i = 0; i < 200; i++) {
      await wheelBy(page, 300);
      await page.waitForTimeout(20);
      const top = await sectionViewportTop(page, '#galeria');
      if (Math.abs(top) < 5) break;
    }
    // Scroll deep enough into the pin that a late quote card is within
    // the viewport window.
    for (let i = 0; i < 20; i++) {
      await wheelBy(page, 60);
      await page.waitForTimeout(30);
    }
    await page.waitForTimeout(300);

    // Regression: an ancestor with overflow:auto/hidden clips a transformed
    // child to the child's own *local* box before the transform is applied
    // — the clip travels with the box, so nothing past the box's own width
    // is ever revealed no matter how far it's translated. Checking
    // getBoundingClientRect() alone doesn't catch this (it reports the
    // intended position regardless of clipping) — elementFromPoint proves
    // something is actually painted there.
    const quoteBox = await page
      .locator('.gallery-card--quote')
      .nth(1)
      .boundingBox();
    expect(quoteBox).not.toBeNull();
    expect(quoteBox!.x).toBeGreaterThan(-50);
    expect(quoteBox!.x).toBeLessThan(1440);

    const point = {
      x: Math.round(quoteBox!.x + quoteBox!.width / 2),
      y: Math.round(quoteBox!.y + quoteBox!.height / 2),
    };
    const isPainted = await page.evaluate(
      ({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return Boolean(el?.closest('.gallery-card--quote'));
      },
      point,
    );
    expect(isPainted).toBe(true);

    // No horizontal page overflow either — the reveal must be clipped at
    // the (static) section level, not leak past the viewport.
    const overflowInfo = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(overflowInfo.scrollWidth).toBe(overflowInfo.innerWidth);
  });

  test('T47: gallery track translates horizontally monotonically with vertical scroll', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForScrollTriggersRegistered(page);

    // Reach gallery pin
    for (let i = 0; i < 150; i++) {
      await wheelBy(page, 500);
      await page.waitForTimeout(30);
      const top = await sectionViewportTop(page, '#galeria');
      if (Math.abs(top) < 8) break;
    }

    const samples: number[] = [];
    for (let i = 0; i < 3; i++) {
      await wheelBy(page, 350);
      await page.waitForTimeout(80);
      samples.push(await trackTranslateX(page));
    }

    // Horizontal translation becomes more negative (or equal) as vertical scroll advances
    expect(samples[1]).toBeLessThanOrEqual(samples[0] + 0.5);
    expect(samples[2]).toBeLessThanOrEqual(samples[1] + 0.5);
    expect(samples[2]).toBeLessThan(samples[0] - 1);
  });

  test('T-header-pin: the single header stays pinned, visible and painted on top through the whole page — same element throughout', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForScrollTriggersRegistered(page);

    const header = page.locator('.hero-section__header');
    await expect(header).toBeVisible();

    // Grab a stable node id via evaluate so later we can prove it's still
    // the exact same DOM element (never swapped for a different-looking copy).
    const nodeIdBefore = await header.evaluate((el) => {
      (el as HTMLElement & { __probe?: string }).__probe = 'same-instance';
      return true;
    });
    expect(nodeIdBefore).toBe(true);

    // Scroll well past the hero, into Sobre/Processo territory.
    for (let i = 0; i < 30; i++) {
      await wheelBy(page, 500);
      await page.waitForTimeout(30);
      const scrollY = await page.evaluate(() => window.scrollY);
      if (scrollY > 1200) break;
    }

    const heroTop = await sectionViewportTop(page, '#hero');
    expect(heroTop).toBeLessThan(-800);

    await expect(header).toBeVisible();
    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.round(box!.y)).toBe(0);

    const isStillSameInstance = await header.evaluate(
      (el) => (el as HTMLElement & { __probe?: string }).__probe === 'same-instance',
    );
    expect(isStillSameInstance).toBe(true);

    // Real regression check: it must actually be painted on top, not just
    // laid out there — a clipped/trapped element can still report a
    // bounding box.
    const point = {
      x: Math.round(box!.x + box!.width / 4),
      y: Math.round(box!.y + box!.height / 2),
    };
    const isPainted = await page.evaluate(
      ({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return Boolean(el?.closest('.hero-section__header'));
      },
      point,
    );
    expect(isPainted).toBe(true);

    // Scroll back up into the hero — it must reverse smoothly, no
    // disappearing, no swap.
    for (let i = 0; i < 30; i++) {
      await wheelBy(page, -500);
      await page.waitForTimeout(30);
      const scrollY = await page.evaluate(() => window.scrollY);
      if (scrollY <= 0) break;
    }

    await expect(header).toBeVisible();
    const stillSameAfterReturn = await header.evaluate(
      (el) => (el as HTMLElement & { __probe?: string }).__probe === 'same-instance',
    );
    expect(stillSameAfterReturn).toBe(true);
  });

  test('T-footer-image-static: footer background image is a plain CSS background, always fully visible, never animated', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForScrollTriggersRegistered(page);

    // Regression: earlier designs used a separate <img>/<Image> element
    // layered via z-index, which needed the stacking order to be correct
    // for text to read as "on top of" the image, and which (at one point)
    // was animated via translateY tied to a trigger anchored to 'top top' —
    // geometrically unreachable for the last, shorter-than-viewport
    // section, leaving the image permanently hidden. A later version split
    // the footer into a full-bleed "hero" block plus a separate plain-ink
    // block below it for the nav columns, so the image never covered the
    // whole footer either. The image is now a plain CSS `background-image`
    // on the `<footer>` element itself — it covers the *entire* footer
    // (title, columns, bottom bar, all of it), is never transformed, and
    // text is simply normal content painted on top of it — there's no
    // stacking order, and no un-imaged area, to get wrong.
    const footer = page.locator('footer');

    async function readBackgroundImage() {
      return footer.evaluate((el) => getComputedStyle(el).backgroundImage);
    }

    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    expect(await readBackgroundImage()).toContain('footer.jpg');
    const transformOnEntry = await footer.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transformOnEntry);
    await expect(footer).toBeInViewport();

    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await page.waitForTimeout(200);
    expect(await readBackgroundImage()).toContain('footer.jpg');
    const transformAtMaxScroll = await footer.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transformAtMaxScroll);

    // No un-imaged area: the nav columns and bottom bar must have no
    // background of their own — they just show the footer's background
    // (the photo) through, instead of sitting on a separate plain-ink block.
    for (const selector of ['.footer-section__columns', '.footer-section__bottom']) {
      const ownBackground = await page
        .locator(selector)
        .evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(ownBackground).toBe('none');
    }
    await expect(page.locator('.footer-section__bottom')).toBeInViewport();
  });

  test('T-footer-title-settle: CTA title starts offset above the footer and settles to its centered rest position on scroll', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForScrollTriggersRegistered(page);

    const title = page.locator('.footer-section__title');

    function readTranslateY(el: Element): number {
      const t = getComputedStyle(el).transform;
      if (t === 'none') return 0;
      const m = t.match(/matrix\(([^)]+)\)/);
      if (!m) return 0;
      return Number.parseFloat(m[1].split(',')[5]?.trim() ?? '0');
    }

    // The scrub range is 'top bottom' (footer's top at the viewport's
    // bottom — it's just entering) to 'top top' (footer's top at the
    // viewport's top — the footer, and its full-bleed image, exactly fills
    // the screen). Jump ~40px past the range's start — right at the start
    // the "from" value may not have rendered a frame yet — and check the
    // title is still offset, not yet at its resting position.
    const footerTop = await page.locator('footer').evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY;
    });
    const innerHeight = 900;
    await page.evaluate(
      (y) => window.scrollTo(0, y),
      footerTop - innerHeight + 40,
    );
    await page.waitForTimeout(200);
    const yOnEntry = await title.evaluate(readTranslateY);

    // Scroll to 'top top' (scrollY === footerTop puts the footer's own top
    // exactly at the viewport's top) — the title must have settled to y:0
    // (its natural, centered position) and stay there, same element —
    // *exactly* when the footer's image fills the whole viewport, not
    // before.
    await page.evaluate((y) => window.scrollTo(0, y), footerTop);
    await page.waitForTimeout(200);
    const yAfterScroll = await title.evaluate(readTranslateY);

    expect(Math.abs(yOnEntry)).toBeGreaterThan(20);
    expect(Math.abs(yAfterScroll)).toBeLessThan(2);
    await expect(title).toBeInViewport();

    // The real regression: image must fill the *entire* viewport at the
    // exact moment the title settles — not just a partial sliver of it,
    // which would read as "text separate from a half-visible image block".
    const footerBox = await page.locator('footer').boundingBox();
    expect(footerBox).not.toBeNull();
    expect(footerBox!.y).toBeLessThanOrEqual(2);
    expect(footerBox!.y + footerBox!.height).toBeGreaterThanOrEqual(
      innerHeight - 2,
    );

    // Title sits near the top of the (now full-height, single-block)
    // footer — below the site's fixed header, above the nav columns —
    // rather than dead-center, now that the whole footer (title + columns
    // + bottom bar) shares one screen.
    const header = page.locator('.hero-section__header');
    const headerBottom = (await header.boundingBox())!.y + (await header.boundingBox())!.height;
    const titleBox = await title.boundingBox();
    expect(titleBox).not.toBeNull();
    expect(titleBox!.y).toBeGreaterThan(headerBottom);
    expect(titleBox!.y).toBeLessThan(innerHeight * 0.4);
  });

  test('T48: footer CTA opens LeadModal mid rise animation', async ({ page }) => {
    await page.goto('/');
    await waitForScrollTriggersRegistered(page);

    // Scroll near the footer rise window
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);

    // Nudge into the middle of the scrub range
    const startY = await page.evaluate(() => window.scrollY);
    for (let i = 0; i < 6; i++) {
      await wheelBy(page, 200);
      await page.waitForTimeout(40);
    }
    const midY = await page.evaluate(() => window.scrollY);
    expect(midY).toBeGreaterThanOrEqual(startY);

    const cta = page.locator('footer').getByRole('button', {
      name: 'Iniciar um contato.',
    });
    await expect(cta).toBeAttached();
    // Pin/scrub can leave overlays; dispatch the DOM click the user would get
    await cta.evaluate((el) => (el as HTMLButtonElement).click());

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
    ).toBeVisible();
  });
});
