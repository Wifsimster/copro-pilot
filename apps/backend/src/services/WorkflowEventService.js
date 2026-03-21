import knexDatabase from '../config/knex-database.js'
import { NotificationModel } from '../models/Notification.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

class WorkflowEventService {
  // --- Helpers ---

  // Returns all syndic/user role users. In the current single-tenant
  // setup every syndic manages all coproprietes, so filtering by
  // coproprieteId is not required. When multi-tenant support is added,
  // this should be scoped to users linked to the given copropriete.
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

  async _notifySyndics(coproprieteId, data) {
    const users = await this._getSyndicUsersForCopropriete(
      coproprieteId
    )
    for (const user of users) {
      try {
        await NotificationModel.create({
          ...data,
          copropriete_id: coproprieteId,
          user_id: user.id,
        })
      } catch (error) {
        logger.error(
          `[WorkflowEvent] Notification error for user ${user.id}: ${error.message}`
        )
      }
    }
  }

  // --- Event: Incident created ---

  async onIncidentCreated(incident) {
    try {
      await this._notifySyndics(incident.copropriete_id, {
        type: 'incident',
        titre: `Nouvel incident : ${incident.titre}`,
        message: `Un incident ${incident.urgence ? `(urgence: ${incident.urgence})` : ''} a ete signale.`,
        lien: '/travaux',
      })
      logger.info(
        `[WorkflowEvent] Incident created notifications sent (ID: ${incident.id})`
      )
    } catch (error) {
      logger.error(
        `[WorkflowEvent] onIncidentCreated error: ${error.message}`
      )
    }
  }

  // --- Event: Paiement recorded ---

  async onPaiementCreated(paiement) {
    try {
      // Notify the coproprietaire if they have a user account
      const userId = await this._getUserIdForCoproprietaire(
        paiement.coproprietaire_id
      )
      if (userId) {
        await NotificationModel.create({
          user_id: userId,
          type: 'paiement',
          titre: 'Paiement enregistre',
          message: `Votre paiement de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(paiement.montant)} a ete enregistre.`,
          lien: '/extranet',
        })
      }
      logger.info(
        `[WorkflowEvent] Paiement notification sent (ID: ${paiement.id})`
      )
    } catch (error) {
      logger.error(
        `[WorkflowEvent] onPaiementCreated error: ${error.message}`
      )
    }
  }

  // --- Event: AG status changed to terminee ---

  async onAssembleeTerminee(ag) {
    try {
      const db = getDb()
      // Notify all coproprietaires who have user accounts
      const copros = await db('coproprietaires')
        .join('lots', 'coproprietaires.id', 'lots.coproprietaire_id')
        .where('lots.copropriete_id', ag.copropriete_id)
        .whereNotNull('coproprietaires.user_id')
        .select('coproprietaires.user_id')
        .distinct()

      for (const copro of copros) {
        await NotificationModel.create({
          user_id: copro.user_id,
          copropriete_id: ag.copropriete_id,
          type: 'ag',
          titre: `AG ${ag.type} terminee`,
          message:
            'L\'assemblee generale est terminee. Le proces-verbal sera disponible prochainement.',
          lien: `/assemblees/${ag.id}`,
        })
      }

      // Also notify syndics
      await this._notifySyndics(ag.copropriete_id, {
        type: 'ag',
        titre: `AG ${ag.type} terminee`,
        message: 'L\'assemblee generale est terminee.',
        lien: `/assemblees/${ag.id}`,
      })

      logger.info(
        `[WorkflowEvent] AG terminee notifications sent (ID: ${ag.id})`
      )
    } catch (error) {
      logger.error(
        `[WorkflowEvent] onAssembleeTerminee error: ${error.message}`
      )
    }
  }

  // --- Event: Intervention completed ---

  async onInterventionTerminee(intervention) {
    try {
      const db = getDb()

      // Idempotency: skip if entry already exists for this intervention
      const existing = await db('carnet_entretien')
        .where('intervention_id', intervention.id)
        .first()
      if (existing) {
        logger.info(
          `[WorkflowEvent] Carnet entry already exists for intervention ${intervention.id}, skipping`
        )
        return
      }

      // Auto-create carnet d'entretien entry
      await db('carnet_entretien').insert({
        copropriete_id: intervention.copropriete_id,
        titre: intervention.description
          ? `Intervention: ${intervention.description.substring(0, 100)}`
          : 'Intervention terminee',
        description: intervention.description,
        prestataire: intervention.prestataire,
        montant: intervention.montant_facture || intervention.montant_devis,
        date_realisation:
          intervention.date_realisation || new Date().toISOString(),
        categorie: 'intervention',
        intervention_id: intervention.id,
      })

      // Notify syndics
      await this._notifySyndics(intervention.copropriete_id, {
        type: 'general',
        titre: 'Intervention terminee',
        message: `L'intervention "${intervention.description || ''}" a ete realisee.${intervention.montant_facture ? ` Montant facture: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(intervention.montant_facture)}` : ''}`,
        lien: '/travaux',
      })

      logger.info(
        `[WorkflowEvent] Intervention terminee + carnet entry (ID: ${intervention.id})`
      )
    } catch (error) {
      logger.error(
        `[WorkflowEvent] onInterventionTerminee error: ${error.message}`
      )
    }
  }

  // --- Event: Ordre de service emis ---

  async onOrdreServiceEmis(ordreService) {
    try {
      await this._notifySyndics(ordreService.copropriete_id, {
        type: 'general',
        titre: `Ordre de service emis : ${ordreService.numero}`,
        message: `L'ordre de service "${ordreService.objet}" a ete emis.`,
        lien: '/ordres-service',
      })
      logger.info(
        `[WorkflowEvent] Ordre de service emis notification sent (ID: ${ordreService.id})`
      )
    } catch (error) {
      logger.error(
        `[WorkflowEvent] onOrdreServiceEmis error: ${error.message}`
      )
    }
  }

  // --- Event: Ordre de service termine ---

  async onOrdreServiceTermine(ordreService) {
    try {
      await this._notifySyndics(ordreService.copropriete_id, {
        type: 'general',
        titre: `Ordre de service termine : ${ordreService.numero}`,
        message: `L'ordre de service "${ordreService.objet}" est termine.${ordreService.montant_facture ? ` Montant facture: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(ordreService.montant_facture)}` : ''}`,
        lien: '/ordres-service',
      })
      logger.info(
        `[WorkflowEvent] Ordre de service termine notification sent (ID: ${ordreService.id})`
      )
    } catch (error) {
      logger.error(
        `[WorkflowEvent] onOrdreServiceTermine error: ${error.message}`
      )
    }
  }

  // --- Event: Sinistre created ---

  async onSinistreCreated(sinistre) {
    try {
      await this._notifySyndics(sinistre.copropriete_id, {
        type: 'general',
        titre: `Nouveau sinistre declare`,
        message: sinistre.description
          ? sinistre.description.substring(0, 200)
          : 'Un nouveau sinistre a ete declare.',
        lien: '/assurances',
      })
      logger.info(
        `[WorkflowEvent] Sinistre notification sent (ID: ${sinistre.id})`
      )
    } catch (error) {
      logger.error(
        `[WorkflowEvent] onSinistreCreated error: ${error.message}`
      )
    }
  }
}

export const workflowEventService = new WorkflowEventService()
