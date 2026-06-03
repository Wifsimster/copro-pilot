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
            // Ensure the appel and the lot belong to the same copropriété
            // before persisting the line. Without this check, a caller can
            // attach a lot from copropriété A to an appel de fonds from
            // copropriété B and silently bill the wrong owners.
            const db = knexDatabase.getKnex()
            const [appel, lot] = await Promise.all([
                db('appels_fonds')
                    .select('id', 'copropriete_id')
                    .where('id', data.appel_fonds_id)
                    .first(),
                db('lots')
                    .select('id', 'copropriete_id', 'coproprietaire_id')
                    .where('id', data.lot_id)
                    .first(),
            ])
            if (!appel) {
                const err = new Error('Appel de fonds non trouvé')
                err.code = 'APPEL_NOT_FOUND'
                throw err
            }
            if (!lot) {
                const err = new Error('Lot non trouvé')
                err.code = 'LOT_NOT_FOUND'
                throw err
            }
            if (appel.copropriete_id !== lot.copropriete_id) {
                const err = new Error(
                    'Le lot et l\'appel de fonds doivent appartenir à la même copropriété'
                )
                err.code = 'COPROPRIETE_MISMATCH'
                throw err
            }
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
                throw new Error('Budget non trouvé')
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

                    // Distribute the quarter amount across lots by tantiemes.
                    // Per-lot rounding to the cent would let the sum of lines
                    // drift from quarterAmount (centime leak); the last lot
                    // absorbs the rounding remainder so the lines always sum
                    // back to exactly quarterAmount.
                    let allocated = 0
                    for (let i = 0; i < lots.length; i++) {
                        const lot = lots[i]
                        const isLast = i === lots.length - 1
                        const montantLot = isLast
                            ? Math.round((quarterAmount - allocated) * 100) / 100
                            : Math.round(
                                  ((quarterAmount * parseInt(lot.tantiemes, 10)) /
                                      totalTantiemes) *
                                      100
                              ) / 100
                        allocated += montantLot
                        await trx('appels_fonds_lignes')
                            .insert({
                                appel_fonds_id: appel.id,
                                lot_id: lot.id,
                                coproprietaire_id: lot.coproprietaire_id,
                                montant: montantLot,
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
