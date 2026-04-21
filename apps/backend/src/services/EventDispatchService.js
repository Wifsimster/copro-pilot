import { notificationService } from './NotificationService.js'
import { sendEmail } from '../utils/email.js'
import {
  generateRelanceEmail,
  generatePaymentReceivedEmail,
  generateAGConvocationEmail,
} from '../utils/email-templates.js'
import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

function formatDateFr(date) {
  if (!date) return null
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

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

  async _getCoproprietaire(coproprietaireId) {
    const db = getDb()
    return db('coproprietaires').where('id', coproprietaireId).first()
  }

  async _getCoproprietaireEmail(coproprietaireId) {
    const copro = await this._getCoproprietaire(coproprietaireId)
    return copro?.email || null
  }

  async _getCoproprieteNom(coproprieteId) {
    if (!coproprieteId) return null
    const db = getDb()
    const copro = await db('coproprietes').where('id', coproprieteId).first()
    return copro?.nom || null
  }

  _extranetUrl() {
    const base = process.env.BASE_URL || 'http://localhost:3000'
    return `${base.replace(/\/$/, '')}/#/extranet`
  }

  _assembleeUrl(agId) {
    const base = process.env.BASE_URL || 'http://localhost:3000'
    return `${base.replace(/\/$/, '')}/#/assemblees/${agId}`
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
    const fullCoproprietaire =
      coproprietaire ||
      (await this._getCoproprietaire(paiement.coproprietaire_id))
    const email = fullCoproprietaire?.email

    if (email) {
      const coproprieteNom = await this._getCoproprieteNom(
        paiement.copropriete_id || fullCoproprietaire?.copropriete_id
      )

      try {
        await sendEmail({
          to: email,
          subject: 'CoproPilot — Paiement enregistré',
          html: generatePaymentReceivedEmail({
            name: fullCoproprietaire?.nom || fullCoproprietaire?.prenom,
            montant: paiement.montant,
            coproprieteNom,
            datePaiement: formatDateFr(paiement.date_paiement || paiement.date),
            extranetUrl: this._extranetUrl(),
          }),
        })
      } catch (error) {
        logger.error(
          `[EventDispatch] notifyPaymentReceived email error: ${error.message}`
        )
      }
    }

    logger.info(
      `[EventDispatch] notifyPaymentReceived dispatched (paiement ${paiement.id}, montant ${montantFormatted})`
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
    const fullCoproprietaire =
      coproprietaire ||
      (await this._getCoproprietaire(relance.coproprietaire_id))
    const email = fullCoproprietaire?.email

    if (email) {
      const coproprieteNom = await this._getCoproprieteNom(
        relance.copropriete_id
      )
      const isMiseEnDemeure = relance.type === 'mise_en_demeure'
      const subject = isMiseEnDemeure
        ? 'CoproPilot — Mise en demeure de paiement'
        : 'CoproPilot — Relance de paiement'

      try {
        await sendEmail({
          to: email,
          subject,
          html: generateRelanceEmail({
            name: fullCoproprietaire?.nom || fullCoproprietaire?.prenom,
            montant: relance.montant_du,
            type: relance.type,
            coproprieteNom,
            dateRelance: formatDateFr(relance.date_relance),
            extranetUrl: this._extranetUrl(),
          }),
        })
      } catch (error) {
        logger.error(
          `[EventDispatch] notifyRelanceSent email error: ${error.message}`
        )
      }
    }

    logger.info(
      `[EventDispatch] notifyRelanceSent dispatched (relance ${relance.id}, montant ${montantFormatted})`
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
        const coproprieteNom = convocation.copropriete_id
          ? await this._getCoproprieteNom(convocation.copropriete_id)
          : null

        try {
          await sendEmail({
            to: email,
            subject: 'CoproPilot — Convocation assemblée générale',
            html: generateAGConvocationEmail({
              name: dest.nom || dest.prenom,
              coproprieteNom,
              dateAG: formatDateFr(convocation.date_ag || convocation.date),
              lieuAG: convocation.lieu,
              convocationUrl: this._assembleeUrl(convocation.ag_id),
            }),
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
