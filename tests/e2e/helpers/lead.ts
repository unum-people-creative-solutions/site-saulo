import { expect, type Page } from '@playwright/test';

export async function openLeadModalFromHero(page: Page) {
  await page.getByRole('button', { name: 'QUERO FALAR SOBRE UM PROJETO' }).click();
  await expect(
    page.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
  ).toBeVisible();
}

export async function fillLeadForm(
  page: Page,
  overrides: { nome?: string; email?: string; mensagem?: string } = {},
) {
  await page.getByLabel('nome').fill(overrides.nome ?? 'Maria Silva');
  await page.getByLabel('telefone / whatsapp').pressSequentially('11999999999');
  await page.getByLabel('e-mail').fill(overrides.email ?? 'maria@example.com');
  await page.getByLabel('tipo de projeto').selectOption('reforma_residencial');
  await page
    .getByLabel('conte um pouco sobre')
    .fill(overrides.mensagem ?? 'Quero reformar');
}

/** Both CTAs are visible as soon as the modal opens — no prior submit required. */
export async function expectLeadActionsVisible(page: Page) {
  await expect(page.getByRole('group', { name: /ações de envio/i })).toBeVisible();
}

/** @deprecated Prefer expectLeadActionsVisible — kept for call-site clarity in older specs. */
export async function validateLeadForm(page: Page) {
  await expectLeadActionsVisible(page);
}

export function emailSubmitButton(page: Page) {
  return page
    .getByRole('group', { name: /ações de envio/i })
    .getByRole('button', { name: /enviar formulário/i });
}

export function whatsappSubmitButton(page: Page) {
  return page
    .getByRole('group', { name: /ações de envio/i })
    .getByRole('button', { name: /falar agora no WhatsApp/i });
}
