import { extranetPaymentService } from '../services/ExtranetPaymentService.js'
import { ExtranetModel } from '../models/Extranet.js'
import logger from '../logger.js'

export class ExtranetPaymentController {
  /**
   * POST /api/extranet/payments/checkout
   * Creates a Stripe Checkout Session for the authenticated
   * copropriétaire to pay their balance.
   */
  static async createCheckoutSession(req, res) {
    try {
      const userId = req.user.id
      const { amount, description } = req.body

      const numericAmount = Number(amount)
      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res
          .status(400)
          .json({ error: 'Le montant doit être supérieur à 0' })
      }
      if (numericAmount >= 10000) {
        return res.status(400).json({
          error: 'Le montant doit être inférieur à 10000 €',
        })
      }

      const coproprietaire =
        await ExtranetModel.getCoproprietaireByUserId(userId)
      if (!coproprietaire) {
        return res
          .status(403)
          .json({ error: 'Accès réservé aux copropriétaires' })
      }

      const session = await extranetPaymentService.createCheckoutSession(
        coproprietaire.id,
        numericAmount,
        description
      )

      res.json({ url: session.url, sessionId: session.id })
    } catch (error) {
      logger.error(
        `[ExtranetPaymentController] Checkout session error: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible de créer la session de paiement' })
    }
  }

  /**
   * POST /api/extranet/payments/confirm
   * Confirms a Stripe Checkout session and records the paiement.
   * The webhook is the primary source of truth — this endpoint is a
   * client-side fallback to confirm faster on return from Stripe.
   */
  static async confirmPayment(req, res) {
    try {
      const { session_id: sessionId } = req.body
      if (!sessionId || typeof sessionId !== 'string') {
        return res
          .status(400)
          .json({ error: 'session_id manquant' })
      }

      const paiement =
        await extranetPaymentService.handlePaymentSuccess(sessionId)

      res.json({
        data: {
          id: paiement.id,
          montant: paiement.montant,
        },
      })
    } catch (error) {
      logger.error(
        `[ExtranetPaymentController] Confirm payment error: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible de confirmer le paiement' })
    }
  }
}
