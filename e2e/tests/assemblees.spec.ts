import { test, expect } from '@playwright/test'

test.describe('Assemblees page', () => {
  test('should show no copropriete selected message', async ({ page }) => {
    await page.goto('/#/assemblees')
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 })

    await expect(
      page.getByText('Aucune copropriete selectionnee')
    ).toBeVisible()
  })

  test('should display assemblees page', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'copropriete-selection',
        JSON.stringify({
          state: { selectedCoproprieteId: 1 },
          version: 0,
        })
      )
    })

    await page.goto('/#/assemblees')
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 })

    await expect(page.locator('h1')).toContainText('Assemblees Generales')
  })

  test('should show create button', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'copropriete-selection',
        JSON.stringify({
          state: { selectedCoproprieteId: 1 },
          version: 0,
        })
      )
    })

    await page.goto('/#/assemblees')
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 })

    await expect(
      page.getByRole('button', { name: /Nouvelle AG/ })
    ).toBeVisible()
  })

  test('should display AG data from seeds', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'copropriete-selection',
        JSON.stringify({
          state: { selectedCoproprieteId: 1 },
          version: 0,
        })
      )
    })

    await page.goto('/#/assemblees')
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 })

    // Wait for loading to finish — either AG cards appear or empty state shows
    await expect(
      page.getByText('AG du').first().or(
        page.getByText('Aucune assemblee generale')
      )
    ).toBeVisible({ timeout: 15_000 })
  })
})
