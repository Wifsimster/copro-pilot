import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('should display login page with tabs', async ({ page }) => {
    await page.goto('/#/login')

    await expect(
      page.getByRole('tab', { name: 'Connexion' })
    ).toBeVisible()
    await expect(
      page.getByRole('tab', { name: 'Inscription' })
    ).toBeVisible()
  })

  test('should login with valid admin credentials', async ({ page }) => {
    await page.goto('/#/login')

    const emailInput = page.locator('#signin-email')
    const passwordInput = page.locator('#signin-password')

    await emailInput.fill('admin@copropilot.local')
    await passwordInput.fill('admin')

    await page.getByRole('button', { name: 'Se connecter' }).click()

    await page.waitForURL('**/#/dashboard', { timeout: 15_000 })
    await expect(page).toHaveURL(/\/#\/dashboard/)
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/#/login')

    const emailInput = page.locator('#signin-email')
    const passwordInput = page.locator('#signin-password')

    await emailInput.fill('admin@copropilot.local')
    await passwordInput.fill('wrongpassword')

    await page.getByRole('button', { name: 'Se connecter' }).click()

    await expect(page.locator('.text-destructive')).toBeVisible({
      timeout: 10_000,
    })
  })

  test('should login via syndic demo button', async ({ page }) => {
    await page.goto('/#/login')

    await page.getByRole('button', { name: 'Syndic' }).click()

    await page.waitForURL('**/#/dashboard', { timeout: 15_000 })
    await expect(page).toHaveURL(/\/#\/dashboard/)
  })

  test('should login via copropriétaire demo button', async ({ page }) => {
    await page.goto('/#/login')

    await page
      .getByRole('button', { name: /Copropri[eé]taire/ })
      .click()

    await page.waitForURL('**/#/extranet', { timeout: 15_000 })
    await expect(page).toHaveURL(/\/#\/extranet/)
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/#/login')

    const emailInput = page.locator('#signin-email')
    const passwordInput = page.locator('#signin-password')

    await emailInput.fill('admin@copropilot.local')
    await passwordInput.fill('admin')

    await page.getByRole('button', { name: 'Se connecter' }).click()
    await page.waitForURL('**/#/dashboard', { timeout: 15_000 })

    // Open user menu (avatar button) and click logout
    await page.getByRole('button', { name: /avatar|profil|user/i }).click()
    await page
      .getByRole('menuitem', { name: /[Dd][eé]connexion/ })
      .click()

    await page.waitForURL('**/#/', { timeout: 15_000 })
    await expect(page).toHaveURL(/\/#\/$/)
  })

  test('should redirect unauthenticated users from protected routes', async ({
    page,
  }) => {
    await page.goto('/#/dashboard')

    await page.waitForURL('**/#/login', { timeout: 15_000 })
    await expect(page).toHaveURL(/\/#\/login/)
  })
})
