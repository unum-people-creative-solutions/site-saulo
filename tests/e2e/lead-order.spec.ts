import { expect, test } from '@playwright/test';

import {
  fillLeadForm,
  openLeadModalFromHero,
  validateLeadForm,
  whatsappSubmitButton,
} from './helpers/lead';

test('T24: WhatsApp redirect never precedes lead ingestion', async ({ page }) => {
  const order: string[] = [];
  let resolveIngest!: () => void;
  const ingestGate = new Promise<void>((resolve) => {
    resolveIngest = resolve;
  });

  await page.route('**/api/lead', async (route) => {
    order.push('ingest-received');
    await ingestGate;
    order.push('ingest-resolved');
    await route.fulfill({ status: 200, body: '{}' });
  });

  await page.route('https://wa.me/**', (route) => {
    order.push('whatsapp');
    return route.abort();
  });

  await page.goto('/');
  await openLeadModalFromHero(page);
  await fillLeadForm(page);
  await validateLeadForm(page);
  await whatsappSubmitButton(page).click();

  // While /api/lead is deliberately held open, WhatsApp must not fire yet.
  // This is the assertion that catches removing `await` before navigate.
  await page.waitForTimeout(300);
  expect(order).not.toContain('whatsapp');
  expect(order).toContain('ingest-received');

  resolveIngest();
  await page.waitForTimeout(300);
  expect(order).toEqual(['ingest-received', 'ingest-resolved', 'whatsapp']);
});

test('T27: CRM failure does not block WhatsApp path', async ({ page }) => {
  let whatsappHit = false;

  await page.route('**/api/lead', (route) =>
    route.fulfill({ status: 500, body: '{}' }),
  );

  await page.route('https://wa.me/**', (route) => {
    whatsappHit = true;
    return route.abort();
  });

  await page.goto('/');
  await openLeadModalFromHero(page);
  await fillLeadForm(page);
  await validateLeadForm(page);
  await whatsappSubmitButton(page).click();

  await expect.poll(() => whatsappHit).toBe(true);
});
