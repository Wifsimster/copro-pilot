import { cleRepartitionService } from '../services/CleRepartitionService.js'
import logger from '../logger.js'

export class CleRepartitionController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const cles = await cleRepartitionService.getAllByCopropriete(coproprieteId)
            res.json({ data: cles })
        } catch (error) {
            logger.error(`[CleRepartitionController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les clés de répartition' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const cle = await cleRepartitionService.getById(id)
            if (!cle) return res.status(404).json({ error: 'Clé de répartition non trouvée' })
            res.json({ data: cle })
        } catch (error) {
            logger.error(`[CleRepartitionController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer la clé de répartition' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, nom } = req.body
            if (!copropriete_id || !nom) {
                return res.status(400).json({ error: 'Les champs copropriete_id et nom sont obligatoires' })
            }
            const result = await cleRepartitionService.create(req.body)
            res.status(201).json({ data: result, message: 'Clé de répartition créée avec succès' })
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Cette clé de répartition existe déjà pour cette copropriété' })
            }
            logger.error(`[CleRepartitionController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer la clé de répartition' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await cleRepartitionService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Clé de répartition non trouvée' })
            res.json({ data: result, message: 'Clé de répartition mise à jour avec succès' })
        } catch (error) {
            logger.error(`[CleRepartitionController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour la clé de répartition' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await cleRepartitionService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Clé de répartition non trouvée' })
            res.json({ message: 'Clé de répartition supprimée avec succès' })
        } catch (error) {
            logger.error(`[CleRepartitionController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la clé de répartition' })
        }
    }

    static async setLotQuotePart(req, res) {
        try {
            const { lotId, cleId } = req.params
            const { quote_part } = req.body
            if (quote_part === undefined || quote_part === null) {
                return res.status(400).json({ error: 'Le champ quote_part est obligatoire' })
            }
            const result = await cleRepartitionService.setLotQuotePart(lotId, cleId, quote_part)
            res.json({ data: result, message: 'Quote-part mise à jour' })
        } catch (error) {
            logger.error(`[CleRepartitionController] Error setting quote-part: ${error.message}`)
            res.status(500).json({ error: 'Impossible de définir la quote-part' })
        }
    }

    static async removeLotQuotePart(req, res) {
        try {
            const { lotId, cleId } = req.params
            await cleRepartitionService.removeLotQuotePart(lotId, cleId)
            res.json({ message: 'Quote-part supprimée' })
        } catch (error) {
            logger.error(`[CleRepartitionController] Error removing quote-part: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la quote-part' })
        }
    }
}
