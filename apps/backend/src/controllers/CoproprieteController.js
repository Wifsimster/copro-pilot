import { coproprieteService } from '../services/CoproprieteService.js'
import { CoproprieteModel } from '../models/Copropriete.js'
import { parsePaginationParams, paginatedResponse } from '../utils/pagination.js'
import logger from '../logger.js'

export class CoproprieteController {
    static async getAll(req, res) {
        try {
            const { page, limit, sortBy, sortOrder } = req.query
            if (page || limit || sortBy || sortOrder) {
                const params = parsePaginationParams(req.query)
                const { data, total } = await CoproprieteModel.getAllPaginated(params)
                return res.json(paginatedResponse(data, total, params))
            }
            const coproprietes = await coproprieteService.getAll()
            res.json({ data: coproprietes })
        } catch (error) {
            logger.error(`[CoproprieteController] Error getting copropriétés: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les copropriétés' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const copropriete = await coproprieteService.getById(id)
            if (!copropriete) {
                return res.status(404).json({ error: 'Copropriété non trouvée' })
            }
            res.json({ data: copropriete })
        } catch (error) {
            logger.error(`[CoproprieteController] Error getting copropriété ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer la copropriété' })
        }
    }

    static async create(req, res) {
        try {
            const { nom, adresse, code_postal, ville } = req.body
            if (!nom || !adresse || !code_postal || !ville) {
                return res.status(400).json({ error: 'Les champs nom, adresse, code_postal et ville sont obligatoires' })
            }
            const copropriete = await coproprieteService.create(req.body)
            res.status(201).json({ data: copropriete, message: 'Copropriété créée avec succès' })
        } catch (error) {
            logger.error(`[CoproprieteController] Error creating copropriété: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer la copropriété' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const copropriete = await coproprieteService.update(id, req.body)
            if (!copropriete) {
                return res.status(404).json({ error: 'Copropriété non trouvée' })
            }
            res.json({ data: copropriete, message: 'Copropriété mise à jour avec succès' })
        } catch (error) {
            logger.error(`[CoproprieteController] Error updating copropriété ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour la copropriété' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await coproprieteService.delete(id)
            if (!deleted) {
                return res.status(404).json({ error: 'Copropriété non trouvée' })
            }
            res.json({ message: 'Copropriété supprimée avec succès' })
        } catch (error) {
            logger.error(`[CoproprieteController] Error deleting copropriété ${req.params.id}: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la copropriété' })
        }
    }
}
