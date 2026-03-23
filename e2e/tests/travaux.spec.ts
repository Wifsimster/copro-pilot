import { test, expect } from '@playwright/test'

test.describe('Travaux & Incidents', () => {
  test('should show no copropriete selected message', async ({ page }) => {
    await page.goto('/#/travaux')

    await expect(
      page.getByText('Aucune copropriete selectionnee', { exact: false })
    ).toBeVisible()
  })

  test('should display travaux page with tabs', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'copropriete-selection',
        JSON.stringify({
          state: { selectedCoproprieteId: 1 },
          version: 0,
        })
      )
    })

    await page.goto('/#/travaux')

    await expect(page.getByText('Travaux & Incidents')).toBeVisible()

    await expect(
      page.getByRole('button', { name: 'Incidents' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Interventions' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: "Carnet d'entretien" })
    ).toBeVisible()
  })

  test('should display incidents tab by default', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'copropriete-selection',
        JSON.stringify({
          state: { selectedCoproprieteId: 1 },
          version: 0,
        })
      )
    })

    await page.goto('/#/travaux')

    await expect(page.getByText('Incidents')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Signaler un incident' })
    ).toBeVisible()
  })

  test('should switch to interventions tab', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'copropriete-selection',
        JSON.stringify({
          state: { selectedCoproprieteId: 1 },
          version: 0,
        })
      )
    })

    await page.goto('/#/travaux')

    await page.getByRole('button', { name: 'Interventions' }).click()

    await expect(page.getByText('Interventions')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Nouvelle intervention' })
    ).toBeVisible()
  })

  test('should switch to carnet tab', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'copropriete-selection',
        JSON.stringify({
          state: { selectedCoproprieteId: 1 },
          version: 0,
        })
      )
    })

    await page.goto('/#/travaux')

    await page
      .getByRole('button', { name: "Carnet d'entretien" })
      .click()

    await expect(page.getByText("Carnet d'entretien")).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Nouvelle entree' })
    ).toBeVisible()
  })

  test('should display incident data in table', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'copropriete-selection',
        JSON.stringify({
          state: { selectedCoproprieteId: 1 },
          version: 0,
        })
      )
    })

    await page.goto('/#/travaux')

    // Verify table headers are present
    await expect(page.getByText('Titre')).toBeVisible()
    await expect(page.getByText('Urgence')).toBeVisible()
    await expect(page.getByText('Statut')).toBeVisible()
  })
})
