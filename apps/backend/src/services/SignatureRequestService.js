import { SignatureRequestModel } from '../models/SignatureRequest.js'
import { DocumentModel } from '../models/Document.js'
import { yousignService } from './YousignService.js'
import logger from '../logger.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Map a Yousign webhook event name to our internal signatory statut.
 */
function mapEventToSignatoryStatut(eventName) {
  switch (eventName) {
    case 'signer.done':
    case 'signature.done':
      return 'signed'
    case 'signer.declined':
    case 'signature.refused':
      return 'refused'
    case 'signer.expired':
    case 'signature.expired':
      return 'expired'
    default:
      return null
  }
}

class SignatureRequestService {
  /**
   * Request a signature for a document.
   *
   * Flow:
   *  1. Fetch the document
   *  2. Validate signatory emails
   *  3. Call Yousign to create the signature request
   *  4. Persist the signature_request row and its signatories
   *  5. Return the fully hydrated request
   */
  async requestSignature({ documentId, agId, signatories, requestedBy }) {
    try {
      if (!documentId) {
        throw new Error('documentId est obligatoire')
      }
      if (!Array.isArray(signatories) || signatories.length === 0) {
        throw new Error('Au moins un signataire est requis')
      }

      const document = await DocumentModel.getById(documentId)
      if (!document) {
        const err = new Error('Document non trouvé')
        err.code = 'DOCUMENT_NOT_FOUND'
        throw err
      }

      // Validate signatories
      for (const s of signatories) {
        if (!s || !s.email || !EMAIL_REGEX.test(s.email)) {
          throw new Error(`Email invalide pour un signataire: ${s && s.email}`)
        }
        if (!s.nom || !s.prenom) {
          throw new Error(
            `Nom et prénom obligatoires pour le signataire ${s.email}`
          )
        }
      }

      // 1. Call provider
      const providerResponse = await yousignService.createSignatureRequest({
        documentPath: document.fichier_path,
        signatories,
        metadata: {
          document_id: document.id,
          ag_id: agId || null,
          external_id: `doc-${document.id}`,
        },
      })

      // 2. Persist the request
      const created = await SignatureRequestModel.create({
        document_id: document.id,
        ag_id: agId || null,
        provider: 'yousign',
        provider_request_id: providerResponse.id,
        statut: 'pending',
        requested_by: requestedBy || null,
      })

      // 3. Persist signatories — match provider signatories by email
      //    (falling back to positional order if email not echoed back).
      const providerSignersByEmail = new Map(
        (providerResponse.signatories || []).map(p => [p.email, p])
      )

      for (let i = 0; i < signatories.length; i++) {
        const s = signatories[i]
        const providerSigner =
          providerSignersByEmail.get(s.email) ||
          (providerResponse.signatories || [])[i] ||
          {}
        await SignatureRequestModel.addSignatory(created.id, {
          coproprietaire_id: s.coproprietaire_id || null,
          email: s.email,
          nom: s.nom,
          prenom: s.prenom,
          signature_url: providerSigner.url || null,
        })
      }

      logger.info(
        `[SignatureRequestService] Signature request created: id=${created.id} provider_id=${providerResponse.id}`
      )

      return await SignatureRequestModel.getById(created.id)
    } catch (error) {
      logger.error(
        `[SignatureRequestService] requestSignature failed: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Fetch a signature request by id. If a provider request id is
   * present, optionally refresh the status from Yousign.
   */
  async getStatus(id, { sync = false } = {}) {
    try {
      const request = await SignatureRequestModel.getById(id)
      if (!request) return null

      if (sync && request.provider_request_id) {
        try {
          const remote = await yousignService.getSignatureRequest(
            request.provider_request_id
          )
          if (remote && remote.status && remote.status !== request.statut) {
            // Yousign statuses are mapped into our internal enum
            const mapped = this._mapProviderStatus(remote.status)
            if (mapped) {
              await SignatureRequestModel.update(id, { statut: mapped })
              return await SignatureRequestModel.getById(id)
            }
          }
        } catch (syncError) {
          logger.warn(
            `[SignatureRequestService] Unable to sync status from provider: ${syncError.message}`
          )
        }
      }

      return request
    } catch (error) {
      logger.error(
        `[SignatureRequestService] getStatus(${id}) failed: ${error.message}`
      )
      throw error
    }
  }

  async getByDocument(documentId) {
    try {
      return await SignatureRequestModel.getByDocument(documentId)
    } catch (error) {
      logger.error(
        `[SignatureRequestService] getByDocument(${documentId}) failed: ${error.message}`
      )
      throw error
    }
  }

  async getByAg(agId) {
    try {
      return await SignatureRequestModel.getByAg(agId)
    } catch (error) {
      logger.error(
        `[SignatureRequestService] getByAg(${agId}) failed: ${error.message}`
      )
      throw error
    }
  }

  async cancel(id) {
    try {
      const request = await SignatureRequestModel.getById(id)
      if (!request) return null

      if (request.provider_request_id) {
        try {
          await yousignService.cancelSignatureRequest(
            request.provider_request_id
          )
        } catch (cancelError) {
          logger.warn(
            `[SignatureRequestService] Provider cancel failed: ${cancelError.message}`
          )
        }
      }

      await SignatureRequestModel.update(id, { statut: 'canceled' })
      return await SignatureRequestModel.getById(id)
    } catch (error) {
      logger.error(
        `[SignatureRequestService] cancel(${id}) failed: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Process a Yousign webhook event.
   *
   * Expected payload shape (v3):
   *   {
   *     event_name: 'signer.done' | 'signer.declined' | 'signature_request.done' | ...,
   *     data: {
   *       signature_request: { id: '...' },
   *       signer: { id: '...', email: '...' }
   *     }
   *   }
   */
  async handleWebhook(event) {
    try {
      if (!event || !event.event_name) {
        throw new Error('Webhook event invalide')
      }

      const providerRequestId =
        event.data &&
        event.data.signature_request &&
        event.data.signature_request.id
      if (!providerRequestId) {
        throw new Error('signature_request.id manquant dans le webhook')
      }

      const request = await SignatureRequestModel.getByProviderRequestId(
        providerRequestId
      )
      if (!request) {
        logger.warn(
          `[SignatureRequestService] Webhook for unknown provider request ${providerRequestId}`
        )
        return { handled: false }
      }

      const signerEmail =
        event.data && event.data.signer && event.data.signer.email
      const statutToApply = mapEventToSignatoryStatut(event.event_name)

      if (signerEmail && statutToApply) {
        const signatory = await SignatureRequestModel.findSignatoryByEmail(
          request.id,
          signerEmail
        )
        if (signatory) {
          await SignatureRequestModel.updateSignatoryStatus(
            signatory.id,
            statutToApply
          )
        }
      }

      // Recompute the aggregate request statut
      const signatories = await SignatureRequestModel.getSignatoriesByRequest(
        request.id
      )
      let aggregate = request.statut

      if (
        event.event_name === 'signature_request.done' ||
        (signatories.length > 0 &&
          signatories.every(s => s.statut === 'signed'))
      ) {
        aggregate = 'signed'
      } else if (signatories.some(s => s.statut === 'refused')) {
        aggregate = 'canceled'
      } else if (signatories.some(s => s.statut === 'expired')) {
        aggregate = 'expired'
      } else if (signatories.some(s => s.statut === 'signed')) {
        aggregate = 'pending'
      }

      if (aggregate !== request.statut) {
        await SignatureRequestModel.update(request.id, { statut: aggregate })
      }

      logger.info(
        `[SignatureRequestService] Webhook handled: event=${event.event_name} request=${request.id}`
      )

      return { handled: true, requestId: request.id }
    } catch (error) {
      logger.error(
        `[SignatureRequestService] handleWebhook failed: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Map Yousign request status to our internal enum.
   */
  _mapProviderStatus(providerStatus) {
    switch (providerStatus) {
      case 'draft':
      case 'ongoing':
      case 'pending':
        return 'pending'
      case 'done':
      case 'signed':
        return 'signed'
      case 'expired':
        return 'expired'
      case 'canceled':
      case 'declined':
      case 'rejected':
        return 'canceled'
      default:
        return null
    }
  }
}

export const signatureRequestService = new SignatureRequestService()
export default signatureRequestService
