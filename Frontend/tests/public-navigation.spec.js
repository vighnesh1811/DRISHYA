import { test, expect } from '@playwright/test';

test('visitor navigates public pages and sees the catalog entry point', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/DRISHYA/);
  await expect(page.getByRole('heading', { name: /Make the moment/i })).toBeVisible();

  await page.locator('#main-navigation').getByRole('link', { name: 'Equipment', exact: true }).click();
  await expect(page).toHaveURL(/\/catalog$/);
  await expect(page.getByRole('heading', { name: /Choose your frame/i })).toBeVisible();

  await page.locator('#main-navigation').getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { name: /Built for storytellers/i })).toBeVisible();
});
