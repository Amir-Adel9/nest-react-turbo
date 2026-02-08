import { test, expect } from '@playwright/test';

/**
 * Smoke E2E: full auth flow (register → home → logout → login → logout).
 * Requires API to be running (e.g. pnpm --filter api dev) and web (preview or dev).
 */
test.describe('Auth flow', () => {
  const testUser = {
    email: `e2e-${Date.now()}@example.com`,
    name: 'E2E User',
    password: 'Password1!',
  };

  test('full flow: register, home, logout, login, logout', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^name$/i).fill(testUser.name);
    await page.getByPlaceholder(/min 8 chars/i).fill(testUser.password);
    await page.getByPlaceholder(/re-enter your password/i).fill(testUser.password);
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL(/\//);
    await expect(page.getByText(testUser.email)).toBeVisible();

    await page.getByRole('button', { name: /logout|sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByPlaceholder(/enter your password/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\//);
    await expect(page.getByText(testUser.email)).toBeVisible();

    await page.getByRole('button', { name: /logout|sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
