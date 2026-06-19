import { test, expect } from '@playwright/test'
import {
  loginAsSyndic,
  selectCopropriete,
  expectNoErrorBoundary,
} from './helpers'

/**
 * Page-render coverage: log in as the syndic, select a copropriété, then visit
 * every authenticated page and assert its heading renders without tripping the
 * error boundary. This guards against routing, lazy-import and render
 * regressions across the whole syndic-facing surface.
 */

// path -> a regex matching a stable heading rendered by that page.
const PAGES: Array<[string, RegExp]> = [
  ['/dashboard', /Bonjour|Bonsoir/],
  ['/coproprietes', /Copropri/],
  ['/coproprietaires', /Copropri[ée]taires/],
  ['/charges', /Charges/],
  ['/assemblees', /Assembl/],
  ['/travaux', /Travaux/],
  ['/documents', /Documents/],
  ['/fiche-synthetique', /Fiche synth/],
  ['/comptes-bancaires', /Comptes bancaires/],
  ['/conseil-syndical', /Conseil Syndical/],
  ['/contrats', /Contrats/],
  ['/assurances', /Assurances/],
  ['/contentieux', /Contentieux/],
  ['/employes', /Employés/],
  ['/reglements', /Reglement/],
  ['/immatriculation', /Immatriculation/],
  ['/contrats-syndic', /Contrat de syndic/],
  ['/comptabilite-reglementaire', /Comptabilité réglementaire/],
  ['/notifications', /Notifications/],
  ['/profil', /Mon profil/],
  ['/donnees-personnelles', /Mes donn[ée]es personnelles/],
  ['/gestion-utilisateurs', /Gestion des utilisateurs/],
  ['/tickets', /Messagerie/],
  ['/exports', /Exports/],
  ['/subscription', /Mon abonnement/],
]

test.describe('Authenticated page navigation', () => {
  test.beforeEach(async ({ page }) => {
    await selectCopropriete(page)
    await loginAsSyndic(page)
  })

  for (const [path, heading] of PAGES) {
    test(`renders ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL(new RegExp(path.replace(/\//g, '\\/')))
      await expect(
        page.getByRole('heading', { name: heading }).first()
      ).toBeVisible({ timeout: 15_000 })
      await expectNoErrorBoundary(page)
    })
  }

  test('sidebar navigates between sections', async ({ page }) => {
    await page.goto('/dashboard')
    const link = page.locator('a[href="/coproprietes"]').first()
    await expect(link).toBeVisible({ timeout: 10_000 })
    await link.click()
    await expect(page).toHaveURL(/\/coproprietes$/)
    await expect(
      page.getByRole('heading', { name: /Copropri/ }).first()
    ).toBeVisible()
  })
})
