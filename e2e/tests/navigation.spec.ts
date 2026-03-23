import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/dashboard')
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 })
  })

  test('should display sidebar navigation', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: 'Tableau de bord' })
    ).toBeVisible()
  })

  test('should navigate to dashboard', async ({ page }) => {
    await page.getByRole('link', { name: 'Tableau de bord' }).click()

    await expect(page).toHaveURL(/\/#\/dashboard/)
  })

  test('should navigate to coproprietes', async ({ page }) => {
    await page.getByRole('link', { name: 'Coproprietes', exact: true }).click()

    await expect(page).toHaveURL(/\/#\/coproprietes/)
  })

  test('should navigate to coproprietaires', async ({ page }) => {
    await page
      .getByRole('link', { name: 'Coproprietaires', exact: true })
      .click()

    await expect(page).toHaveURL(/\/#\/coproprietaires/)
  })

  test('should navigate to charges', async ({ page }) => {
    // "Gestion" section is collapsible — expand it if needed
    const chargesLink = page.getByRole('link', { name: 'Charges' })
    if (!(await chargesLink.isVisible())) {
      await page.getByText('Gestion', { exact: true }).click()
    }

    await chargesLink.click()
    await expect(page).toHaveURL(/\/#\/charges/)
  })

  test('should navigate to travaux', async ({ page }) => {
    // "Technique" section is collapsible — expand it if needed
    const travauxLink = page.getByRole('link', { name: 'Travaux' })
    if (!(await travauxLink.isVisible())) {
      await page.getByText('Technique', { exact: true }).click()
    }

    await travauxLink.click()
    await expect(page).toHaveURL(/\/#\/travaux/)
  })

  test('should navigate to documents', async ({ page }) => {
    // "Administration" section is collapsible — expand it if needed
    const documentsLink = page.getByRole('link', { name: 'Documents' })
    if (!(await documentsLink.isVisible())) {
      await page.getByText('Administration', { exact: true }).click()
    }

    await documentsLink.click()
    await expect(page).toHaveURL(/\/#\/documents/)
  })

  test('should display user menu', async ({ page }) => {
    // The user menu is a button at the bottom of the sidebar containing
    // the user avatar and triggering a dropdown menu
    const userMenuButton = page.locator('[data-tour="user-profile"] button')
    await expect(userMenuButton).toBeVisible()
  })
})
