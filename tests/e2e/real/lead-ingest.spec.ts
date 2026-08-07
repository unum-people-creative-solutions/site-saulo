import { expect, test } from '@playwright/test';

import {
  emailSubmitButton,
  fillLeadForm,
  openLeadModalFromHero,
  validateLeadForm,
} from '../helpers/lead';

// REAL ingest — no page.route() mocks.
// Runs only via: npm run test:e2e:real (playwright.real.config.ts)
// Excluded from the default gate by testIgnore of **/real/**.
test('real: POST /api/lead returns 200 for a marked E2E lead', async ({
  page,
}) => {
  const markedName = `E2E ${Date.now()}`;

  await page.goto('/');
  await openLeadModalFromHero(page);
  await fillLeadForm(page, {
    nome: markedName,
    email: `e2e+${Date.now()}@example.com`,
    mensagem: 'Lead real de E2E — pode ignorar',
  });
  await validateLeadForm(page);

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes('/api/lead') && res.request().method() === 'POST',
    ),
    emailSubmitButton(page).click(),
  ]);

  expect(response.status()).toBe(200);
});
