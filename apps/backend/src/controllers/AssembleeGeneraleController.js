import { assembleeGeneraleService } from '../services/AssembleeGeneraleService.js'
import { workflowEventService } from '../services/WorkflowEventService.js'
import logger from '../logger.js'

export class AssembleeGeneraleController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const assemblees = await assembleeGeneraleService.getAllByCopropriete(coproprieteId)
            res.json({ data: assemblees })
        } catch (error) {
            logger.error(`[AGController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les assemblées générales' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const ag = await assembleeGeneraleService.getById(id)
            if (!ag) return res.status(404).json({ error: 'Assemblée générale non trouvée' })
            res.json({ data: ag })
        } catch (error) {
            logger.error(`[AGController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer l\'assemblée générale' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, date } = req.body
            if (!copropriete_id || !date) {
                return res.status(400).json({ error: 'Les champs copropriete_id et date sont obligatoires' })
            }
            const result = await assembleeGeneraleService.create(req.body)
            res.status(201).json({ data: result, message: 'Assemblée générale créée avec succès' })
        } catch (error) {
            logger.error(`[AGController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer l\'assemblée générale' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await assembleeGeneraleService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Assemblée générale non trouvée' })
            res.json({ data: result, message: 'Assemblée générale mise à jour avec succès' })
            if (result.statut === 'terminee') {
                workflowEventService.onAssembleeTerminee(result).catch(() => {})
            }
        } catch (error) {
            logger.error(`[AGController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour l\'assemblée générale' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await assembleeGeneraleService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Assemblée générale non trouvée' })
            res.json({ message: 'Assemblée générale supprimée avec succès' })
        } catch (error) {
            logger.error(`[AGController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer l\'assemblée générale' })
        }
    }

    // Résolutions
    static async getResolutions(req, res) {
        try {
            const { id } = req.params
            const resolutions = await assembleeGeneraleService.getResolutions(id)
            res.json({ data: resolutions })
        } catch (error) {
            logger.error(`[AGController] Error getting résolutions: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les résolutions' })
        }
    }

    static async createResolution(req, res) {
        try {
            const { ag_id, numero, titre } = req.body
            if (!ag_id || !numero || !titre) {
                return res.status(400).json({ error: 'Les champs ag_id, numero et titre sont obligatoires' })
            }
            const result = await assembleeGeneraleService.createResolution(req.body)
            res.status(201).json({ data: result, message: 'Résolution créée avec succès' })
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Ce numéro de résolution existe déjà pour cette AG' })
            }
            logger.error(`[AGController] Error creating résolution: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer la résolution' })
        }
    }

    static async updateResolution(req, res) {
        try {
            const { resolutionId } = req.params
            const result = await assembleeGeneraleService.updateResolution(resolutionId, req.body)
            res.json({ data: result, message: 'Résolution mise à jour' })
        } catch (error) {
            logger.error(`[AGController] Error updating résolution: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour la résolution' })
        }
    }

    static async deleteResolution(req, res) {
        try {
            const { resolutionId } = req.params
            await assembleeGeneraleService.deleteResolution(resolutionId)
            res.json({ message: 'Résolution supprimée' })
        } catch (error) {
            logger.error(`[AGController] Error deleting résolution: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la résolution' })
        }
    }

    // Présences
    static async getPresences(req, res) {
        try {
            const { id } = req.params
            const presences = await assembleeGeneraleService.getPresences(id)
            res.json({ data: presences })
        } catch (error) {
            logger.error(`[AGController] Error getting présences: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les présences' })
        }
    }

    static async setPresence(req, res) {
        try {
            const { ag_id, coproprietaire_id, statut } = req.body
            if (!ag_id || !coproprietaire_id || !statut) {
                return res.status(400).json({ error: 'Les champs ag_id, coproprietaire_id et statut sont obligatoires' })
            }
            const result = await assembleeGeneraleService.setPresence(req.body)
            res.json({ data: result, message: 'Présence enregistrée' })
        } catch (error) {
            logger.error(`[AGController] Error setting présence: ${error.message}`)
            res.status(500).json({ error: 'Impossible d\'enregistrer la présence' })
        }
    }

    static async deletePresence(req, res) {
        try {
            const { presenceId } = req.params
            await assembleeGeneraleService.deletePresence(presenceId)
            res.json({ message: 'Présence supprimée avec succès' })
        } catch (error) {
            logger.error(`[AGController] Error deleting présence: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la présence' })
        }
    }

    // Génération PV
    static async genererPv(req, res) {
        try {
            const { id } = req.params
            const pdfDoc = await assembleeGeneraleService.genererPv(id)
            if (!pdfDoc) return res.status(404).json({ error: 'Assemblée générale non trouvée' })

            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', `attachment; filename="pv-ag-${id}.pdf"`)
            pdfDoc.pipe(res)
        } catch (error) {
            logger.error(`[AGController] Error generating PV: ${error.message}`)
            res.status(500).json({ error: 'Impossible de générer le procès-verbal' })
        }
    }
}
