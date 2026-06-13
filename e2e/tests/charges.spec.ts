import { test, expect } from '@playwright/test'
import {
  loginAsSyndic,
  selectCopropriete,
  expectNoErrorBoundary,
} from './helpers'

/**
 * Charges & comptabilité feature: the budgets / appels de fonds / paiements
 * tabs must be reachable for a selected copropriété.
 */

test.describe('Charges', () => {
  test.beforeEach(async ({ page }) => {
    await selectCopropriete(page)
    await loginAsSyndic(page)
    await page.goto('/charges')
  })

  test('shows the accounting tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Budgets' })).toBeVisible({
      timeout: 10_000,
    })
    await expect(
      page.getByRole('tab', { name: /Appels de fonds/ })
    ).toBeVisible()
    await expect(page.getByRole('tab', { name: /Paiements/ })).toBeVisible()
  })

  test('switches between tabs without error', async ({ page }) => {
    await expect(
      page.getByRole('tab', { name: /Appels de fonds/ })
    ).toBeVisible({ timeout: 10_000 })
    await page.getByRole('tab', { name: /Appels de fonds/ }).click()
    await page.getByRole('tab', { name: /Paiements/ }).click()
    await page.getByRole('tab', { name: 'Budgets' }).click()
    await expectNoErrorBoundary(page)
  })
})
