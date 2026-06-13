import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Allow pointing at a pre-installed Chromium when Playwright's own
        // browser download is unavailable (restricted networks / CI mirrors).
        ...(process.env.E2E_CHROMIUM_PATH
          ? {
              launchOptions: {
                executablePath: process.env.E2E_CHROMIUM_PATH,
                args: [
                  '--no-sandbox',
                  '--disable-gpu',
                  '--disable-dev-shm-usage',
                ],
              },
            }
          : {}),
      },
      testMatch: /tests\/.+\.spec\.ts/,
    },
  ],

  webServer: process.env.CI
    ? undefined
    : [
        {
          command: 'npm run dev:backend',
          url: 'http://localhost:3001/api/health',
          reuseExistingServer: true,
          timeout: 30_000,
        },
        {
          command: 'npm run dev:frontend',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 30_000,
        },
      ],
})
