import { diagnosticService } from '../services/DiagnosticService.js'
import logger from '../logger.js'

export class DiagnosticController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const diagnostics = await diagnosticService.getAllByCopropriete(coproprieteId)
            res.json({ data: diagnostics })
        } catch (error) {
            logger.error(`[DiagnosticController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de recuperer les diagnostics' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const diagnostic = await diagnosticService.getById(id)
            if (!diagnostic) return res.status(404).json({ error: 'Diagnostic non trouve' })
            res.json({ data: diagnostic })
        } catch (error) {
            logger.error(`[DiagnosticController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de recuperer le diagnostic' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, type, date_realisation } = req.body
            if (!copropriete_id || !type || !date_realisation) {
                return res.status(400).json({ error: 'Les champs copropriete_id, type et date_realisation sont obligatoires' })
            }
            const result = await diagnosticService.create(req.body)
            res.status(201).json({ data: result, message: 'Diagnostic cree avec succes' })
        } catch (error) {
            logger.error(`[DiagnosticController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de creer le diagnostic' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await diagnosticService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Diagnostic non trouve' })
            res.json({ data: result, message: 'Diagnostic mis a jour avec succes' })
        } catch (error) {
            logger.error(`[DiagnosticController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre a jour le diagnostic' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await diagnosticService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Diagnostic non trouve' })
            res.json({ message: 'Diagnostic supprime avec succes' })
        } catch (error) {
            logger.error(`[DiagnosticController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le diagnostic' })
        }
    }
}
