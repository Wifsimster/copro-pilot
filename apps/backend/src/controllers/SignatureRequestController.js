import { signatureRequestService } from '../services/SignatureRequestService.js'
import { yousignService } from '../services/YousignService.js'
import logger from '../logger.js'

export class SignatureRequestController {
  static async requestSignature(req, res) {
    try {
      const { documentId, agId, signatories } = req.body

      if (!documentId) {
        return res
          .status(400)
          .json({ error: 'Le champ documentId est obligatoire' })
      }
      if (!Array.isArray(signatories) || signatories.length === 0) {
        return res
          .status(400)
          .json({ error: 'Au moins un signataire est requis' })
      }

      const result = await signatureRequestService.requestSignature({
        documentId,
        agId: agId || null,
        signatories,
        requestedBy: req.user && req.user.id,
      })

      res.status(201).json({
        data: result,
        message: 'Demande de signature créée avec succès',
      })
    } catch (error) {
      logger.error(
        `[SignatureRequestController] Error requesting signature: ${error.message}`
      )
      if (error.code === 'DOCUMENT_NOT_FOUND') {
        return res.status(404).json({ error: 'Document non trouvé' })
      }
      res.status(500).json({
        error: 'Impossible de créer la demande de signature',
      })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const { sync } = req.query
      const request = await signatureRequestService.getStatus(id, {
        sync: sync === 'true' || sync === '1',
      })
      if (!request) {
        return res
          .status(404)
          .json({ error: 'Demande de signature non trouvée' })
      }
      res.json({ data: request })
    } catch (error) {
      logger.error(
        `[SignatureRequestController] Error getting request: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible de récupérer la demande de signature' })
    }
  }

  static async getByDocument(req, res) {
    try {
      const { documentId } = req.params
      const requests = await signatureRequestService.getByDocument(documentId)
      res.json({ data: requests })
    } catch (error) {
      logger.error(
        `[SignatureRequestController] Error getting by document: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible de récupérer les demandes de signature',
      })
    }
  }

  static async cancel(req, res) {
    try {
      const { id } = req.params
      const result = await signatureRequestService.cancel(id)
      if (!result) {
        return res
          .status(404)
          .json({ error: 'Demande de signature non trouvée' })
      }
      res.json({
        data: result,
        message: 'Demande de signature annulée avec succès',
      })
    } catch (error) {
      logger.error(
        `[SignatureRequestController] Error cancelling: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible d\'annuler la demande de signature' })
    }
  }

  /**
   * Public endpoint hit by Yousign — must not require auth.
   * Verifies HMAC signature before dispatching to the service.
   */
  static async handleWebhook(req, res) {
    try {
      const signatureHeader =
        req.header('x-yousign-signature-256') ||
        req.header('X-Yousign-Signature-256')

      const rawBody =
        req.rawBody ||
        (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))

      const valid = yousignService.verifyWebhookSignature(
        rawBody,
        signatureHeader
      )
      if (!valid) {
        logger.warn(
          '[SignatureRequestController] Webhook rejected: invalid signature'
        )
        return res.status(401).json({ error: 'Signature invalide' })
      }

      const event =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body

      const result = await signatureRequestService.handleWebhook(event)
      res.json({ ok: true, ...result })
    } catch (error) {
      logger.error(
        `[SignatureRequestController] Error handling webhook: ${error.message}`
      )
      res.status(500).json({ error: 'Erreur lors du traitement du webhook' })
    }
  }
}
