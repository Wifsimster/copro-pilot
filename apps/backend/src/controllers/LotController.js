import { lotService } from '../services/LotService.js'
import logger from '../logger.js'

export class LotController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const lots = await lotService.getAllByCopropriete(coproprieteId)
            res.json({ data: lots })
        } catch (error) {
            logger.error(`[LotController] Error getting lots: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les lots' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const lot = await lotService.getById(id)
            if (!lot) {
                return res.status(404).json({ error: 'Lot non trouvé' })
            }
            res.json({ data: lot })
        } catch (error) {
            logger.error(`[LotController] Error getting lot ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le lot' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, numero, tantiemes } = req.body
            if (!copropriete_id || !numero || tantiemes === undefined) {
                return res.status(400).json({ error: 'Les champs copropriete_id, numero et tantiemes sont obligatoires' })
            }
            const lot = await lotService.create(req.body)
            res.status(201).json({ data: lot, message: 'Lot créé avec succès' })
        } catch (error) {
            logger.error(`[LotController] Error creating lot: ${error.message}`)
            if (error.message?.includes('unique') || error.code === '23505') {
                return res.status(409).json({ error: 'Un lot avec ce numéro existe déjà dans cette copropriété' })
            }
            res.status(500).json({ error: 'Impossible de créer le lot' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const lot = await lotService.update(id, req.body)
            if (!lot) {
                return res.status(404).json({ error: 'Lot non trouvé' })
            }
            res.json({ data: lot, message: 'Lot mis à jour avec succès' })
        } catch (error) {
            logger.error(`[LotController] Error updating lot ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le lot' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await lotService.delete(id)
            if (!deleted) {
                return res.status(404).json({ error: 'Lot non trouvé' })
            }
            res.json({ message: 'Lot supprimé avec succès' })
        } catch (error) {
            logger.error(`[LotController] Error deleting lot ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le lot' })
        }
    }

    static async getClesRepartition(req, res) {
        try {
            const { id } = req.params
            const cles = await lotService.getClesRepartition(id)
            res.json({ data: cles })
        } catch (error) {
            logger.error(`[LotController] Error getting clés de répartition: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les clés de répartition' })
        }
    }
}
