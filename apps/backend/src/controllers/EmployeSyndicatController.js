import { employeSyndicatService } from '../services/EmployeSyndicatService.js'
import logger from '../logger.js'

export class EmployeSyndicatController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const employes = await employeSyndicatService.getAllByCopropriete(coproprieteId)
            res.json({ data: employes })
        } catch (error) {
            logger.error(`[EmployeSyndicatController] Error getting employés: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les employés du syndicat' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const employe = await employeSyndicatService.getById(id)
            if (!employe) {
                return res.status(404).json({ error: 'Employé non trouvé' })
            }
            res.json({ data: employe })
        } catch (error) {
            logger.error(`[EmployeSyndicatController] Error getting employé ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer l\'employé' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, nom, prenom, poste, date_embauche } = req.body
            if (!copropriete_id || !nom || !prenom || !poste || !date_embauche) {
                return res.status(400).json({ error: 'Les champs copropriete_id, nom, prenom, poste et date_embauche sont obligatoires' })
            }
            const employe = await employeSyndicatService.create(req.body)
            res.status(201).json({ data: employe, message: 'Employé créé avec succès' })
        } catch (error) {
            logger.error(`[EmployeSyndicatController] Error creating employé: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer l\'employé' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const employe = await employeSyndicatService.update(id, req.body)
            if (!employe) {
                return res.status(404).json({ error: 'Employé non trouvé' })
            }
            res.json({ data: employe, message: 'Employé mis à jour avec succès' })
        } catch (error) {
            logger.error(`[EmployeSyndicatController] Error updating employé ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour l\'employé' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await employeSyndicatService.delete(id)
            if (!deleted) {
                return res.status(404).json({ error: 'Employé non trouvé' })
            }
            res.json({ message: 'Employé supprimé avec succès' })
        } catch (error) {
            logger.error(`[EmployeSyndicatController] Error deleting employé ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer l\'employé' })
        }
    }
}
