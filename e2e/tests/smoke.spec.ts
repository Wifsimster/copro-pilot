import { test, expect } from '@playwright/test'

// These tests use the pre-authenticated syndic session (storageState from setup)

test.describe('Smoke tests', () => {
  test('dashboard loads with greeting and metrics', async ({ page }) => {
    await page.goto('/#/dashboard')

    // Greeting should appear
    await expect(page.locator('h1')).toContainText(/Bonjour|Bonsoir/, {
      timeout: 15_000,
    })

    // At least one metric label should be visible
    await expect(page.getByText('Coproprietes')).toBeVisible()
    await expect(page.getByText('Incidents ouverts')).toBeVisible()
  })

  test('copropriétés page lists properties', async ({ page }) => {
    await page.goto('/#/coproprietes')

    await expect(page.locator('h1')).toContainText(/Copropri/, {
      timeout: 15_000,
    })

    // Search input should be present
    await expect(
      page.getByPlaceholder(/Rechercher/)
    ).toBeVisible()

    // At least one copropriete card should be visible (from seed data)
    await expect(page.locator('.grid > div').first()).toBeVisible()
  })

  test('charges page shows tabs when copropriété selected', async ({
    page,
  }) => {
    // Set copropriete selection in localStorage before navigation
    await page.addInitScript(() => {
      localStorage.setItem(
        'copropriete-selection',
        JSON.stringify({
          state: { selectedCoproprieteId: 1 },
          version: 0,
        })
      )
    })

    await page.goto('/#/charges')

    await expect(page.getByText('Charges & Comptabilite')).toBeVisible({
      timeout: 15_000,
    })

    // Verify tab buttons exist
    await expect(
      page.getByRole('button', { name: 'Budgets' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Appels de fonds' })
    ).toBeVisible()
  })

  test('travaux page shows incidents tab', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'copropriete-selection',
        JSON.stringify({
          state: { selectedCoproprieteId: 1 },
          version: 0,
        })
      )
    })

    await page.goto('/#/travaux')

    await expect(page.getByText('Travaux & Incidents')).toBeVisible({
      timeout: 15_000,
    })

    // Incidents tab should show by default
    await expect(
      page.getByRole('button', { name: 'Incidents' })
    ).toBeVisible()
  })

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/#/dashboard')
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 })

    // Navigate via sidebar to coproprietes
    await page.getByRole('link', { name: /Copropri[eé]t[eé]s/ }).first().click()
    await expect(page).toHaveURL(/\/#\/coproprietes/)

    // Navigate via sidebar to coproprietaires
    await page
      .getByRole('link', { name: /Copropri[eé]taires/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/#\/coproprietaires/)
  })

  test('copropriété create dialog opens', async ({ page }) => {
    await page.goto('/#/coproprietes')
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 })

    await page
      .getByRole('button', { name: /Nouvelle copropri/ })
      .click()

    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
