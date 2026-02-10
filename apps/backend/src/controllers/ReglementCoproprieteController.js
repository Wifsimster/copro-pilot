import { reglementCoproprieteService, articleReglementService } from '../services/ReglementCoproprieteService.js'
import logger from '../logger.js'

export class ReglementCoproprieteController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const reglements = await reglementCoproprieteService.getAllByCopropriete(coproprieteId)
            res.json({ data: reglements })
        } catch (error) {
            logger.error(`[ReglementCoproprieteController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les règlements de copropriété' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const reglement = await reglementCoproprieteService.getById(id)
            if (!reglement) return res.status(404).json({ error: 'Règlement de copropriété non trouvé' })
            res.json({ data: reglement })
        } catch (error) {
            logger.error(`[ReglementCoproprieteController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le règlement de copropriété' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, date_etablissement } = req.body
            if (!copropriete_id || !date_etablissement) {
                return res.status(400).json({ error: 'Les champs copropriete_id et date_etablissement sont obligatoires' })
            }
            const result = await reglementCoproprieteService.create(req.body)
            res.status(201).json({ data: result, message: 'Règlement de copropriété créé avec succès' })
        } catch (error) {
            logger.error(`[ReglementCoproprieteController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer le règlement de copropriété' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await reglementCoproprieteService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Règlement de copropriété non trouvé' })
            res.json({ data: result, message: 'Règlement de copropriété mis à jour avec succès' })
        } catch (error) {
            logger.error(`[ReglementCoproprieteController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le règlement de copropriété' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await reglementCoproprieteService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Règlement de copropriété non trouvé' })
            res.json({ message: 'Règlement de copropriété supprimé avec succès' })
        } catch (error) {
            logger.error(`[ReglementCoproprieteController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le règlement de copropriété' })
        }
    }
}

export class ArticleReglementController {
    static async getAllByReglement(req, res) {
        try {
            const { reglementId } = req.params
            const articles = await articleReglementService.getAllByReglement(reglementId)
            res.json({ data: articles })
        } catch (error) {
            logger.error(`[ArticleReglementController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les articles du règlement' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const article = await articleReglementService.getById(id)
            if (!article) return res.status(404).json({ error: 'Article non trouvé' })
            res.json({ data: article })
        } catch (error) {
            logger.error(`[ArticleReglementController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer l\'article' })
        }
    }

    static async create(req, res) {
        try {
            const { reglement_id, numero, titre } = req.body
            if (!reglement_id || !numero || !titre) {
                return res.status(400).json({ error: 'Les champs reglement_id, numero et titre sont obligatoires' })
            }
            const result = await articleReglementService.create(req.body)
            res.status(201).json({ data: result, message: 'Article créé avec succès' })
        } catch (error) {
            logger.error(`[ArticleReglementController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer l\'article' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await articleReglementService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Article non trouvé' })
            res.json({ data: result, message: 'Article mis à jour avec succès' })
        } catch (error) {
            logger.error(`[ArticleReglementController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour l\'article' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await articleReglementService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Article non trouvé' })
            res.json({ message: 'Article supprimé avec succès' })
        } catch (error) {
            logger.error(`[ArticleReglementController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer l\'article' })
        }
    }
}
