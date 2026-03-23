import { test as setup, expect } from '@playwright/test'

setup('authenticate as syndic', async ({ page }) => {
  await page.goto('/#/login')
  await expect(page.locator('#signin-email')).toBeVisible({ timeout: 15_000 })

  await page.locator('#signin-email').fill('syndic@copropilot.local')
  await page.locator('#signin-password').fill('syndic')
  await page.getByRole('button', { name: 'Se connecter' }).click()

  await expect(page).toHaveURL(/\/#\/dashboard/, { timeout: 15_000 })

  // Wait for dashboard content to fully load before saving state
  await expect(page.locator('h1')).toContainText(/Bonjour|Bonsoir/, {
    timeout: 10_000,
  })

  await page.context().storageState({ path: 'e2e/.auth/syndic.json' })
})
