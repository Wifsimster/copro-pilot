import { carnetEntretienService } from '../services/CarnetEntretienService.js'
import logger from '../logger.js'

export class CarnetEntretienController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const entrees = await carnetEntretienService.getAllByCopropriete(coproprieteId)
            res.json({ data: entrees })
        } catch (error) {
            logger.error(`[CarnetEntretienController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le carnet d\'entretien' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const entree = await carnetEntretienService.getById(id)
            if (!entree) return res.status(404).json({ error: 'Entrée non trouvée' })
            res.json({ data: entree })
        } catch (error) {
            logger.error(`[CarnetEntretienController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer l\'entrée' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, titre, date_realisation } = req.body
            if (!copropriete_id || !titre || !date_realisation) {
                return res.status(400).json({ error: 'Les champs copropriete_id, titre et date_realisation sont obligatoires' })
            }
            const result = await carnetEntretienService.create(req.body)
            res.status(201).json({ data: result, message: 'Entrée ajoutée au carnet d\'entretien' })
        } catch (error) {
            logger.error(`[CarnetEntretienController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible d\'ajouter l\'entrée' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await carnetEntretienService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Entrée non trouvée' })
            res.json({ data: result, message: 'Entrée mise à jour avec succès' })
        } catch (error) {
            logger.error(`[CarnetEntretienController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour l\'entrée' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await carnetEntretienService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Entrée non trouvée' })
            res.json({ message: 'Entrée supprimée avec succès' })
        } catch (error) {
            logger.error(`[CarnetEntretienController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer l\'entrée' })
        }
    }
}
