import { notificationService } from './NotificationService.js'
import { sendEmail } from '../utils/email.js'
import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

class EventDispatchService {
  // --- Helpers ---

  async _getSyndicUsersForCopropriete(coproprieteId) {
    const db = getDb()
    return db('user').whereIn('role', ['syndic', 'user'])
  }

  async _getUserIdForCoproprietaire(coproprietaireId) {
    const db = getDb()
    const copro = await db('coproprietaires')
      .where('id', coproprietaireId)
      .first()
    return copro?.user_id || null
  }

  async _getCoproprietaireEmail(coproprietaireId) {
    const db = getDb()
    const copro = await db('coproprietaires')
      .where('id', coproprietaireId)
      .first()
    return copro?.email || null
  }

  // --- Domain events ---

  async notifyPaymentReceived(paiement, coproprietaire) {
    const montantFormatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(paiement.montant)

    // 1. In-app notification for the coproprietaire
    const userId = coproprietaire?.user_id
      || await this._getUserIdForCoproprietaire(paiement.coproprietaire_id)

    if (userId) {
      try {
        await notificationService.create({
          user_id: userId,
          type: 'paiement',
          titre: 'Paiement reçu',
          message: `Votre paiement de ${montantFormatted} a bien été enregistré.`,
          lien: '/extranet',
        })
      } catch (error) {
        logger.error(
          `[EventDispatch] notifyPaymentReceived notification error: ${error.message}`
        )
      }
    }

    // 2. Email to the coproprietaire
    const email = coproprietaire?.email
      || await this._getCoproprietaireEmail(paiement.coproprietaire_id)

    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: 'CoproPilot — Paiement enregistré',
          html: `<p>Bonjour,</p>
<p>Votre paiement de <strong>${montantFormatted}</strong> a bien été enregistré.</p>
<p>Cordialement,<br>CoproPilot</p>`,
        })
      } catch (error) {
        logger.error(
          `[EventDispatch] notifyPaymentReceived email error: ${error.message}`
        )
      }
    }

    logger.info(
      `[EventDispatch] notifyPaymentReceived dispatched (paiement ${paiement.id})`
    )
  }

  async notifyIncidentCreated(incident, copropriete) {
    const coproprieteId = incident.copropriete_id
    const coproprieteNom = copropriete?.nom || ''

    // 1. In-app notifications for all syndic users
    const users = await this._getSyndicUsersForCopropriete(coproprieteId)
    for (const user of users) {
      try {
        await notificationService.create({
          user_id: user.id,
          copropriete_id: coproprieteId,
          type: 'incident',
          titre: `Nouvel incident : ${incident.titre}`,
          message: `Un incident${incident.urgence ? ` (urgence: ${incident.urgence})` : ''} a ete signale${coproprieteNom ? ` sur ${coproprieteNom}` : ''}.`,
          lien: '/travaux',
        })
      } catch (error) {
        logger.error(
          `[EventDispatch] notifyIncidentCreated notification error for user ${user.id}: ${error.message}`
        )
      }
    }

    logger.info(
      `[EventDispatch] notifyIncidentCreated dispatched (incident ${incident.id})`
    )
  }

  async notifyRelanceSent(relance, coproprietaire) {
    const montantFormatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(relance.montant_du)

    // 1. In-app notification
    const userId = coproprietaire?.user_id
      || await this._getUserIdForCoproprietaire(relance.coproprietaire_id)

    if (userId) {
      try {
        await notificationService.create({
          user_id: userId,
          copropriete_id: relance.copropriete_id,
          type: 'relance',
          titre: `Relance ${relance.type || ''}`,
          message: `Une relance de ${montantFormatted} vous a ete envoyee.`,
          lien: '/extranet',
        })
      } catch (error) {
        logger.error(
          `[EventDispatch] notifyRelanceSent notification error: ${error.message}`
        )
      }
    }

    // 2. Email
    const email = coproprietaire?.email
      || await this._getCoproprietaireEmail(relance.coproprietaire_id)

    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: 'CoproPilot — Relance de paiement',
          html: `<p>Bonjour,</p>
<p>Nous vous informons qu'une relance de <strong>${montantFormatted}</strong> a ete emise.</p>
<p>Merci de proceder au reglement dans les meilleurs delais.</p>
<p>Cordialement,<br>CoproPilot</p>`,
        })
      } catch (error) {
        logger.error(
          `[EventDispatch] notifyRelanceSent email error: ${error.message}`
        )
      }
    }

    logger.info(
      `[EventDispatch] notifyRelanceSent dispatched (relance ${relance.id})`
    )
  }

  async notifyAGConvocation(convocation, destinataires) {
    for (const dest of destinataires) {
      // 1. In-app notification
      const userId = dest.user_id
        || await this._getUserIdForCoproprietaire(dest.coproprietaire_id)

      if (userId) {
        try {
          await notificationService.create({
            user_id: userId,
            copropriete_id: convocation.copropriete_id || null,
            type: 'ag',
            titre: 'Convocation a l\'assemblee generale',
            message: 'Vous avez ete convoque a une assemblee generale. Consultez les details sur votre espace.',
            lien: `/assemblees/${convocation.ag_id}`,
          })
        } catch (error) {
          logger.error(
            `[EventDispatch] notifyAGConvocation notification error for dest ${dest.id}: ${error.message}`
          )
        }
      }

      // 2. Email
      const email = dest.email
        || await this._getCoproprietaireEmail(dest.coproprietaire_id)

      if (email) {
        try {
          await sendEmail({
            to: email,
            subject: 'CoproPilot — Convocation assemblee generale',
            html: `<p>Bonjour,</p>
<p>Vous etes convoque a une assemblee generale.</p>
<p>Veuillez consulter votre espace CoproPilot pour plus de details.</p>
<p>Cordialement,<br>CoproPilot</p>`,
          })
        } catch (error) {
          logger.error(
            `[EventDispatch] notifyAGConvocation email error for dest ${dest.id}: ${error.message}`
          )
        }
      }
    }

    logger.info(
      `[EventDispatch] notifyAGConvocation dispatched (convocation ${convocation.id}, ${destinataires.length} destinataires)`
    )
  }

  async notifyDocumentAdded(document, copropriete) {
    const coproprieteId = document.copropriete_id
    const coproprieteNom = copropriete?.nom || ''

    // In-app notification for syndic users only (no email)
    const users = await this._getSyndicUsersForCopropriete(coproprieteId)
    for (const user of users) {
      try {
        await notificationService.create({
          user_id: user.id,
          copropriete_id: coproprieteId,
          type: 'document',
          titre: `Nouveau document : ${document.nom}`,
          message: `Un document${document.categorie ? ` (${document.categorie})` : ''} a été ajouté${coproprieteNom ? ` pour ${coproprieteNom}` : ''}.`,
          lien: '/documents',
        })
      } catch (error) {
        logger.error(
          `[EventDispatch] notifyDocumentAdded notification error for user ${user.id}: ${error.message}`
        )
      }
    }

    logger.info(
      `[EventDispatch] notifyDocumentAdded dispatched (document ${document.id})`
    )
  }
}

export const eventDispatchService = new EventDispatchService()
