import { test, expect } from '@playwright/test'
import { expectNoErrorBoundary } from './helpers'

/**
 * Public (unauthenticated) pages: marketing, legal and auth-entry pages must
 * render for visitors without a session.
 */

const PAGES: Array<[string, RegExp]> = [
  ['/', /G[ée]rez vos copropri/],
  ['/securite', /Vos donn[ée]es de copropri/],
  ['/vs/logiciels-traditionnels', /CoproPilot vs logiciels/],
  ['/politique-confidentialite', /Politique de confidentialit/],
  ['/forgot-password', /Mot de passe oubli/],
]

test.describe('Public pages', () => {
  for (const [path, heading] of PAGES) {
    test(`renders ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(
        page.getByRole('heading', { name: heading }).first()
      ).toBeVisible({ timeout: 15_000 })
      await expectNoErrorBoundary(page)
    })
  }

  test('login page shows the sign-in form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('tab', { name: 'Connexion' })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.locator('#signin-email')).toBeVisible()
    await expect(page.locator('#signin-password')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Se connecter' })
    ).toBeVisible()
  })

  test('unknown route renders the 404 page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')
    await expect(page.getByText('404')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Page non trouvée')).toBeVisible()
    await expectNoErrorBoundary(page)
  })
})
