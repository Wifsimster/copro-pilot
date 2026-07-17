/**
 * Pure helpers for dispatching AG convocations by LRE.
 *
 * Kept free of DB/IO so the rules — which send modes require an LRE, and how a
 * recipient maps to an LRE payload — are unit-testable in isolation. The
 * service layer wires these to `lreService` and persists the tracking result.
 */

/** Send modes that require a Lettre Recommandée Électronique. */
export const LRE_MODES = new Set(['courrier_recommande', 'les_deux'])

/** True when the convocation's mode implies a legally-recorded LRE dispatch. */
export function modeUsesLre(mode) {
  return LRE_MODES.has(mode)
}

/**
 * Build the LRE payload for a single recipient, or return null when the
 * recipient cannot receive an eIDAS LRE (no e-mail on file). The recipient row
 * comes from ConvocationAGModel.getDestinataires (coproprietaire_* joined).
 */
export function buildConvocationLrePayload(convocation, destinataire) {
  const to = destinataire.email_envoye_a || destinataire.coproprietaire_email
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    return null
  }
  const subject = `Convocation à l'assemblée générale`
  const content =
    convocation.contenu ||
    `Vous êtes convoqué(e) à l'assemblée générale de votre copropriété.`
  return {
    to,
    subject,
    content,
    metadata: {
      convocationId: convocation.id,
      destinataireId: destinataire.id,
      toFirstname: destinataire.coproprietaire_prenom || '',
      toLastname: destinataire.coproprietaire_nom || '',
    },
  }
}

/**
 * Normalize a provider send result into the columns persisted on
 * destinataires_convocation. `result` is what LreService.send resolves to.
 */
export function toLreTracking(result) {
  return {
    lre_provider: result.providerId || null,
    lre_tracking_id: result.trackingId || null,
    lre_proof_url: result.proofUrl || null,
    lre_statut: result.status || null,
  }
}
