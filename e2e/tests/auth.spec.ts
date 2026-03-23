import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('should display login page', async ({ page }) => {
    await page.goto('/#/login')
    await expect(page.locator('#signin-email')).toBeVisible()
    await expect(page.locator('#signin-password')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Se connecter' })
    ).toBeVisible()
  })

  test('should login with valid credentials and reach dashboard', async ({
    page,
  }) => {
    await page.goto('/#/login')
    await page.locator('#signin-email').fill('syndic@copropilot.local')
    await page.locator('#signin-password').fill('syndic')
    await page.getByRole('button', { name: 'Se connecter' }).click()

    await expect(page).toHaveURL(/\/#\/dashboard/, { timeout: 15_000 })
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/#/login')
    await page.locator('#signin-email').fill('bad@example.com')
    await page.locator('#signin-password').fill('wrongpassword12')
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Error message should appear (look for the error text, not CSS class)
    await expect(
      page.locator('[class*="destructive"]')
    ).toBeVisible({ timeout: 10_000 })
  })

  test('should redirect unauthenticated users from protected routes', async ({
    page,
  }) => {
    await page.goto('/#/dashboard')
    // App redirects to landing page or login
    await expect(page).toHaveURL(/\/#\/(login)?$/, { timeout: 10_000 })
  })
})
