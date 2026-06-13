import { test, expect } from '@playwright/test'
import {
  loginAsSyndic,
  selectCopropriete,
  expectNoErrorBoundary,
} from './helpers'

/**
 * Assemblées générales feature: list and drill-down into an AG detail page.
 */

test.describe('Assemblées générales', () => {
  test.beforeEach(async ({ page }) => {
    await selectCopropriete(page)
    await loginAsSyndic(page)
    await page.goto('/assemblees')
    await expect(
      page.getByRole('heading', { name: /Assembl/ }).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('lists assemblées', async ({ page }) => {
    // AG cards are headed "AG du <date>"; the row actions (incl. the detail
    // link) are revealed on hover, so assert on the card heading instead.
    await expect(page.getByText(/AG du/).first()).toBeVisible({
      timeout: 10_000,
    })
  })

  test('opens an assemblée detail', async ({ page }) => {
    const card = page.getByText(/AG du/).first()
    await expect(card).toBeVisible({ timeout: 10_000 })
    await card.hover()
    const detailLink = page.locator('a[href^="/assemblees/"]').first()
    await detailLink.click()
    await expect(page).toHaveURL(/\/assemblees\/\d+/)
    await expect(page.getByRole('heading').first()).toBeVisible({
      timeout: 10_000,
    })
    await expectNoErrorBoundary(page)
  })
})
