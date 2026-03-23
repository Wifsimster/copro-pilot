import { test, expect, type Page } from '@playwright/test'

/** Login as syndic user */
async function login(page: Page) {
  await page.goto('/#/login')
  await expect(page.locator('#signin-email')).toBeVisible({ timeout: 10_000 })
  await page.locator('#signin-email').fill('syndic@copropilot.local')
  await page.locator('#signin-password').fill('syndic')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/\/#\/dashboard/, { timeout: 15_000 })
}

test.describe('Smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('dashboard loads with greeting and metrics', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Bonjour|Bonsoir/)
    await expect(page.getByText('Copropriétés')).toBeVisible()
  })

  test('copropriétés page lists properties', async ({ page }) => {
    await page.goto('/#/coproprietes')
    await expect(page.getByPlaceholder(/Rechercher/)).toBeVisible({
      timeout: 10_000,
    })
  })

  test('charges page shows tabs when copropriété selected', async ({
    page,
  }) => {
    // Set copropriete, then reload so Zustand persist reads it
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
    await page.reload()
    await expect(
      page.getByRole('button', { name: 'Budgets' })
    ).toBeVisible({ timeout: 10_000 })
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
    await page.reload()
    await expect(
      page.getByRole('button', { name: 'Incidents' })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('sidebar navigation works', async ({ page }) => {
    // Click a sidebar link to coproprietes
    const link = page.locator('a[href*="#/coproprietes"]').first()
    await expect(link).toBeVisible({ timeout: 5_000 })
    await link.click()
    await expect(page).toHaveURL(/coproprietes/)
  })
})
