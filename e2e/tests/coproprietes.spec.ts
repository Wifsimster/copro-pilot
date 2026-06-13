import { test, expect } from '@playwright/test'
import {
  loginAsSyndic,
  selectCopropriete,
  expectNoErrorBoundary,
} from './helpers'

/**
 * Copropriétés feature: list, search and drill-down into a detail page with
 * its tabbed sections.
 */

test.describe('Copropriétés', () => {
  test.beforeEach(async ({ page }) => {
    await selectCopropriete(page)
    await loginAsSyndic(page)
    await page.goto('/coproprietes')
    await expect(page.getByPlaceholder(/Rechercher/)).toBeVisible({
      timeout: 10_000,
    })
  })

  test('lists at least one copropriété', async ({ page }) => {
    await expect(page.locator('a[href^="/coproprietes/"]').first()).toBeVisible(
      {
        timeout: 10_000,
      }
    )
  })

  test('search filters the list', async ({ page }) => {
    const before = await page.locator('a[href^="/coproprietes/"]').count()
    expect(before).toBeGreaterThan(0)
    await page.getByPlaceholder(/Rechercher/).fill('zzz-no-such-copro-xyz')
    await expect(async () => {
      const after = await page.locator('a[href^="/coproprietes/"]').count()
      expect(after).toBeLessThan(before)
    }).toPass({ timeout: 5_000 })
  })

  test('opens a copropriété detail with its tabs', async ({ page }) => {
    await page.locator('a[href^="/coproprietes/"]').first().click()
    await expect(page).toHaveURL(/\/coproprietes\/\d+/)
    await expect(
      page.getByRole('button', { name: /Lots/ }).first()
    ).toBeVisible({ timeout: 10_000 })
    await expect(
      page.getByRole('button', { name: /Diagnostics/ }).first()
    ).toBeVisible()
    // Switch to the Diagnostics tab
    await page
      .getByRole('button', { name: /Diagnostics/ })
      .first()
      .click()
    await expectNoErrorBoundary(page)
  })
})
