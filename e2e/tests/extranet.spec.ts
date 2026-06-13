import { test, expect } from '@playwright/test'
import { loginAsCopro, expectNoErrorBoundary } from './helpers'

/**
 * Extranet: the copropriétaire-facing space. Logging in as the demo
 * copropriétaire must land on the extranet and every extranet page must render.
 */

const PAGES: Array<[string, RegExp]> = [
  ['/extranet', /Bonjour/],
  ['/extranet/profil', /Mon profil/],
  ['/extranet/documents', /Documents/],
  ['/extranet/compte', /Mon compte/],
  ['/extranet/charges', /Mes charges/],
  ['/extranet/appels-fonds', /Appels de fonds/],
  ['/extranet/fonds-travaux', /Fonds travaux/],
  // A copropriétaire who is not a conseil member sees an access-restricted
  // state rather than the conseil data — both are valid renders.
  [
    '/extranet/conseil-syndical',
    /Conseil syndical|Acc[èe]s (non disponible|r[ée]serv)/,
  ],
]

test.describe('Extranet (copropriétaire)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCopro(page)
  })

  test('copropriétaire lands on the extranet dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/\/extranet/)
    await expect(
      page.getByRole('heading', { name: /Bonjour/ }).first()
    ).toBeVisible({ timeout: 15_000 })
  })

  for (const [path, heading] of PAGES) {
    test(`renders ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(
        page.getByRole('heading', { name: heading }).first()
      ).toBeVisible({ timeout: 15_000 })
      await expectNoErrorBoundary(page)
    })
  }
})
