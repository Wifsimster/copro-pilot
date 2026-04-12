import { convocationAGService } from '../services/ConvocationAGService.js'
import logger from '../logger.js'

export class ConvocationAGController {
    static async getByAgId(req, res) {
        try {
            const { agId } = req.params
            const convocations = await convocationAGService.getByAgId(agId)
            res.json({ data: convocations })
        } catch (error) {
            logger.error(`[ConvocationController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les convocations' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const convocation = await convocationAGService.getById(id)
            if (!convocation) return res.status(404).json({ error: 'Convocation non trouvée' })
            res.json({ data: convocation })
        } catch (error) {
            logger.error(`[ConvocationController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer la convocation' })
        }
    }

    static async create(req, res) {
        try {
            const { ag_id } = req.body
            if (!ag_id) {
                return res.status(400).json({ error: 'Le champ ag_id est obligatoire' })
            }
            const result = await convocationAGService.create(req.body)
            res.status(201).json({ data: result, message: 'Convocation créée avec succès' })
        } catch (error) {
            logger.error(`[ConvocationController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer la convocation' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await convocationAGService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Convocation non trouvée' })
            res.json({ data: result, message: 'Convocation mise à jour avec succès' })
        } catch (error) {
            logger.error(`[ConvocationController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour la convocation' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await convocationAGService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Convocation non trouvée' })
            res.json({ message: 'Convocation supprimée avec succès' })
        } catch (error) {
            logger.error(`[ConvocationController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la convocation' })
        }
    }

    // Destinataires
    static async getDestinataires(req, res) {
        try {
            const { id } = req.params
            const destinataires = await convocationAGService.getDestinataires(id)
            res.json({ data: destinataires })
        } catch (error) {
            logger.error(`[ConvocationController] Error getting destinataires: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les destinataires' })
        }
    }

    static async addDestinataire(req, res) {
        try {
            const { convocation_id, coproprietaire_id } = req.body
            if (!convocation_id || !coproprietaire_id) {
                return res.status(400).json({ error: 'Les champs convocation_id et coproprietaire_id sont obligatoires' })
            }
            const result = await convocationAGService.addDestinataire(req.body)
            res.status(201).json({ data: result, message: 'Destinataire ajouté' })
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Ce destinataire existe déjà pour cette convocation' })
            }
            logger.error(`[ConvocationController] Error adding destinataire: ${error.message}`)
            res.status(500).json({ error: 'Impossible d\'ajouter le destinataire' })
        }
    }

    static async updateDestinataire(req, res) {
        try {
            const { destId } = req.params
            const result = await convocationAGService.updateDestinataire(destId, req.body)
            if (!result) return res.status(404).json({ error: 'Destinataire non trouvé' })
            res.json({ data: result, message: 'Destinataire mis à jour' })
        } catch (error) {
            logger.error(`[ConvocationController] Error updating destinataire: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le destinataire' })
        }
    }

    static async deleteDestinataire(req, res) {
        try {
            const { destId } = req.params
            await convocationAGService.deleteDestinataire(destId)
            res.json({ message: 'Destinataire supprimé' })
        } catch (error) {
            logger.error(`[ConvocationController] Error deleting destinataire: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le destinataire' })
        }
    }

    // Generate destinataires from copropriete
    static async genererDestinataires(req, res) {
        try {
            const { id } = req.params
            const result = await convocationAGService.genererDestinataires(id)
            if (result === null) return res.status(404).json({ error: 'Convocation ou AG non trouvée' })
            res.json({ data: result, message: `${result.length} destinataires générés` })
        } catch (error) {
            logger.error(`[ConvocationController] Error generating destinataires: ${error.message}`)
            res.status(500).json({ error: 'Impossible de générer les destinataires' })
        }
    }

    // Send convocation (update statuses)
    static async envoyer(req, res) {
        try {
            const { id } = req.params
            const result = await convocationAGService.envoyerConvocation(id)
            if (!result) return res.status(404).json({ error: 'Convocation non trouvée' })
            res.json({ data: result, message: 'Convocation envoyée avec succès' })
        } catch (error) {
            logger.error(`[ConvocationController] Error sending convocation: ${error.message}`)
            res.status(500).json({ error: 'Impossible d\'envoyer la convocation' })
        }
    }

    // Verify 21-day delay
    static async verifierDelai(req, res) {
        try {
            const { agId } = req.params
            const result = await convocationAGService.verifierDelai(agId)
            res.json({ data: result })
        } catch (error) {
            logger.error(`[ConvocationController] Error verifying delay: ${error.message}`)
            res.status(500).json({ error: 'Impossible de vérifier le délai' })
        }
    }
}
