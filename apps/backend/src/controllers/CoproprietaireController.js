import { coproprietaireService } from '../services/CoproprietaireService.js'
import { CoproprietaireModel } from '../models/Coproprietaire.js'
import { parsePaginationParams, paginatedResponse } from '../utils/pagination.js'
import logger from '../logger.js'

export class CoproprietaireController {
    static async getAll(req, res) {
        try {
            const { page, limit, sortBy, sortOrder, copropriete_id } = req.query
            if ((page || limit || sortBy || sortOrder) && copropriete_id) {
                const params = parsePaginationParams(req.query)
                const { data, total } = await CoproprietaireModel.getAllByCoproprietePaginated(copropriete_id, params)
                return res.json(paginatedResponse(data, total, params))
            }
            const coproprietaires = await coproprietaireService.getAll()
            res.json({ data: coproprietaires })
        } catch (error) {
            logger.error(`[CoproprietaireController] Error getting copropriétaires: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les copropriétaires' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const coproprietaire = await coproprietaireService.getById(id)
            if (!coproprietaire) {
                return res.status(404).json({ error: 'Copropriétaire non trouvé' })
            }
            res.json({ data: coproprietaire })
        } catch (error) {
            logger.error(`[CoproprietaireController] Error getting copropriétaire ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le copropriétaire' })
        }
    }

    static async create(req, res) {
        try {
            const { nom, prenom } = req.body
            if (!nom || !prenom) {
                return res.status(400).json({ error: 'Les champs nom et prenom sont obligatoires' })
            }
            const coproprietaire = await coproprietaireService.create(req.body)
            res.status(201).json({ data: coproprietaire, message: 'Copropriétaire créé avec succès' })
        } catch (error) {
            logger.error(`[CoproprietaireController] Error creating copropriétaire: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer le copropriétaire' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const coproprietaire = await coproprietaireService.update(id, req.body)
            if (!coproprietaire) {
                return res.status(404).json({ error: 'Copropriétaire non trouvé' })
            }
            res.json({ data: coproprietaire, message: 'Copropriétaire mis à jour avec succès' })
        } catch (error) {
            logger.error(`[CoproprietaireController] Error updating copropriétaire ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le copropriétaire' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await coproprietaireService.delete(id)
            if (!deleted) {
                return res.status(404).json({ error: 'Copropriétaire non trouvé' })
            }
            res.json({ message: 'Copropriétaire supprimé avec succès' })
        } catch (error) {
            logger.error(`[CoproprietaireController] Error deleting copropriétaire ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le copropriétaire' })
        }
    }

    static async search(req, res) {
        try {
            const { q } = req.query
            if (!q || q.length < 2) {
                return res.status(400).json({ error: 'Le paramètre de recherche doit contenir au moins 2 caractères' })
            }
            const results = await coproprietaireService.search(q)
            res.json({ data: results })
        } catch (error) {
            logger.error(`[CoproprietaireController] Error searching copropriétaires: ${error.message}`)
            res.status(500).json({ error: 'Impossible de rechercher les copropriétaires' })
        }
    }
}
