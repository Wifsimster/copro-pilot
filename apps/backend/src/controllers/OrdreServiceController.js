import { ordreServiceService } from '../services/OrdreServiceService.js'
import logger from '../logger.js'

export class OrdreServiceController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const ordres =
                await ordreServiceService.getAllByCopropriete(
                    coproprieteId
                )
            res.json({ data: ordres })
        } catch (error) {
            logger.error(
                `[OrdreServiceController] Error: ${error.message}`
            )
            res.status(500).json({
                error:
                    'Impossible de recuperer les ordres de service',
            })
        }
    }

    static async getAllByIncident(req, res) {
        try {
            const { incidentId } = req.params
            const ordres =
                await ordreServiceService.getAllByIncident(
                    incidentId
                )
            res.json({ data: ordres })
        } catch (error) {
            logger.error(
                `[OrdreServiceController] Error: ${error.message}`
            )
            res.status(500).json({
                error:
                    'Impossible de recuperer les ordres de service',
            })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const ordre =
                await ordreServiceService.getById(id)
            if (!ordre) {
                return res.status(404).json({
                    error: 'Ordre de service non trouve',
                })
            }
            res.json({ data: ordre })
        } catch (error) {
            logger.error(
                `[OrdreServiceController] Error: ${error.message}`
            )
            res.status(500).json({
                error:
                    'Impossible de recuperer l\'ordre de service',
            })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, objet } = req.body
            if (!copropriete_id || !objet) {
                return res.status(400).json({
                    error:
                        'Les champs copropriete_id et objet sont obligatoires',
                })
            }
            const result =
                await ordreServiceService.create(req.body)
            res.status(201).json({
                data: result,
                message:
                    'Ordre de service cree avec succes',
            })
        } catch (error) {
            logger.error(
                `[OrdreServiceController] Error creating: ${error.message}`
            )
            res.status(500).json({
                error:
                    'Impossible de creer l\'ordre de service',
            })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result =
                await ordreServiceService.update(
                    id,
                    req.body
                )
            if (!result) {
                return res.status(404).json({
                    error: 'Ordre de service non trouve',
                })
            }
            res.json({
                data: result,
                message:
                    'Ordre de service mis a jour avec succes',
            })
        } catch (error) {
            if (
                error.code === 'INVALID_STATUS_TRANSITION'
            ) {
                return res
                    .status(400)
                    .json({ error: error.message })
            }
            logger.error(
                `[OrdreServiceController] Error updating: ${error.message}`
            )
            res.status(500).json({
                error:
                    'Impossible de mettre a jour l\'ordre de service',
            })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted =
                await ordreServiceService.delete(id)
            if (!deleted) {
                return res.status(404).json({
                    error: 'Ordre de service non trouve',
                })
            }
            res.json({
                message:
                    'Ordre de service supprime avec succes',
            })
        } catch (error) {
            logger.error(
                `[OrdreServiceController] Error deleting: ${error.message}`
            )
            res.status(500).json({
                error:
                    'Impossible de supprimer l\'ordre de service',
            })
        }
    }
}
