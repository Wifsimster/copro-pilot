import { ar24Signature, ar24Decrypt, ar24Date } from './ar24Signature.js'
import logger from '../../logger.js'

const BASE_URLS = {
  sandbox: 'https://sandbox.ar24.fr/api',
  prod: 'https://app.ar24.fr/api',
}

/**
 * AR24 LRE provider (eIDAS registered electronic mail) behind the LreService
 * seam. Implements the documented token + date + signature auth and posts to
 * the eIDAS send endpoint. Response bodies are AES-256-CBC-encrypted (errors
 * are in clear).
 *
 * ⚠️ Not yet exercised against the live sandbox — activated by setting
 * LRE_PROVIDER=ar24 with AR24_TOKEN + AR24_PRIVATE_KEY. The exact endpoint
 * path, parameter names and the eIDAS OTP flow must be confirmed against the
 * Postman collection AR24 provides when API access is created; those are
 * isolated in `send()` and marked TODO.
 */
export class Ar24LreProvider {
  constructor({ token, privateKey, env = 'sandbox', fetchImpl } = {}) {
    if (!token || !privateKey) {
      throw new Error('Ar24LreProvider requires token and privateKey')
    }
    this.token = token
    this.privateKey = privateKey
    this.baseUrl = BASE_URLS[env] || BASE_URLS.sandbox
    // Injectable for testing; defaults to global fetch (Node 18+/24).
    this.fetch = fetchImpl || globalThis.fetch
  }

  get name() {
    return 'ar24'
  }

  /**
   * Build the authenticated body for an AR24 request: the token, the signing
   * date, the signature, and the operation parameters. Exposed for testing.
   */
  buildAuthParams(params, now = new Date()) {
    const date = ar24Date(now)
    return {
      token: this.token,
      date,
      signature: ar24Signature(date, this.privateKey),
      ...params,
    }
  }

  async _post(path, params) {
    const body = this.buildAuthParams(params)
    const res = await this.fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString(),
    })
    const text = await res.text()
    if (!res.ok) {
      // Errors are returned in clear (not encrypted).
      throw new Error(`AR24 ${res.status}: ${text}`)
    }
    // Success bodies are AES-256-CBC encrypted with the request date.
    try {
      const clear = ar24Decrypt(text, body.date, this.privateKey)
      return JSON.parse(clear)
    } catch {
      // Some endpoints may return clear JSON; fall back.
      try {
        return JSON.parse(text)
      } catch {
        return { raw: text }
      }
    }
  }

  /**
   * Send an eIDAS registered mail. `metadata` may carry AR24-specific fields
   * (id_user of the configured sender, recipient civility, ref_client…).
   */
  async send({ to, subject, content, metadata = {} }) {
    // TODO(sandbox): confirm the exact endpoint + param names against the
    // Postman collection. Placeholder mapping based on the documented client:
    const params = {
      id_user: metadata.senderId, // configured AR24 sender (expéditeur)
      to_email: to,
      to_firstname: metadata.toFirstname || '',
      to_lastname: metadata.toLastname || '',
      ref_client: metadata.refClient || '',
      ref_dossier: metadata.refDossier || '',
      subject,
      content,
      // eidas: 1  // ⚠️ eIDAS requires an OTP flow (currently manual) — see docs
    }
    try {
      const result = await this._post('/user/eidas/', params)
      return {
        providerId: 'ar24',
        trackingId: result.id || result.id_email || null,
        status: result.status || 'sent',
        proofUrl: result.proof_url || null,
        raw: result,
      }
    } catch (error) {
      logger.error(`[Ar24LreProvider] send failed: ${error.message}`)
      throw error
    }
  }
}
