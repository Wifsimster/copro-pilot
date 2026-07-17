import { expect, type Page } from '@playwright/test'

export const SYNDIC = { email: 'syndic@copropilot.local', password: 'syndic' }
export const COPRO = { email: 'copro@copropilot.local', password: 'copro' }

/**
 * Seed the persisted copropriété selection (Zustand persist) before any app
 * script runs, so pages scoped to a copropriété render their content instead
 * of the "no copropriété selected" placeholder.
 */
export async function selectCopropriete(page: Page, id = 1) {
  await page.addInitScript(selectedId => {
    localStorage.setItem(
      'copropriete-selection',
      JSON.stringify({
        state: { selectedCoproprieteId: selectedId },
        version: 0,
      })
    )
  }, id)
}

async function login(
  page: Page,
  creds: { email: string; password: string },
  expectedUrl: RegExp
) {
  await page.goto('/login')
  await expect(page.locator('#signin-email')).toBeVisible({ timeout: 10_000 })
  await page.locator('#signin-email').fill(creds.email)
  await page.locator('#signin-password').fill(creds.password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  // Sign-in redirects to the landing page client-side (PublicRoute), so a
  // single navigation settles here — no hard reload to interrupt the next goto.
  await expect(page).toHaveURL(expectedUrl, { timeout: 15_000 })
}

/** Log in as the demo syndic and land on the dashboard. */
export async function loginAsSyndic(page: Page) {
  await login(page, SYNDIC, /\/dashboard/)
}

/** Log in as the demo copropriétaire and land on the extranet. */
export async function loginAsCopro(page: Page) {
  await login(page, COPRO, /\/extranet/)
}

/** Assert the global error boundary fallback is not shown on the page. */
export async function expectNoErrorBoundary(page: Page) {
  await expect(page.getByText('Une erreur est survenue')).toHaveCount(0)
}
