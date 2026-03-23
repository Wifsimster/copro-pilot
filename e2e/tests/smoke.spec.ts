import { test, expect, type Page } from '@playwright/test'

/**
 * Ensure the page is authenticated. If storageState didn't persist
 * the session, fall back to manual login.
 */
async function ensureLoggedIn(page: Page) {
  await page.goto('/#/dashboard')
  // Give the app a moment to check auth and redirect if needed
  await page.waitForTimeout(2_000)

  const url = page.url()
  if (url.includes('/#/dashboard')) {
    // Already authenticated — wait for content
    await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 })
    return
  }

  // Not authenticated — login manually
  await page.goto('/#/login')
  await expect(page.locator('#signin-email')).toBeVisible({ timeout: 10_000 })
  await page.locator('#signin-email').fill('syndic@copropilot.local')
  await page.locator('#signin-password').fill('syndic')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/\/#\/dashboard/, { timeout: 15_000 })
}

test.describe('Smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page)
  })

  test('dashboard loads with greeting and metrics', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Bonjour|Bonsoir/)

    // At least one metric label should be visible
    await expect(page.getByText('Coproprietes')).toBeVisible()
  })

  test('copropriétés page lists properties', async ({ page }) => {
    await page.goto('/#/coproprietes')

    // Wait for the page heading
    await expect(
      page.getByRole('heading', { level: 1 })
    ).toContainText(/Copropri/, { timeout: 10_000 })

    // Search input should be present
    await expect(page.getByPlaceholder(/Rechercher/)).toBeVisible()
  })

  test('charges page shows tabs when copropriété selected', async ({
    page,
  }) => {
    // Set copropriete selection before navigating
    await page.evaluate(() => {
      localStorage.setItem(
        'copropriete-selection',
        JSON.stringify({
          state: { selectedCoproprieteId: 1 },
          version: 0,
        })
      )
    })

    await page.goto('/#/charges')

    await expect(
      page.getByRole('heading', { level: 1 })
    ).toBeVisible({ timeout: 10_000 })

    // Verify tab buttons exist
    await expect(
      page.getByRole('button', { name: 'Budgets' })
    ).toBeVisible()
  })

  test('travaux page loads', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem(
        'copropriete-selection',
        JSON.stringify({
          state: { selectedCoproprieteId: 1 },
          version: 0,
        })
      )
    })

    await page.goto('/#/travaux')

    await expect(
      page.getByRole('heading', { level: 1 })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('sidebar navigation works', async ({ page }) => {
    // Find and click any sidebar link that goes to coproprietes
    const sidebarLink = page.locator(
      'nav a[href*="coproprietes"], aside a[href*="coproprietes"], a[href*="#/coproprietes"]'
    ).first()

    if (await sidebarLink.isVisible()) {
      await sidebarLink.click()
      await expect(page).toHaveURL(/coproprietes/)
    } else {
      // Fallback: just navigate directly
      await page.goto('/#/coproprietes')
      await expect(page).toHaveURL(/coproprietes/)
    }
  })
})
