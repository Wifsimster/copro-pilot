import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/dashboard')
    // Wait for the dashboard to finish loading (skeleton disappears, h1 appears)
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 })
  })

  test('should display greeting with user name', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Bonjour|Bonsoir/)
  })

  test('should display current date', async ({ page }) => {
    const now = new Date()
    const year = now.getFullYear().toString()
    // The date is formatted in French locale with full weekday, day, month, year
    await expect(page.getByText(year, { exact: false })).toBeVisible()
  })

  test('should display metrics cards', async ({ page }) => {
    const labels = [
      'Coproprietes',
      'Incidents ouverts',
      'Impayes',
      'Prochaines AG',
      'Contrats a renouveler',
      'Procedures actives',
      'Sinistres ouverts',
    ]

    for (const label of labels) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test('should display quick action buttons', async ({ page }) => {
    const actions = [
      'Signaler un incident',
      'Planifier une AG',
      'Ajouter une copropriete',
      'Gerer les charges',
    ]

    for (const action of actions) {
      await expect(
        page.getByRole('button', { name: action })
      ).toBeVisible()
    }
  })

  test('should navigate to coproprietes via quick action', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Ajouter une copropriete' })
      .click()

    await expect(page).toHaveURL(/\/#\/coproprietes/)
  })

  test('should navigate to travaux via metric card', async ({
    page,
  }) => {
    await page
      .getByText('Incidents ouverts', { exact: true })
      .click()

    await expect(page).toHaveURL(/\/#\/travaux/)
  })

  test('should display tasks section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Taches de la semaine' })
    ).toBeVisible()
  })

  test('should display activity section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Activite recente' })
    ).toBeVisible()
  })
})
