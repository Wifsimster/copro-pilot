import { declarationRegistreService } from '../services/DeclarationRegistreService.js'
import logger from '../logger.js'

export class DeclarationRegistreController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const declarations = await declarationRegistreService.getAllByCopropriete(coproprieteId)
            res.json({ data: declarations })
        } catch (error) {
            logger.error(`[DeclarationRegistreController] Error getting declarations: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les déclarations' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const declaration = await declarationRegistreService.getById(id)
            if (!declaration) {
                return res.status(404).json({ error: 'Déclaration non trouvée' })
            }
            res.json({ data: declaration })
        } catch (error) {
            logger.error(`[DeclarationRegistreController] Error getting declaration ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer la déclaration' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, annee } = req.body
            if (!copropriete_id || !annee) {
                return res.status(400).json({ error: 'Les champs copropriete_id et annee sont obligatoires' })
            }
            const declaration = await declarationRegistreService.create(req.body)
            res.status(201).json({ data: declaration, message: 'Déclaration créée avec succès' })
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Une déclaration existe déjà pour cette copropriété et cette année' })
            }
            logger.error(`[DeclarationRegistreController] Error creating declaration: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer la déclaration' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const declaration = await declarationRegistreService.update(id, req.body)
            if (!declaration) {
                return res.status(404).json({ error: 'Déclaration non trouvée' })
            }
            res.json({ data: declaration, message: 'Déclaration mise à jour avec succès' })
        } catch (error) {
            logger.error(`[DeclarationRegistreController] Error updating declaration ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour la déclaration' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await declarationRegistreService.delete(id)
            if (!deleted) {
                return res.status(404).json({ error: 'Déclaration non trouvée' })
            }
            res.json({ message: 'Déclaration supprimée avec succès' })
        } catch (error) {
            logger.error(`[DeclarationRegistreController] Error deleting declaration ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la déclaration' })
        }
    }

    static async preparerDonnees(req, res) {
        try {
            const { coproprieteId, annee } = req.params
            const donnees = await declarationRegistreService.preparerDonnees(coproprieteId, parseInt(annee))
            if (!donnees) {
                return res.status(404).json({ error: 'Copropriété non trouvée' })
            }
            res.json({ data: donnees })
        } catch (error) {
            logger.error(`[DeclarationRegistreController] Error preparing data: ${error.message}`)
            res.status(500).json({ error: 'Impossible de préparer les données' })
        }
    }
}
