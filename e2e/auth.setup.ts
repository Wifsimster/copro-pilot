import { test as setup, expect } from '@playwright/test'

setup('authenticate as syndic', async ({ page }) => {
  // Navigate to login page
  await page.goto('/#/login')
  await expect(page.locator('#signin-email')).toBeVisible({ timeout: 15_000 })

  // Fill syndic credentials (clear pre-filled admin values first)
  await page.locator('#signin-email').fill('syndic@copropilot.local')
  await page.locator('#signin-password').fill('syndic')

  // Submit
  await page.getByRole('button', { name: 'Se connecter' }).click()

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/#\/dashboard/, { timeout: 15_000 })

  // Save signed-in state
  await page.context().storageState({ path: 'e2e/.auth/syndic.json' })
})
