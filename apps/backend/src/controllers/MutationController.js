import { mutationService } from '../services/MutationService.js'
import logger from '../logger.js'

export class MutationController {
    static async getAllByLot(req, res) {
        try {
            const { lotId } = req.params
            const mutations = await mutationService.getAllByLot(lotId)
            res.json({ data: mutations })
        } catch (error) {
            logger.error(`[MutationController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les mutations' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const mutation = await mutationService.getById(id)
            if (!mutation) return res.status(404).json({ error: 'Mutation non trouvée' })
            res.json({ data: mutation })
        } catch (error) {
            logger.error(`[MutationController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer la mutation' })
        }
    }

    static async create(req, res) {
        try {
            const { lot_id, date_mutation } = req.body
            if (!lot_id || !date_mutation) {
                return res.status(400).json({ error: 'Les champs lot_id et date_mutation sont obligatoires' })
            }
            const result = await mutationService.create(req.body)
            res.status(201).json({ data: result, message: 'Mutation enregistrée avec succès' })
        } catch (error) {
            logger.error(`[MutationController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer la mutation' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await mutationService.update(id, req.body)
            res.json({ data: result, message: 'Mutation mise à jour avec succès' })
        } catch (error) {
            logger.error(`[MutationController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour la mutation' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            await mutationService.delete(id)
            res.json({ message: 'Mutation supprimée avec succès' })
        } catch (error) {
            logger.error(`[MutationController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la mutation' })
        }
    }
}
