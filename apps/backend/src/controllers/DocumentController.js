import { documentService } from '../services/DocumentService.js'
import logger from '../logger.js'

export class DocumentController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const documents = await documentService.getAllByCopropriete(coproprieteId)
            res.json({ data: documents })
        } catch (error) {
            logger.error(`[DocumentController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les documents' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const document = await documentService.getById(id)
            if (!document) return res.status(404).json({ error: 'Document non trouvé' })
            res.json({ data: document })
        } catch (error) {
            logger.error(`[DocumentController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le document' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, nom, fichier_nom, fichier_path } = req.body
            if (!copropriete_id || !nom || !fichier_nom || !fichier_path) {
                return res.status(400).json({ error: 'Les champs copropriete_id, nom, fichier_nom et fichier_path sont obligatoires' })
            }
            const result = await documentService.create(req.body)
            res.status(201).json({ data: result, message: 'Document créé avec succès' })
        } catch (error) {
            logger.error(`[DocumentController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer le document' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await documentService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Document non trouvé' })
            res.json({ data: result, message: 'Document mis à jour avec succès' })
        } catch (error) {
            logger.error(`[DocumentController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le document' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await documentService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Document non trouvé' })
            res.json({ message: 'Document supprimé avec succès' })
        } catch (error) {
            logger.error(`[DocumentController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le document' })
        }
    }
}
