import fs from 'fs'
import { documentService } from '../services/DocumentService.js'
import logger from '../logger.js'

export class DocumentController {
    static async getAllByCopropriete(req, res) {
        try {
            const { coproprieteId } = req.params
            const { categorie, entite_type, search } = req.query

            if (categorie || entite_type || search) {
                const documents = await documentService.getByFilters(coproprieteId, {
                    categorie,
                    entiteType: entite_type,
                    search,
                })
                return res.json({ data: documents })
            }

            const documents = await documentService.getAllByCopropriete(coproprieteId)
            res.json({ data: documents })
        } catch (error) {
            logger.error(`[DocumentController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les documents' })
        }
    }

    static async getAllByEntity(req, res) {
        try {
            const { entiteType, entiteId } = req.params
            const documents = await documentService.getAllByEntity(entiteType, entiteId)
            res.json({ data: documents })
        } catch (error) {
            logger.error(`[DocumentController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer les documents de cette entité' })
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params
            const document = await documentService.getById(id)
            if (!document) return res.status(404).json({ error: 'Document non trouvé' })
            res.json({ data: document })
        } catch (error) {
            logger.error(`[DocumentController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de récupérer le document' })
        }
    }

    static async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Aucun fichier fourni' })
            }

            const { copropriete_id, nom, categorie, entite_type, entite_id, description } = req.body

            if (!copropriete_id) {
                return res.status(400).json({ error: 'Le champ copropriete_id est obligatoire' })
            }

            const metadata = {
                copropriete_id,
                nom: nom || req.file.originalname,
                categorie,
                entite_type,
                entite_id,
                description,
            }

            const result = await documentService.upload(req.file, metadata)
            res.status(201).json({ data: result, message: 'Document uploadé avec succès' })
        } catch (error) {
            logger.error(`[DocumentController] Error uploading: ${error.message}`)
            res.status(500).json({ error: 'Impossible d\'uploader le document' })
        }
    }

    static async download(req, res) {
        try {
            const { id } = req.params
            const result = await documentService.download(id)

            if (!result) {
                return res.status(404).json({ error: 'Document non trouvé' })
            }

            const { document, filePath } = result

            // Check if physical file exists
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'Fichier introuvable sur le serveur' })
            }

            res.setHeader('Content-Type', document.mime_type || 'application/octet-stream')
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.fichier_nom)}"`)

            const fileStream = fs.createReadStream(filePath)
            fileStream.pipe(res)
        } catch (error) {
            logger.error(`[DocumentController] Error downloading: ${error.message}`)
            res.status(500).json({ error: 'Impossible de télécharger le document' })
        }
    }

    static async create(req, res) {
        try {
            const { copropriete_id, nom, fichier_nom, fichier_path } = req.body
            if (!copropriete_id || !nom || !fichier_nom || !fichier_path) {
                return res.status(400).json({ error: 'Les champs copropriete_id, nom, fichier_nom et fichier_path sont obligatoires' })
            }
            const result = await documentService.create(req.body)
            res.status(201).json({ data: result, message: 'Document créé avec succès' })
        } catch (error) {
            logger.error(`[DocumentController] Error creating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de créer le document' })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params
            const result = await documentService.update(id, req.body)
            if (!result) return res.status(404).json({ error: 'Document non trouvé' })
            res.json({ data: result, message: 'Document mis à jour avec succès' })
        } catch (error) {
            logger.error(`[DocumentController] Error updating: ${error.message}`)
            res.status(500).json({ error: 'Impossible de mettre à jour le document' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const deleted = await documentService.delete(id)
            if (!deleted) return res.status(404).json({ error: 'Document non trouvé' })
            res.json({ message: 'Document supprimé avec succès' })
        } catch (error) {
            logger.error(`[DocumentController] Error deleting: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer le document' })
        }
    }
}
