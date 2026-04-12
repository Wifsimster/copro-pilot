import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

class GdprErasureService {
  async requestErasure(userId) {
    const db = getDb()
    const trx = await db.transaction()

    try {
      // 1. Find coproprietaire linked to this user
      const coproprietaire = await trx('coproprietaires')
        .where('user_id', userId)
        .first()

      if (coproprietaire) {
        // 2. Anonymize coproprietaire (keep record for financial integrity)
        await trx('coproprietaires')
          .where('id', coproprietaire.id)
          .update({
            nom: 'ANONYMISE',
            prenom: 'ANONYMISE',
            email: null,
            telephone: null,
            adresse_correspondance: null,
            notes: null,
            user_id: null,
            deleted_at: db.fn.now(),
            updated_at: db.fn.now(),
          })

        // 3. Clear redundant PII in convocation recipients
        await trx('destinataires_convocation')
          .where('coproprietaire_id', coproprietaire.id)
          .update({ email_envoye_a: null })

        // 4. Anonymize incidents reported by the coproprietaire
        await trx('incidents')
          .where('signale_par_id', coproprietaire.id)
          .update({
            signale_par_id: null,
            notes: null,
            updated_at: db.fn.now(),
          })

        // 5. Anonymize/remove personal documents
        await trx('documents')
          .where('entite_type', 'coproprietaire')
          .where('entite_id', coproprietaire.id)
          .update({
            nom: 'Document supprime (RGPD)',
            description: null,
            entite_type: null,
            entite_id: null,
            updated_at: db.fn.now(),
          })

        // 6. Anonymize assembly presences
        await trx('presences_ag')
          .where('coproprietaire_id', coproprietaire.id)
          .update({
            statut: 'absent',
            represente_par_id: null,
            updated_at: db.fn.now(),
          })

        // Also clear presences where this person was a representative
        await trx('presences_ag')
          .where('represente_par_id', coproprietaire.id)
          .update({
            represente_par_id: null,
            updated_at: db.fn.now(),
          })

        // 7. Anonymize locataires linked to the user's lots
        const lotIds = await trx('lots')
          .where('coproprietaire_id', coproprietaire.id)
          .pluck('id')

        if (lotIds.length > 0) {
          await trx('locataires')
            .whereIn('lot_id', lotIds)
            .update({
              nom: 'ANONYMISE',
              prenom: 'ANONYMISE',
              email: null,
              telephone: null,
              updated_at: db.fn.now(),
            })
        }
      }

      // 8. Delete non-financial personal data
      await trx('notifications').where('user_id', userId).del()
      await trx('gdpr_consents').where('user_id', userId).del()

      // 5. Soft-delete user account
      await trx('user')
        .where('id', userId)
        .update({
          name: 'Compte supprime',
          email: `deleted-${userId}@anonymized.local`,
          deletedAt: db.fn.now(),
          banned: true,
          banReason: 'Compte supprime sur demande RGPD',
          updatedAt: db.fn.now(),
        })

      // 6. Invalidate all sessions
      await trx('session').where('userId', userId).del()

      await trx.commit()
      logger.info('[GdprErasureService] Erasure completed')
      return { success: true }
    } catch (error) {
      await trx.rollback()
      logger.error(
        `[GdprErasureService] Erasure failed: ${error.message}`
      )
      throw error
    }
  }
}

export const gdprErasureService = new GdprErasureService()
