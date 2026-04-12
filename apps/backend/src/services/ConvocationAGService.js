import { ConvocationAGModel } from '../models/ConvocationAG.js'
import { AssembleeGeneraleModel } from '../models/AssembleeGenerale.js'
import { eventDispatchService } from './EventDispatchService.js'
import logger from '../logger.js'

class ConvocationAGService {
    async getByAgId(agId) {
        try {
            return await ConvocationAGModel.getByAgId(agId)
        } catch (error) {
            logger.error(`[ConvocationService] Error getting convocations: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            const convocation = await ConvocationAGModel.getById(id)
            if (!convocation) return null
            const destinataires = await ConvocationAGModel.getDestinataires(id)
            return { ...convocation, destinataires }
        } catch (error) {
            logger.error(`[ConvocationService] Error getting convocation ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await ConvocationAGModel.create(data)
            logger.info(`[ConvocationService] Convocation créée pour AG ${data.ag_id} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[ConvocationService] Error creating convocation: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await ConvocationAGModel.getById(id)
            if (!existing) return null
            const result = await ConvocationAGModel.update(id, data)
            logger.info(`[ConvocationService] Convocation mise à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[ConvocationService] Error updating convocation ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await ConvocationAGModel.getById(id)
            if (!existing) return false
            await ConvocationAGModel.delete(id)
            logger.info(`[ConvocationService] Convocation supprimée (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[ConvocationService] Error deleting convocation ${id}: ${error.message}`)
            throw error
        }
    }

    async getDestinataires(convocationId) {
        try {
            return await ConvocationAGModel.getDestinataires(convocationId)
        } catch (error) {
            logger.error(`[ConvocationService] Error getting destinataires: ${error.message}`)
            throw error
        }
    }

    async addDestinataire(data) {
        try {
            const result = await ConvocationAGModel.addDestinataire(data)
            logger.info(`[ConvocationService] Destinataire ajouté: copro ${data.coproprietaire_id}`)
            return result
        } catch (error) {
            logger.error(`[ConvocationService] Error adding destinataire: ${error.message}`)
            throw error
        }
    }

    async updateDestinataire(id, data) {
        try {
            const result = await ConvocationAGModel.updateDestinataire(id, data)
            logger.info(`[ConvocationService] Destinataire mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[ConvocationService] Error updating destinataire ${id}: ${error.message}`)
            throw error
        }
    }

    async deleteDestinataire(id) {
        try {
            await ConvocationAGModel.deleteDestinataire(id)
            logger.info(`[ConvocationService] Destinataire supprimé (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[ConvocationService] Error deleting destinataire ${id}: ${error.message}`)
            throw error
        }
    }

    async genererDestinataires(convocationId) {
        try {
            const convocation = await ConvocationAGModel.getById(convocationId)
            if (!convocation) return null
            const ag = await AssembleeGeneraleModel.getById(convocation.ag_id)
            if (!ag) return null
            const result = await ConvocationAGModel.genererDestinataires(convocationId, ag.copropriete_id)
            logger.info(`[ConvocationService] ${result.length} destinataires générés pour convocation ${convocationId}`)
            return result
        } catch (error) {
            logger.error(`[ConvocationService] Error generating destinataires: ${error.message}`)
            throw error
        }
    }

    async envoyerConvocation(convocationId) {
        try {
            const convocation = await ConvocationAGModel.getById(convocationId)
            if (!convocation) return null

            // Verify 21-day delay
            const delai = await ConvocationAGModel.verifierDelai(convocation.ag_id)

            const today = new Date().toISOString().split('T')[0]

            const { default: knexDatabase } = await import('../config/knex-database.js')
            const db = knexDatabase.getKnex()

            const result = await db.transaction(async trx => {
                // Update convocation status
                const [updated] = await trx('convocations_ag')
                    .where('id', convocationId)
                    .update({ statut: 'envoyee', date_envoi: today, updated_at: trx.fn.now() })
                    .returning('*')

                // Update AG status to convoquee and set date_convocation
                await trx('assemblees_generales')
                    .where('id', convocation.ag_id)
                    .update({ statut: 'convoquee', date_convocation: today, updated_at: trx.fn.now() })

                // Mark all destinataires as envoyee
                const destinataires = await trx('destinataires_convocation')
                    .where('convocation_id', convocationId)

                for (const dest of destinataires) {
                    await trx('destinataires_convocation')
                        .where('id', dest.id)
                        .update({
                            statut: 'envoyee',
                            date_envoi: today,
                            mode_envoi: convocation.mode_envoi === 'les_deux' ? 'email' : convocation.mode_envoi,
                            updated_at: trx.fn.now(),
                        })
                }

                return { ...updated, delai_verification: delai, destinataires_mis_a_jour: destinataires.length }
            })

            logger.info(`[ConvocationService] Convocation ${convocationId} envoyée (délai: ${delai.valide ? 'respecté' : 'NON respecté'})`)
            return result
        } catch (error) {
            logger.error(`[ConvocationService] Error sending convocation ${convocationId}: ${error.message}`)
            throw error
        }
    }

    async verifierDelai(agId) {
        try {
            return await ConvocationAGModel.verifierDelai(agId)
        } catch (error) {
            logger.error(`[ConvocationService] Error verifying delay: ${error.message}`)
            throw error
        }
    }
}

export const convocationAGService = new ConvocationAGService()
