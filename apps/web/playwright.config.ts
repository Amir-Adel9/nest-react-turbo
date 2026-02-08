import { defineConfig, devices } from '@playwright/test';

/**
 * Web E2E tests. Run with: pnpm --filter web test:e2e
 * Requires the app to be running (e.g. pnpm start:dev or web preview + api dev).
 * Base URL can be overridden with BASE_URL (default http://localhost:5173).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm run preview',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
      },
});
