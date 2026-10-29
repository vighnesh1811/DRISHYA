import { test, expect } from '@playwright/test';

test('unauthenticated visitor is redirected from customer and admin areas', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();

  await page.goto('/admin/dashboard');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('heading', { name: /control room/i })).toBeVisible();
});
