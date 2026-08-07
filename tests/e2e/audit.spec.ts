import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const VIEWPORTS = [320, 768, 1024, 1440] as const;

async function disableCookieBanner(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('saulo:cookie-consent', 'true');
  });
}

async function collectHorizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const html = document.documentElement;
    const overflowing = Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter((element) => {
        const style = window.getComputedStyle(element);

        if (
          style.display === 'none' ||
          style.position === 'fixed' ||
          style.visibility === 'hidden'
        ) {
          return false;
        }

        const rect = element.getBoundingClientRect();
        return rect.right - window.innerWidth > 1 || rect.left < -1;
      })
      .slice(0, 10)
      .map((element) => {
        const className = element.className.toString().trim().replace(/\s+/g, '.');
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id,
          className,
          right: Number(element.getBoundingClientRect().right.toFixed(2)),
          left: Number(element.getBoundingClientRect().left.toFixed(2)),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        };
      });

    return {
      viewportWidth: window.innerWidth,
      scrollWidth: html.scrollWidth,
      hasOverflow: html.scrollWidth > window.innerWidth,
      overflowing,
    };
  });
}

async function expectNoSeriousOrCriticalViolations(page: Page) {
  const result = await new AxeBuilder({ page }).analyze();
  const violations = result.violations.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious',
  );

  expect(
    violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(' ')),
    })),
  ).toEqual([]);
}

for (const width of VIEWPORTS) {
  test(`TASK-PLS-004: no horizontal overflow at ${width}px`, async ({ page }) => {
    await disableCookieBanner(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const topState = await collectHorizontalOverflow(page);
    expect(topState).toMatchObject({
      viewportWidth: width,
      hasOverflow: false,
    });

    await page.evaluate(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' });
    });
    await page.waitForTimeout(400);

    const bottomState = await collectHorizontalOverflow(page);
    expect(bottomState).toMatchObject({
      viewportWidth: width,
      hasOverflow: false,
    });
  });
}

test('TASK-PLS-005: axe has no serious or critical violations on home', async ({
  page,
}) => {
  await disableCookieBanner(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expectNoSeriousOrCriticalViolations(page);
});

test('TASK-PLS-005: axe has no serious or critical violations with LeadModal open', async ({
  page,
}) => {
  await disableCookieBanner(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page
    .getByRole('button', { name: 'QUERO FALAR SOBRE UM PROJETO' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
  ).toBeVisible();

  await expectNoSeriousOrCriticalViolations(page);
});
