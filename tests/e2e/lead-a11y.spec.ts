import { expect, test } from '@playwright/test';

test('T28: Esc returns focus to the element that opened the modal', async ({
  page,
}) => {
  await page.goto('/');

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

  await expect(heroCta).toBeFocused();

  const focusMatches = await page.evaluate(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return false;
    return (
      active.getAttribute('type') === 'button' &&
      /quero falar sobre um projeto/i.test(active.textContent ?? '')
    );
  });
  expect(focusMatches).toBe(true);
});
