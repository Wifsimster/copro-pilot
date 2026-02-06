import { budgetService } from '../services/BudgetService.js'
import logger from '../logger.js'

export class BudgetController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const budgets = await budgetService.getAllByCopropriete(coproprieteId)
            res.json({ data: budgets })
        } catch (error) {
            logger.error(`[BudgetController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les budgets' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const budget = await budgetService.getById(id)
            if (!budget) return res.status(404).json({ error: 'Budget non trouvé' })
            res.json({ data: budget })
        } catch (error) {
            logger.error(`[BudgetController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le budget' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, annee } = req.body
            if (!copropriete_id || !annee) {
                return res.status(400).json({ error: 'Les champs copropriete_id et annee sont obligatoires' })
            }
            const result = await budgetService.create(req.body)
            res.status(201).json({ data: result, message: 'Budget créé avec succès' })
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Un budget existe déjà pour cette copropriété et cette année' })
            }
            logger.error(`[BudgetController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer le budget' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await budgetService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Budget non trouvé' })
            res.json({ data: result, message: 'Budget mis à jour avec succès' })
        } catch (error) {
            logger.error(`[BudgetController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le budget' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await budgetService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Budget non trouvé' })
            res.json({ message: 'Budget supprimé avec succès' })
        } catch (error) {
            logger.error(`[BudgetController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le budget' })
        }
    }

    // Postes de dépenses
    static async getPostes(req, res) {
        try {
            const { id } = req.params
            const postes = await budgetService.getPostes(id)
            res.json({ data: postes })
        } catch (error) {
            logger.error(`[BudgetController] Error getting postes: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les postes de dépenses' })
        }
    }

    static async createPoste(req, res) {
        try {
            const { budget_id, nom } = req.body
            if (!budget_id || !nom) {
                return res.status(400).json({ error: 'Les champs budget_id et nom sont obligatoires' })
            }
            const result = await budgetService.createPoste(req.body)
            res.status(201).json({ data: result, message: 'Poste de dépense créé avec succès' })
        } catch (error) {
            logger.error(`[BudgetController] Error creating poste: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer le poste de dépense' })
        }
    }

    static async updatePoste(req, res) {
        try {
            const { posteId } = req.params
            const result = await budgetService.updatePoste(posteId, req.body)
            res.json({ data: result, message: 'Poste de dépense mis à jour' })
        } catch (error) {
            logger.error(`[BudgetController] Error updating poste: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le poste' })
        }
    }

    static async deletePoste(req, res) {
        try {
            const { posteId } = req.params
            await budgetService.deletePoste(posteId)
            res.json({ message: 'Poste de dépense supprimé' })
        } catch (error) {
            logger.error(`[BudgetController] Error deleting poste: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le poste' })
        }
    }
}
