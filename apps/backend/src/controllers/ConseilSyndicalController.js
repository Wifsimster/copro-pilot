import { conseilSyndicalService } from '../services/ConseilSyndicalService.js'
import logger from '../logger.js'

export class ConseilSyndicalController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const membres = await conseilSyndicalService.getAllByCopropriete(coproprieteId)
            res.json({ data: membres })
        } catch (error) {
            logger.error(`[ConseilSyndicalController] Error getting conseil syndical: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le conseil syndical' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const membre = await conseilSyndicalService.getById(id)
            if (!membre) {
                return res.status(404).json({ error: 'Membre non trouvé' })
            }
            res.json({ data: membre })
        } catch (error) {
            logger.error(`[ConseilSyndicalController] Error getting membre ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le membre' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, coproprietaire_id, date_election } = req.body
            if (!copropriete_id || !coproprietaire_id || !date_election) {
                return res.status(400).json({ error: 'Les champs copropriete_id, coproprietaire_id et date_election sont obligatoires' })
            }
            const membre = await conseilSyndicalService.create(req.body)
            res.status(201).json({ data: membre, message: 'Membre du conseil syndical créé avec succès' })
        } catch (error) {
            logger.error(`[ConseilSyndicalController] Error creating membre: ${error.message}`)
            if (error.message?.includes('unique') || error.code === '23505') {
                return res.status(409).json({ error: 'Ce copropriétaire est déjà membre du conseil syndical' })
            }
            res.status(500).json({ error: 'Impossible de créer le membre' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const membre = await conseilSyndicalService.update(id, req.body)
            if (!membre) {
                return res.status(404).json({ error: 'Membre non trouvé' })
            }
            res.json({ data: membre, message: 'Membre du conseil syndical mis à jour avec succès' })
        } catch (error) {
            logger.error(`[ConseilSyndicalController] Error updating membre ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le membre' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await conseilSyndicalService.delete(id)
            if (!deleted) {
                return res.status(404).json({ error: 'Membre non trouvé' })
            }
            res.json({ message: 'Membre du conseil syndical supprimé avec succès' })
        } catch (error) {
            logger.error(`[ConseilSyndicalController] Error deleting membre ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le membre' })
        }
    }
}
