import { partieCommuneService } from '../services/PartieCommuneService.js'
import logger from '../logger.js'

export class PartieCommuneController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const partiesCommunes = await partieCommuneService.getAllByCopropriete(coproprieteId)
            res.json({ data: partiesCommunes })
        } catch (error) {
            logger.error(`[PartieCommuneController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les parties communes' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const partieCommune = await partieCommuneService.getById(id)
            if (!partieCommune) return res.status(404).json({ error: 'Partie commune non trouvée' })
            res.json({ data: partieCommune })
        } catch (error) {
            logger.error(`[PartieCommuneController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer la partie commune' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, nom } = req.body
            if (!copropriete_id || !nom) {
                return res.status(400).json({ error: 'Les champs copropriete_id et nom sont obligatoires' })
            }
            const result = await partieCommuneService.create(req.body)
            res.status(201).json({ data: result, message: 'Partie commune créée avec succès' })
        } catch (error) {
            logger.error(`[PartieCommuneController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer la partie commune' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await partieCommuneService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Partie commune non trouvée' })
            res.json({ data: result, message: 'Partie commune mise à jour avec succès' })
        } catch (error) {
            logger.error(`[PartieCommuneController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour la partie commune' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await partieCommuneService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Partie commune non trouvée' })
            res.json({ message: 'Partie commune supprimée avec succès' })
        } catch (error) {
            logger.error(`[PartieCommuneController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la partie commune' })
        }
    }
}
