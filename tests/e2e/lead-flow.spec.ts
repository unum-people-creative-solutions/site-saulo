import { expect, test } from '@playwright/test';

import {
  emailSubmitButton,
  fillLeadForm,
  openLeadModalFromHero,
  validateLeadForm,
} from './helpers/lead';

test('T23: full email flow with gclid shows success message', async ({ page }) => {
  await page.route('**/api/lead', (route) =>
    route.fulfill({ status: 200, body: '{}' }),
  );

  await page.goto('/?gclid=abc123');
  await openLeadModalFromHero(page);
  await fillLeadForm(page);
  await validateLeadForm(page);
  await emailSubmitButton(page).click();

  await expect(
    page.getByText(
      'Recebemos sua mensagem! Entraremos em contato em até 24 horas.',
    ),
  ).toBeVisible();
});

test('T26: API 500 shows error and keeps field values', async ({ page }) => {
  await page.route('**/api/lead', (route) =>
    route.fulfill({ status: 500, body: '{}' }),
  );

  await page.goto('/');
  await openLeadModalFromHero(page);
  await fillLeadForm(page, {
    nome: 'Maria Silva',
    email: 'maria@example.com',
  });
  await validateLeadForm(page);
  await emailSubmitButton(page).click();

  await expect(page.getByRole('alert')).toContainText(
    /não foi possível|erro|tente/i,
  );
  await expect(page.getByLabel('nome')).toHaveValue('Maria Silva');
  await expect(page.getByLabel('e-mail')).toHaveValue('maria@example.com');
  await expect(emailSubmitButton(page)).toBeEnabled();
});

test('T29: conversion CTAs open LeadModal; no wa.me hrefs in document', async ({
  page,
}) => {
  await page.goto('/');

  const waMeLinks = page.locator('a[href*="wa.me"]');
  await expect(waMeLinks).toHaveCount(0);

  const heroCta = page.getByRole('button', {
    name: 'QUERO FALAR SOBRE UM PROJETO',
  });
  await heroCta.click();
  await expect(
    page.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
  ).toBeHidden();

  const footerCta = page.getByRole('button', { name: 'Iniciar um contato.' });
  await footerCta.click();
  await expect(
    page.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
  ).toBeHidden();

  const fab = page.getByRole('button', {
    name: 'Falar sobre um projeto',
    exact: true,
  });
  await fab.click();
  await expect(
    page.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
  ).toBeHidden();

  // Processo opens VideoModal — not LeadModal
  await page
    .getByRole('button', { name: 'QUERO ENTENDER MELHOR O PROCESSO' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Vídeo do processo' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
  ).toHaveCount(0);

  await expect(waMeLinks).toHaveCount(0);
});
