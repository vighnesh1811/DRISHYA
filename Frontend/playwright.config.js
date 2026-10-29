import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
    headless: true
  },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]]
});
