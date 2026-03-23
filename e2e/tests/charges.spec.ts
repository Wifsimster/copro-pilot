import { test, expect } from '@playwright/test'

test.describe('Charges & Comptabilite', () => {
  test('should show no copropriete selected message', async ({ page }) => {
    await page.goto('/#/charges')

    await expect(
      page.getByText('Aucune copropriete selectionnee', { exact: false })
    ).toBeVisible()
  })

  test('should display charges page with tabs', async ({ page }) => {
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

    await expect(page.getByText('Charges & Comptabilite')).toBeVisible()

    await expect(
      page.getByRole('button', { name: 'Budgets' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Appels de fonds' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Paiements' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Fonds travaux' })
    ).toBeVisible()
  })

  test('should switch between tabs', async ({ page }) => {
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

    // Budgets tab (default)
    await page.getByRole('button', { name: 'Budgets' }).click()
    await expect(page.getByText('Budgets previsionnels')).toBeVisible()

    // Appels de fonds tab
    await page.getByRole('button', { name: 'Appels de fonds' }).click()
    await expect(page.getByText('Appels de fonds')).toBeVisible()

    // Paiements tab
    await page.getByRole('button', { name: 'Paiements' }).click()
    await expect(page.getByText('Paiements')).toBeVisible()

    // Fonds travaux tab
    await page.getByRole('button', { name: 'Fonds travaux' }).click()
    await expect(page.getByText('Fonds travaux')).toBeVisible()
  })

  test('should display budgets table with seed data', async ({ page }) => {
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

    await page.getByRole('button', { name: 'Budgets' }).click()

    await expect(page.getByText('Budgets previsionnels')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Nouveau budget' })
    ).toBeVisible()

    // Verify table headers
    await expect(page.getByText('Annee')).toBeVisible()
    await expect(page.getByText('Montant total')).toBeVisible()
    await expect(page.getByText('Statut')).toBeVisible()
  })

  test('should display appels de fonds tab', async ({ page }) => {
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

    await page.getByRole('button', { name: 'Appels de fonds' }).click()

    await expect(page.getByText('Appels de fonds')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Nouvel appel' })
    ).toBeVisible()
  })
})
