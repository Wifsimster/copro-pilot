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

    async getById(id) {
        try {
            return await DocumentModel.getById(id)
        } catch (error) {
            logger.error(`[DocumentService] Error getting document ${id}: ${error.message}`)
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
