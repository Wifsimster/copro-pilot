import { paiementService } from '../services/PaiementService.js'
import logger from '../logger.js'

export class PaiementController {
    static async getAllByCoproprietaire(req, res) {
        try {
            const { coproprietaireId } = req.params
            const paiements = await paiementService.getAllByCoproprietaire(coproprietaireId)
            res.json({ data: paiements })
        } catch (error) {
            logger.error(`[PaiementController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les paiements' })
        }
    }

    static async getAllByAppelFonds(req, res) {
        try {
            const { appelFondsId } = req.params
            const paiements = await paiementService.getAllByAppelFonds(appelFondsId)
            res.json({ data: paiements })
        } catch (error) {
            logger.error(`[PaiementController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les paiements' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const paiement = await paiementService.getById(id)
            if (!paiement) return res.status(404).json({ error: 'Paiement non trouvé' })
            res.json({ data: paiement })
        } catch (error) {
            logger.error(`[PaiementController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le paiement' })
        }
    }

    static async create(req, res) {
        try {
            const { coproprietaire_id, montant, date_paiement } = req.body
            if (!coproprietaire_id || !montant || !date_paiement) {
                return res.status(400).json({ error: 'Les champs coproprietaire_id, montant et date_paiement sont obligatoires' })
            }
            const result = await paiementService.create(req.body)
            res.status(201).json({ data: result, message: 'Paiement enregistré avec succès' })
        } catch (error) {
            logger.error(`[PaiementController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible d\'enregistrer le paiement' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await paiementService.update(id, req.body)
            res.json({ data: result, message: 'Paiement mis à jour avec succès' })
        } catch (error) {
            logger.error(`[PaiementController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le paiement' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await paiementService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Paiement non trouvé' })
            res.json({ message: 'Paiement supprimé avec succès' })
        } catch (error) {
            logger.error(`[PaiementController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le paiement' })
        }
    }

    static async getSoldeCoproprietaire(req, res) {
        try {
            const { coproprietaireId } = req.params
            const solde = await paiementService.getSoldeCoproprietaire(coproprietaireId)
            res.json({ data: solde })
        } catch (error) {
            logger.error(`[PaiementController] Error getting solde: ${error.message}`)
            res.status(500).json({ error: 'Impossible de calculer le solde' })
        }
    }
}
