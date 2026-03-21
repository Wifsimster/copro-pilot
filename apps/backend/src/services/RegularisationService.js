import { AssembleeGeneraleModel } from '../models/AssembleeGenerale.js'
import { BudgetModel } from '../models/Budget.js'
import { AppelFondsModel } from '../models/AppelFonds.js'
import logger from '../logger.js'

const BUDGET_KEYWORDS = [
  'budget',
  'approbation',
  'previsionnel',
  'prévisionnel',
  'charges',
  'comptes',
]

class RegularisationService {
  async generatePostAgBudget(agId) {
    try {
      const ag = await AssembleeGeneraleModel.getById(agId)
      if (!ag) {
        logger.warn(
          `[RegularisationService] AG ${agId} not found`
        )
        return null
      }

      const resolutions =
        await AssembleeGeneraleModel.getResolutions(agId)

      const budgetResolutions = resolutions.filter(
        r =>
          r.resultat === 'adoptee' &&
          BUDGET_KEYWORDS.some(
            keyword =>
              (r.titre || '')
                .toLowerCase()
                .includes(keyword) ||
              (r.description || '')
                .toLowerCase()
                .includes(keyword)
          )
      )

      if (budgetResolutions.length === 0) {
        logger.info(
          `[RegularisationService] No budget resolution found for AG ${agId}`
        )
        return null
      }

      const agDate = new Date(ag.date)
      const exercice =
        agDate.getMonth() >= 6
          ? agDate.getFullYear() + 1
          : agDate.getFullYear()

      const formattedDate = agDate.toLocaleDateString(
        'fr-FR'
      )

      const budget = await BudgetModel.create({
        copropriete_id: ag.copropriete_id,
        annee: exercice,
        montant_total: 0,
        statut: 'brouillon',
        notes: `Budget genere automatiquement suite a l'AG du ${formattedDate}`,
      })

      logger.info(
        `[RegularisationService] Budget created (ID: ${budget.id}) from AG ${agId}`
      )

      return budget
    } catch (error) {
      logger.error(
        `[RegularisationService] Error generating post-AG budget: ${error.message}`
      )
      throw error
    }
  }

  async generateAppelsFondsSchedule(
    budgetId,
    coproprieteId
  ) {
    try {
      const budget = await BudgetModel.getById(budgetId)
      if (!budget) {
        logger.warn(
          `[RegularisationService] Budget ${budgetId} not found`
        )
        return null
      }

      const quarterlyAmount =
        Math.round(
          (budget.montant_total / 4 + Number.EPSILON) * 100
        ) / 100

      const appels = []

      for (let t = 1; t <= 4; t++) {
        const month = (t - 1) * 3
        const dateEmission = new Date(
          budget.annee,
          month,
          1
        )
        const dateEcheance = new Date(
          budget.annee,
          month,
          15
        )

        const appel = await AppelFondsModel.create({
          copropriete_id: coproprieteId,
          budget_id: budgetId,
          trimestre: t,
          annee: budget.annee,
          montant_total: quarterlyAmount,
          date_emission: dateEmission
            .toISOString()
            .split('T')[0],
          date_echeance: dateEcheance
            .toISOString()
            .split('T')[0],
          statut: 'brouillon',
        })

        appels.push(appel)
      }

      logger.info(
        `[RegularisationService] ${appels.length} appels de fonds created for budget ${budgetId}`
      )

      return appels
    } catch (error) {
      logger.error(
        `[RegularisationService] Error generating appels de fonds: ${error.message}`
      )
      throw error
    }
  }
}

export const regularisationService =
  new RegularisationService()
