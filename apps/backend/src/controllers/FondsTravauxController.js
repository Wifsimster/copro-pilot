import { fondsTravauxService } from '../services/FondsTravauxService.js'
import logger from '../logger.js'

export class FondsTravauxController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const fonds = await fondsTravauxService.getAllByCopropriete(coproprieteId)
            res.json({ data: fonds })
        } catch (error) {
            logger.error(`[FondsTravauxController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les fonds de travaux' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const fonds = await fondsTravauxService.getById(id)
            if (!fonds) return res.status(404).json({ error: 'Fonds de travaux non trouvé' })
            res.json({ data: fonds })
        } catch (error) {
            logger.error(`[FondsTravauxController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le fonds de travaux' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, annee } = req.body
            if (!copropriete_id || !annee) {
                return res.status(400).json({ error: 'Les champs copropriete_id et annee sont obligatoires' })
            }
            const result = await fondsTravauxService.create(req.body)
            res.status(201).json({ data: result, message: 'Fonds de travaux créé avec succès' })
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Un fonds de travaux existe déjà pour cette copropriété et cette année' })
            }
            logger.error(`[FondsTravauxController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer le fonds de travaux' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await fondsTravauxService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Fonds de travaux non trouvé' })
            res.json({ data: result, message: 'Fonds de travaux mis à jour avec succès' })
        } catch (error) {
            logger.error(`[FondsTravauxController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le fonds de travaux' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await fondsTravauxService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Fonds de travaux non trouvé' })
            res.json({ message: 'Fonds de travaux supprimé avec succès' })
        } catch (error) {
            logger.error(`[FondsTravauxController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le fonds de travaux' })
        }
    }
}
