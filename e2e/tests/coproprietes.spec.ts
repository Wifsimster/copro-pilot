import { test, expect } from '@playwright/test'

test.describe('Copropriétés', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/coproprietes')
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 })
  })

  test('should display copropriétés list', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Copropriétés')
    await expect(
      page.getByText(/\d+ copropriété(s)? gérée(s)?/)
    ).toBeVisible()

    // Cards should be visible in the grid
    const cards = page.locator('.grid > div')
    await expect(cards.first()).toBeVisible()
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('should show search input', async ({ page }) => {
    await expect(
      page.getByPlaceholder(
        'Rechercher par nom, adresse, ville ou code postal...'
      )
    ).toBeVisible()
  })

  test('should filter copropriétés by search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      'Rechercher par nom, adresse, ville ou code postal...'
    )
    await searchInput.fill('Montpellier')

    // Wait for filtering to take effect
    await expect(
      page.getByText('Montpellier', { exact: false })
    ).toBeVisible()

    // Cards should be filtered — fewer results
    const cards = page.locator('.grid > div')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    // Each visible card should mention Montpellier
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText('Montpellier')
    }
  })

  test('should open create dialog', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Nouvelle copropriété' })
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('text=Nouvelle copropriete')).toBeVisible()
  })

  test('should create a new copropriété', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Nouvelle copropriété' })
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Fill required fields
    await dialog.getByLabel('Nom *').fill('E2E Test Résidence')
    await dialog.getByLabel('Adresse *').fill('1 Rue Test')
    await dialog.getByLabel('Code postal *').fill('75001')
    await dialog.getByLabel('Ville *').fill('Paris')

    // Submit the form
    await dialog.getByRole('button', { name: 'Enregistrer' }).click()

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 10_000 })

    // Verify the new copropriété appears in the list
    await expect(page.getByText('E2E Test Résidence')).toBeVisible({
      timeout: 10_000,
    })
  })

  test('should navigate to copropriété detail', async ({ page }) => {
    // The Eye icon button is only visible on hover, so use force: true
    const firstCard = page.locator('.grid > div').first()
    const viewLink = firstCard.locator('a').first()

    await viewLink.click({ force: true })

    await page.waitForURL(/\/#\/coproprietes\/\d+/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/#\/coproprietes\/\d+/)
  })

  test('should display copropriété stats', async ({ page }) => {
    const firstCard = page.locator('.grid > div').first()

    await expect(firstCard.getByText('Lots')).toBeVisible()
    await expect(firstCard.getByText('Copropriétaires')).toBeVisible()
    await expect(firstCard.getByText('Tantièmes')).toBeVisible()
  })
})
