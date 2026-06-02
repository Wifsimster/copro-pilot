import { getStripe } from '../config/stripe.js'
import { paiementService } from './PaiementService.js'
import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

/**
 * Build an Error carrying an HTTP status so the controller can map known
 * business failures to the right 4xx code instead of a blanket 500.
 */
function httpError(status, message) {
  const err = new Error(message)
  err.status = status
  return err
}

class ExtranetPaymentService {
  /**
   * Create a Stripe Checkout Session for a copropriétaire to pay
   * their outstanding balance.
   */
  async createCheckoutSession(coproprietaireId, amount, description) {
    try {
      const stripe = getStripe()
      if (!stripe) {
        throw new Error('Stripe is not configured')
      }

      // Verify the coproprietaire record exists
      const copro = await this._getCoproprietaireById(coproprietaireId)
      if (!copro) {
        throw new Error('Copropriétaire introuvable')
      }

      const amountCents = Math.round(Number(amount) * 100)
      if (!Number.isFinite(amountCents) || amountCents <= 0) {
        throw new Error('Montant invalide')
      }

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
      const productName =
        description && description.trim().length > 0
          ? description
          : 'Règlement du solde copropriétaire'

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card', 'sepa_debit'],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: amountCents,
              product_data: {
                name: productName,
              },
            },
          },
        ],
        success_url: `${baseUrl}/extranet/compte?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/extranet/compte?payment=canceled`,
        customer_email: copro.email || undefined,
        metadata: {
          coproprietaireId: String(coproprietaireId),
          type: 'coproprietaire_payment',
        },
      })

      logger.info(
        `[ExtranetPaymentService] Checkout session created for coproprietaire ${coproprietaireId} (${amount} EUR)`
      )

      return { url: session.url, id: session.id }
    } catch (error) {
      logger.error(
        `[ExtranetPaymentService] Error creating checkout session: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Handle a successful Stripe checkout session: verify the payment
   * and record the paiement in database.
   */
  async handlePaymentSuccess(sessionId, expectedCoproprietaireId = null) {
    try {
      const stripe = getStripe()
      if (!stripe) {
        throw new Error('Stripe is not configured')
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (!session) {
        throw httpError(404, 'Session Stripe introuvable')
      }

      if (session.payment_status !== 'paid') {
        logger.warn(
          `[ExtranetPaymentService] Payment not completed for session ${sessionId} (status=${session.payment_status})`
        )
        throw httpError(402, 'Le paiement n\'est pas confirmé')
      }

      const metadataType = session.metadata?.type
      if (metadataType !== 'coproprietaire_payment') {
        throw httpError(400, 'Type de session Stripe invalide')
      }

      const coproprietaireId = parseInt(
        session.metadata?.coproprietaireId,
        10
      )
      if (!coproprietaireId) {
        throw httpError(400, 'coproprietaireId manquant dans la session')
      }

      // Broken-access-control guard: the session id is supplied by the
      // client, so a paiement must only ever be recorded against the
      // authenticated copropriétaire who owns the session — never against
      // whoever the (untrusted) session metadata points to.
      if (
        expectedCoproprietaireId != null &&
        coproprietaireId !== Number(expectedCoproprietaireId)
      ) {
        logger.warn(
          `[ExtranetPaymentService] Session ${sessionId} coproprietaire mismatch ` +
            `(session=${coproprietaireId}, caller=${expectedCoproprietaireId})`
        )
        throw httpError(403, 'Cette session de paiement ne vous appartient pas')
      }

      // Idempotency: if a paiement already exists for this session
      // (via the Stripe session id stored in reference), return it.
      const existing = await this._findPaiementByStripeSessionId(sessionId)
      if (existing) {
        logger.info(
          `[ExtranetPaymentService] Paiement already recorded for session ${sessionId} (id=${existing.id})`
        )
        return existing
      }

      const montant = (session.amount_total || 0) / 100

      const paiement = await paiementService.create({
        coproprietaire_id: coproprietaireId,
        appel_fonds_id: null,
        montant,
        date_paiement: new Date(),
        mode: 'autre',
        reference: sessionId,
        notes: 'Paiement en ligne via Stripe (extranet copropriétaire)',
      })

      logger.info(
        `[ExtranetPaymentService] Paiement recorded for coproprietaire ${coproprietaireId} (montant=${montant} EUR, session=${sessionId})`
      )

      return paiement
    } catch (error) {
      logger.error(
        `[ExtranetPaymentService] Error handling payment success: ${error.message}`
      )
      throw error
    }
  }

  // ── Internals ───────────────────────────────────────────────────

  async _getCoproprietaireById(coproprietaireId) {
    const db = knexDatabase.getKnex()
    return db('coproprietaires').where('id', coproprietaireId).first()
  }

  async _findPaiementByStripeSessionId(sessionId) {
    const db = knexDatabase.getKnex()
    return db('paiements').where('reference', sessionId).first()
  }
}

export const extranetPaymentService = new ExtranetPaymentService()
