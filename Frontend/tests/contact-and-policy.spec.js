import { test, expect } from '@playwright/test';

test('visitor can inspect rental policy and complete contact form fields', async ({ page }) => {
  await page.goto('/rental-policy');
  await expect(page.getByRole('heading', { name: /Rental policies/i })).toBeVisible();
  await expect(page.getByText(/security deposit/i)).toBeVisible();

  await page.goto('/contact');
  await page.getByPlaceholder('Your name').fill('Validation Visitor');
  await page.getByPlaceholder('Email address').fill('validation@example.com');
  await page.getByPlaceholder('Subject').fill('Equipment question');
  await page.getByPlaceholder('How can we help?').fill('Please share availability information.');
  await expect(page.getByRole('button', { name: 'Send enquiry' })).toBeEnabled();
});
