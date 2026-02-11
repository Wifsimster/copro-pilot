import fs from 'fs/promises'
import { DocumentModel } from '../models/Document.js'
import logger from '../logger.js'

class DocumentService {
    async getAllByCopropriete(coproprieteId) {
        try {
            return await DocumentModel.getAllByCopropriete(coproprieteId)
        } catch (error) {
            logger.error(`[DocumentService] Error getting documents: ${error.message}`)
            throw error
        }
    }

    async getAllByEntity(entiteType, entiteId) {
        try {
            return await DocumentModel.getAllByEntity(entiteType, entiteId)
        } catch (error) {
            logger.error(`[DocumentService] Error getting documents by entity: ${error.message}`)
            throw error
        }
    }

    async getByFilters(coproprieteId, filters) {
        try {
            return await DocumentModel.getByFilters(coproprieteId, filters)
        } catch (error) {
            logger.error(`[DocumentService] Error getting documents by filters: ${error.message}`)
            throw error
        }
    }

    async getById(id) {
        try {
            return await DocumentModel.getById(id)
        } catch (error) {
            logger.error(`[DocumentService] Error getting document ${id}: ${error.message}`)
            throw error
        }
    }

    async upload(file, metadata) {
        try {
            const data = {
                copropriete_id: metadata.copropriete_id,
                nom: metadata.nom || file.originalname,
                categorie: metadata.categorie || 'autre',
                fichier_nom: file.originalname,
                fichier_path: file.path,
                mime_type: file.mimetype,
                taille: file.size,
                description: metadata.description || null,
                entite_type: metadata.entite_type || null,
                entite_id: metadata.entite_id || null,
            }
            const result = await DocumentModel.create(data)
            logger.info(`[DocumentService] Document uploadé: ${result.nom} (ID: ${result.id})`)
            return result
        } catch (error) {
            // Clean up uploaded file on error
            if (file && file.path) {
                try {
                    await fs.unlink(file.path)
                } catch (unlinkError) {
                    logger.warn(`[DocumentService] Could not clean up file: ${unlinkError.message}`)
                }
            }
            logger.error(`[DocumentService] Error uploading document: ${error.message}`)
            throw error
        }
    }

    async download(id) {
        try {
            const document = await DocumentModel.getById(id)
            if (!document) return null
            return {
                document,
                filePath: document.fichier_path,
            }
        } catch (error) {
            logger.error(`[DocumentService] Error downloading document ${id}: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await DocumentModel.create(data)
            logger.info(`[DocumentService] Document créé: ${result.nom} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[DocumentService] Error creating document: ${error.message}`)
            throw error
        }
    }

    async update(id, data) {
        try {
            const existing = await DocumentModel.getById(id)
            if (!existing) return null
            const result = await DocumentModel.update(id, data)
            logger.info(`[DocumentService] Document mis à jour (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[DocumentService] Error updating document ${id}: ${error.message}`)
            throw error
        }
    }

    async delete(id) {
        try {
            const existing = await DocumentModel.getById(id)
            if (!existing) return null

            // Delete the physical file if it exists
            if (existing.fichier_path) {
                try {
                    await fs.unlink(existing.fichier_path)
                    logger.info(`[DocumentService] Fichier supprimé: ${existing.fichier_path}`)
                } catch (unlinkError) {
                    logger.warn(`[DocumentService] Could not delete file ${existing.fichier_path}: ${unlinkError.message}`)
                }
            }

            await DocumentModel.delete(id)
            logger.info(`[DocumentService] Document supprimé (ID: ${id})`)
            return existing
        } catch (error) {
            logger.error(`[DocumentService] Error deleting document ${id}: ${error.message}`)
            throw error
        }
    }
}

export const documentService = new DocumentService()
