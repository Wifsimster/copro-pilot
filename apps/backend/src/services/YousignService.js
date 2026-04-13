import crypto from 'crypto'
import logger from '../logger.js'

/**
 * YousignService
 *
 * Thin abstraction over the Yousign v3 e-signing API.
 *
 * This is a stub/foundation implementation: real HTTP calls are
 * guarded by the presence of `YOUSIGN_API_KEY`. When no API key
 * is configured, the service logs a warning and returns fully
 * deterministic mocked responses that mirror the shape of the
 * real Yousign payloads. Downstream code can therefore run end
 * to end in development/tests without hitting the network.
 *
 * Environment variables:
 *   - YOUSIGN_API_KEY  (optional)  API token for the Yousign v3 API
 *   - YOUSIGN_API_URL  (optional)  Base URL, defaults to sandbox
 */
class YousignService {
  constructor() {
    this.apiKey = process.env.YOUSIGN_API_KEY || null
    this.apiUrl =
      process.env.YOUSIGN_API_URL || 'https://api-sandbox.yousign.app/v3'
  }

  /**
   * Check whether the service is running in mock mode
   * (i.e. no API key configured).
   */
  isMock() {
    return !this.apiKey
  }

  /**
   * Generate a deterministic mock identifier. Not cryptographically
   * secure — only used to simulate Yousign responses in dev/test.
   */
  _mockId(prefix = 'mock') {
    return `${prefix}_${crypto.randomBytes(8).toString('hex')}`
  }

  /**
   * Build a mocked createSignatureRequest response that mimics
   * the Yousign v3 "signature request" payload.
   */
  _mockCreateResponse(signatories) {
    const requestId = this._mockId('sig_req')
    return {
      id: requestId,
      status: 'draft',
      signatories: (signatories || []).map(s => {
        const id = this._mockId('signer')
        return {
          id,
          email: s.email,
          url: `https://yousign.test/sign/${requestId}/${id}`,
        }
      }),
    }
  }

  /**
   * Perform an authenticated request against the Yousign API.
   * Only invoked when an API key is configured.
   */
  async _request(path, { method = 'GET', body, headers = {} } = {}) {
    const url = `${this.apiUrl}${path}`
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      throw new Error(
        `Yousign API error ${response.status} on ${method} ${path}: ${errorBody}`
      )
    }

    return response.json()
  }

  /**
   * Create a signature request: initialises the request, uploads
   * the document, adds each signer and returns a compact object
   * containing the request id, status and per-signer signing URLs.
   *
   * @param {Object} params
   * @param {string} params.documentPath  Path to the document to sign
   * @param {Array<{email: string, nom: string, prenom: string}>} params.signatories
   * @param {Object} [params.metadata]    Free-form metadata (ag_id, document_id, ...)
   * @returns {Promise<{id: string, status: string, signatories: Array<{id: string, email: string, url: string}>}>}
   */
  async createSignatureRequest({ documentPath, signatories, metadata = {} }) {
    if (this.isMock()) {
      logger.warn(
        '[YousignService] No YOUSIGN_API_KEY configured — returning mock signature request'
      )
      return this._mockCreateResponse(signatories)
    }

    try {
      // 1. Create the signature request
      const request = await this._request('/signature_requests', {
        method: 'POST',
        body: {
          name: metadata.name || `CoproPilot document ${metadata.document_id || ''}`.trim(),
          delivery_mode: 'email',
          ordered_signers: false,
          external_id: metadata.external_id || null,
        },
      })

      // 2. Upload the document (real implementation would use
      //    multipart/form-data — left as a TODO for the stub).
      logger.info(
        `[YousignService] Document upload not implemented yet (path: ${documentPath})`
      )

      // 3. Add signers
      const addedSigners = []
      for (const s of signatories) {
        const signer = await this._request(
          `/signature_requests/${request.id}/signers`,
          {
            method: 'POST',
            body: {
              info: {
                first_name: s.prenom,
                last_name: s.nom,
                email: s.email,
                locale: 'fr',
              },
              signature_level: 'electronic_signature',
              signature_authentication_mode: 'no_otp',
            },
          }
        )
        addedSigners.push({
          id: signer.id,
          email: s.email,
          url: signer.signature_link || null,
        })
      }

      // 4. Activate the request
      await this._request(`/signature_requests/${request.id}/activate`, {
        method: 'POST',
      })

      return {
        id: request.id,
        status: request.status || 'pending',
        signatories: addedSigners,
      }
    } catch (error) {
      logger.error(
        `[YousignService] createSignatureRequest failed: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Fetch the current state of a signature request.
   */
  async getSignatureRequest(requestId) {
    if (this.isMock()) {
      logger.warn(
        `[YousignService] No YOUSIGN_API_KEY configured — returning mock status for ${requestId}`
      )
      return {
        id: requestId,
        status: 'pending',
        signatories: [],
      }
    }

    try {
      return await this._request(`/signature_requests/${requestId}`)
    } catch (error) {
      logger.error(
        `[YousignService] getSignatureRequest(${requestId}) failed: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Cancel a pending signature request.
   */
  async cancelSignatureRequest(requestId) {
    if (this.isMock()) {
      logger.warn(
        `[YousignService] No YOUSIGN_API_KEY configured — mock cancel for ${requestId}`
      )
      return { id: requestId, status: 'canceled' }
    }

    try {
      return await this._request(
        `/signature_requests/${requestId}/cancel`,
        { method: 'POST' }
      )
    } catch (error) {
      logger.error(
        `[YousignService] cancelSignatureRequest(${requestId}) failed: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Verify the HMAC signature of an incoming webhook payload.
   * Yousign signs webhook bodies with a shared secret via the
   * `X-Yousign-Signature-256` header.
   *
   * @param {string|Buffer} rawBody  Raw request body as received
   * @param {string} signatureHeader Value of the signature header
   * @returns {boolean}
   */
  verifyWebhookSignature(rawBody, signatureHeader) {
    const secret = process.env.YOUSIGN_WEBHOOK_SECRET
    if (!secret) {
      // In mock/dev mode, accept all webhooks but log clearly.
      logger.warn(
        '[YousignService] No YOUSIGN_WEBHOOK_SECRET configured — skipping signature verification'
      )
      return true
    }
    if (!signatureHeader) return false
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, 'hex'),
        Buffer.from(signatureHeader, 'hex')
      )
    } catch {
      return false
    }
  }
}

export const yousignService = new YousignService()
export default yousignService
