import { test as setup, expect } from '@playwright/test'

setup('authenticate as syndic', async ({ page }) => {
  await page.goto('/#/login')

  // Clear pre-filled values and enter syndic credentials
  const emailInput = page.locator('#signin-email')
  const passwordInput = page.locator('#signin-password')

  await emailInput.fill('syndic@copropilot.local')
  await passwordInput.fill('syndic')

  // Submit login form
  await page.getByRole('button', { name: 'Se connecter' }).click()

  // Wait for redirect to dashboard
  await page.waitForURL('**/#/dashboard', { timeout: 15_000 })
  await expect(page.locator('h1')).toContainText(/Bonjour|Bonsoir/)

  // Save signed-in state
  await page.context().storageState({ path: 'e2e/.auth/syndic.json' })
})
