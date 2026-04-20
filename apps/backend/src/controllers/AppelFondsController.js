import { appelFondsService } from '../services/AppelFondsService.js'
import logger from '../logger.js'

export class AppelFondsController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const appels = await appelFondsService.getAllByCopropriete(coproprieteId)
            res.json({ data: appels })
        } catch (error) {
            logger.error(`[AppelFondsController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les appels de fonds' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const appel = await appelFondsService.getById(id)
            if (!appel) return res.status(404).json({ error: 'Appel de fonds non trouvé' })
            res.json({ data: appel })
        } catch (error) {
            logger.error(`[AppelFondsController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer l\'appel de fonds' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, trimestre, annee, montant_total, date_emission, date_echeance } = req.body
            if (!copropriete_id || !trimestre || !annee || !montant_total || !date_emission || !date_echeance) {
                return res.status(400).json({ error: 'Les champs copropriete_id, trimestre, annee, montant_total, date_emission et date_echeance sont obligatoires' })
            }
            const result = await appelFondsService.create(req.body)
            res.status(201).json({ data: result, message: 'Appel de fonds créé avec succès' })
        } catch (error) {
            logger.error(`[AppelFondsController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer l\'appel de fonds' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await appelFondsService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Appel de fonds non trouvé' })
            res.json({ data: result, message: 'Appel de fonds mis à jour avec succès' })
        } catch (error) {
            logger.error(`[AppelFondsController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour l\'appel de fonds' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await appelFondsService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Appel de fonds non trouvé' })
            res.json({ message: 'Appel de fonds supprimé avec succès' })
        } catch (error) {
            logger.error(`[AppelFondsController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer l\'appel de fonds' })
        }
    }

    static async getLignes(req, res) {
        try {
            const { id } = req.params
            const lignes = await appelFondsService.getLignes(id)
            res.json({ data: lignes })
        } catch (error) {
            logger.error(`[AppelFondsController] Error getting lignes: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les lignes' })
        }
    }

    static async createLigne(req, res) {
        try {
            const { appel_fonds_id, lot_id, montant } = req.body
            if (!appel_fonds_id || !lot_id || !montant) {
                return res.status(400).json({ error: 'Les champs appel_fonds_id, lot_id et montant sont obligatoires' })
            }
            const result = await appelFondsService.createLigne(req.body)
            res.status(201).json({ data: result, message: 'Ligne d\'appel créée avec succès' })
        } catch (error) {
            logger.error(`[AppelFondsController] Error creating ligne: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer la ligne d\'appel' })
        }
    }

    static async updateLigne(req, res) {
        try {
            const { ligneId } = req.params
            const result = await appelFondsService.updateLigne(ligneId, req.body)
            if (!result) return res.status(404).json({ error: 'Ligne d\'appel non trouvée' })
            res.json({ data: result, message: 'Ligne d\'appel mise à jour avec succès' })
        } catch (error) {
            logger.error(`[AppelFondsController] Error updating ligne: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour la ligne d\'appel' })
        }
    }

    static async deleteLigne(req, res) {
        try {
            const { ligneId } = req.params
            const deleted = await appelFondsService.deleteLigne(ligneId)
            if (!deleted) return res.status(404).json({ error: 'Ligne d\'appel non trouvée' })
            res.json({ message: 'Ligne d\'appel supprimée avec succès' })
        } catch (error) {
            logger.error(`[AppelFondsController] Error deleting ligne: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la ligne d\'appel' })
        }
    }

    static async generateFromBudget(req, res) {
        try {
            const { budgetId } = req.params
            if (!budgetId) {
                return res.status(400).json({ error: 'Le paramètre budgetId est obligatoire' })
            }
            const appels = await appelFondsService.generateFromBudget(parseInt(budgetId))
            res.status(201).json({
                data: appels,
                message: `${appels.length} appel(s) de fonds généré(s) avec succès`,
            })
        } catch (error) {
            logger.error(`[AppelFondsController] Error generating from budget: ${error.message}`)
            res.status(500).json({ error: error.message || 'Impossible de générer les appels de fonds' })
        }
    }
}
