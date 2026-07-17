import logger from '../logger.js'
import { Ar24LreProvider } from './lre/Ar24LreProvider.js'

/**
 * Lettre Recommandée Électronique (LRE) — provider abstraction.
 *
 * Sending AG convocations by qualified LRE (eIDAS) is what makes "AG conforme"
 * defensible: a convocation sent without a recorded proof of dispatch/receipt
 * is the most common ground for annulling an AG. This service defines the seam
 * a real provider (AR24, Maileva, Syment…) plugs into, so the convocation flow
 * can call a stable interface today and gain real LRE the day a provider is
 * configured.
 *
 * A provider implements:
 *   async send({ to, subject, content, metadata }) →
 *     { providerId, trackingId, status, proofUrl? }
 */

/**
 * No-op provider used when no LRE provider is configured. It records the
 * intent and returns a clearly-marked simulated tracking reference so the
 * flow never silently pretends a legal LRE was sent.
 */
export class NoopLreProvider {
  get name() {
    return 'noop'
  }

  async send({ to }) {
    logger.warn(
      `[LreService] No LRE provider configured — convocation to ${to} NOT sent by LRE (simulated). Configure LRE_PROVIDER for legal delivery.`
    )
    return {
      providerId: 'noop',
      trackingId: null,
      status: 'not_configured',
      simulated: true,
    }
  }
}

export class LreService {
  constructor(provider) {
    this.provider = provider || new NoopLreProvider()
  }

  /** True only when a real (non-noop) provider is wired. */
  isConfigured() {
    return this.provider.name !== 'noop'
  }

  /**
   * Send a document by LRE. Validates the recipient and delegates to the
   * provider. Returns the provider's tracking result; callers should persist
   * `trackingId`/`proofUrl` against the convocation.
   */
  async send({ to, subject, content, metadata = {} }) {
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      throw new Error('Destinataire LRE invalide')
    }
    if (!subject || !content) {
      throw new Error('Sujet et contenu LRE requis')
    }
    return this.provider.send({ to, subject, content, metadata })
  }
}

/**
 * Resolve the configured provider from the environment. Real providers are
 * registered here as they are implemented; until then the noop provider keeps
 * the flow working without pretending a legal LRE went out.
 */
function resolveProvider() {
  const name = process.env.LRE_PROVIDER
  switch (name) {
    case 'ar24': {
      const token = process.env.AR24_TOKEN
      const privateKey = process.env.AR24_PRIVATE_KEY
      if (!token || !privateKey) {
        logger.warn(
          '[LreService] LRE_PROVIDER=ar24 but AR24_TOKEN / AR24_PRIVATE_KEY missing — falling back to noop'
        )
        return new NoopLreProvider()
      }
      return new Ar24LreProvider({
        token,
        privateKey,
        env: process.env.AR24_ENV || 'sandbox',
      })
    }
    case undefined:
    case '':
    case 'noop':
      return new NoopLreProvider()
    default:
      logger.warn(
        `[LreService] Unknown LRE_PROVIDER "${name}" — falling back to noop`
      )
      return new NoopLreProvider()
  }
}

export const lreService = new LreService(resolveProvider())
