import { AppelFondsModel } from '../models/AppelFonds.js'
import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

class AppelFondsService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await AppelFondsModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[AppelFondsService] Error getting appels de fonds: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            const appel = await AppelFondsModel.getById(id)
            if (!appel) return null
            const lignes = await AppelFondsModel.getLignes(id)
            return { ...appel, lignes }
        } catch (error) {
            logger.error(`[AppelFondsService] Error getting appel ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await AppelFondsModel.create(data)
            logger.info(`[AppelFondsService] Appel de fonds créé: T${result.trimestre} ${result.annee} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[AppelFondsService] Error creating appel: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await AppelFondsModel.getById(id)
            if (!existing) return null
            const result = await AppelFondsModel.update(id, data)
            logger.info(`[AppelFondsService] Appel de fonds mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[AppelFondsService] Error updating appel ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await AppelFondsModel.getById(id)
            if (!existing) return false
            await AppelFondsModel.delete(id)
            logger.info(`[AppelFondsService] Appel de fonds supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[AppelFondsService] Error deleting appel ${id}: ${error.message}`)
            throw error
        }
    }

    async getLignes(appelFondsId) {
        try {
            return await AppelFondsModel.getLignes(appelFondsId)
        } catch (error) {
            logger.error(`[AppelFondsService] Error getting lignes: ${error.message}`)
            throw error
        }
    }

    async createLigne(data) {
        try {
            const result = await AppelFondsModel.createLigne(data)
            logger.info(`[AppelFondsService] Ligne d'appel créée (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[AppelFondsService] Error creating ligne: ${error.message}`)
            throw error
        }
    }

    async updateLigne(id, data) {
        try {
            const result = await AppelFondsModel.updateLigne(id, data)
            if (!result) return null
            logger.info(`[AppelFondsService] Ligne d'appel mise à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[AppelFondsService] Error updating ligne ${id}: ${error.message}`)
            throw error
        }
    }

    async deleteLigne(id) {
        try {
            const deleted = await AppelFondsModel.deleteLigne(id)
            if (!deleted) return false
            logger.info(`[AppelFondsService] Ligne d'appel supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[AppelFondsService] Error deleting ligne ${id}: ${error.message}`)
            throw error
        }
    }

    async generateFromBudget(budgetId) {
        try {
            const db = knexDatabase.getKnex()
            const budget = await db('budgets_previsionnels')
                .where('id', budgetId)
                .first()
            if (!budget) {
                throw new Error('Budget non trouve')
            }

            const lots = await db('lots')
                .where('copropriete_id', budget.copropriete_id)
                .whereNotNull('coproprietaire_id')

            const totalTantiemes = lots.reduce(
                (sum, lot) => sum + (parseInt(lot.tantiemes, 10) || 0),
                0
            )
            if (totalTantiemes === 0) {
                throw new Error('Aucun tantieme configure')
            }

            const quarterAmount =
                parseFloat(budget.montant_total) / 4

            const appels = await db.transaction(async trx => {
                const created = []
                for (let trimestre = 1; trimestre <= 4; trimestre++) {
                    const existing = await trx('appels_fonds')
                        .where({
                            copropriete_id: budget.copropriete_id,
                            annee: budget.annee,
                            trimestre,
                        })
                        .first()
                    if (existing) continue

                    const month = (trimestre - 1) * 3 + 1
                    const dateEmission = `${budget.annee}-${String(month).padStart(2, '0')}-01`
                    const echeanceMonth = month + 2
                    const dateEcheance = `${budget.annee}-${String(echeanceMonth).padStart(2, '0')}-30`

                    const [appel] = await trx('appels_fonds')
                        .insert({
                            copropriete_id: budget.copropriete_id,
                            budget_id: budget.id,
                            trimestre,
                            annee: budget.annee,
                            montant_total: quarterAmount,
                            date_emission: dateEmission,
                            date_echeance: dateEcheance,
                            statut: 'brouillon',
                        })
                        .returning('*')

                    for (const lot of lots) {
                        const montantLot =
                            (quarterAmount * parseInt(lot.tantiemes, 10)) /
                            totalTantiemes
                        await trx('appels_fonds_lignes')
                            .insert({
                                appel_fonds_id: appel.id,
                                lot_id: lot.id,
                                coproprietaire_id: lot.coproprietaire_id,
                                montant: Math.round(montantLot * 100) / 100,
                            })
                    }

                    created.push(appel)
                }
                return created
            })

            logger.info(
                `[AppelFondsService] Generated ${appels.length} appels from budget ${budgetId}`
            )
            return appels
        } catch (error) {
            logger.error(
                `[AppelFondsService] Error generating from budget: ${error.message}`
            )
            throw error
        }
    }
}

export const appelFondsService = new AppelFondsService()
