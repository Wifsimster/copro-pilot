import { OrdreServiceModel } from '../models/OrdreService.js'
import { workflowEventService } from './WorkflowEventService.js'
import logger from '../logger.js'

const TRANSITIONS = {
    brouillon: ['emis', 'annule'],
    emis: ['devis_recu', 'annule'],
    devis_recu: ['accepte', 'annule'],
    accepte: ['termine', 'annule'],
    termine: [],
    annule: [],
}

class OrdreServiceService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await OrdreServiceModel.getAllByCopropriete(
                coproprieteId
            )
        } catch (error) {
            logger.error(
                `[OrdreServiceService] Error getting ordres: ${error.message}`
            )
            throw error
        }
    }

    async getAllByIncident(incidentId) {
        try {
            return await OrdreServiceModel.getAllByIncident(
                incidentId
            )
        } catch (error) {
            logger.error(
                `[OrdreServiceService] Error getting ordres by incident: ${error.message}`
            )
            throw error
        }
    }

    async getById(id) {
        try {
            return await OrdreServiceModel.getById(id)
        } catch (error) {
            logger.error(
                `[OrdreServiceService] Error getting ordre ${id}: ${error.message}`
            )
            throw error
        }
    }

    async create(data) {
        try {
            const year = new Date().getFullYear()
            const numero = await OrdreServiceModel.getNextNumero(
                year
            )
            const result = await OrdreServiceModel.create({
                ...data,
                numero,
            })
            logger.info(
                `[OrdreServiceService] Ordre de service cree: ${result.numero} (ID: ${result.id})`
            )
            return result
        } catch (error) {
            logger.error(
                `[OrdreServiceService] Error creating ordre: ${error.message}`
            )
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await OrdreServiceModel.getById(id)
            if (!existing) return null

            // Validate status transition
            if (data.statut && data.statut !== existing.statut) {
                const allowed = TRANSITIONS[existing.statut]
                if (
                    !allowed ||
                    !allowed.includes(data.statut)
                ) {
                    const error = new Error(
                        `Transition de statut invalide : "${existing.statut}" vers "${data.statut}". ` +
                        `Transitions autorisees : ${(allowed || []).join(', ') || 'aucune'}`
                    )
                    error.code = 'INVALID_STATUS_TRANSITION'
                    throw error
                }
            }

            const result = await OrdreServiceModel.update(
                id,
                data
            )
            logger.info(
                `[OrdreServiceService] Ordre de service mis a jour (ID: ${id})`
            )

            // Workflow events on status change
            if (
                data.statut &&
                data.statut !== existing.statut
            ) {
                if (data.statut === 'emis') {
                    workflowEventService
                        .onOrdreServiceEmis(result)
                        .catch(err =>
                            logger.error(
                                `[OrdreServiceService] Workflow event error: ${err.message}`
                            )
                        )
                }
                if (data.statut === 'termine') {
                    workflowEventService
                        .onOrdreServiceTermine(result)
                        .catch(err =>
                            logger.error(
                                `[OrdreServiceService] Workflow event error: ${err.message}`
                            )
                        )
                }
            }

            return result
        } catch (error) {
            logger.error(
                `[OrdreServiceService] Error updating ordre ${id}: ${error.message}`
            )
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await OrdreServiceModel.getById(id)
            if (!existing) return false
            await OrdreServiceModel.delete(id)
            logger.info(
                `[OrdreServiceService] Ordre de service supprime (ID: ${id})`
            )
            return true
        } catch (error) {
            logger.error(
                `[OrdreServiceService] Error deleting ordre ${id}: ${error.message}`
            )
            throw error
        }
    }
}

export const ordreServiceService = new OrdreServiceService()
