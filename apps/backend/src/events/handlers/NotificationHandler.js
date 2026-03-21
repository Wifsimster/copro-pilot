import knexDatabase from '../../config/knex-database.js'
import { NotificationModel } from '../../models/Notification.js'
import { EVENT_TYPES } from '../event-types.js'
import logger from '../../logger.js'

const getDb = () => knexDatabase.getKnex()

// --- Helpers ---

async function getSyndicUsersForCopropriete() {
  const db = getDb()
  return db('user').whereIn('role', ['syndic', 'user'])
}

async function getUserIdForCoproprietaire(coproprietaireId) {
  const db = getDb()
  const copro = await db('coproprietaires')
    .where('id', coproprietaireId)
    .first()
  return copro?.user_id || null
}

async function notifySyndics(coproprieteId, data) {
  const users = await getSyndicUsersForCopropriete()
  for (const user of users) {
    try {
      await NotificationModel.create({
        ...data,
        copropriete_id: coproprieteId,
        user_id: user.id,
      })
    } catch (error) {
      logger.error(
        `[NotificationHandler] Notification error for user ${user.id}: ${error.message}`
      )
    }
  }
}

// --- Handlers ---

async function onIncidentCreated(event) {
  const incident = event.payload
  await notifySyndics(incident.copropriete_id, {
    type: 'incident',
    titre: `Nouvel incident : ${incident.titre}`,
    message: `Un incident ${incident.urgence ? `(urgence: ${incident.urgence})` : ''} a ete signale.`,
    lien: '/travaux',
  })
  logger.info(
    `[NotificationHandler] Incident created notifications sent (ID: ${incident.id})`
  )
}

async function onPaiementCreated(event) {
  const paiement = event.payload
  const userId = await getUserIdForCoproprietaire(
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
    `[NotificationHandler] Paiement notification sent (ID: ${paiement.id})`
  )
}

async function onAssembleeStatusChanged(event) {
  const ag = event.payload
  if (ag.statut !== 'terminee') return

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
  await notifySyndics(ag.copropriete_id, {
    type: 'ag',
    titre: `AG ${ag.type} terminee`,
    message: 'L\'assemblee generale est terminee.',
    lien: `/assemblees/${ag.id}`,
  })

  logger.info(
    `[NotificationHandler] AG terminee notifications sent (ID: ${ag.id})`
  )
}

async function onInterventionStatusChanged(event) {
  const intervention = event.payload
  if (intervention.statut !== 'terminee') return

  const db = getDb()

  // Idempotency: skip if entry already exists for this intervention
  const existing = await db('carnet_entretien')
    .where('intervention_id', intervention.id)
    .first()
  if (existing) {
    logger.info(
      `[NotificationHandler] Carnet entry already exists for intervention ${intervention.id}, skipping`
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
    montant:
      intervention.montant_facture || intervention.montant_devis,
    date_realisation:
      intervention.date_realisation || new Date().toISOString(),
    categorie: 'intervention',
    intervention_id: intervention.id,
  })

  // Notify syndics
  await notifySyndics(intervention.copropriete_id, {
    type: 'general',
    titre: 'Intervention terminee',
    message: `L'intervention "${intervention.description || ''}" a ete realisee.${intervention.montant_facture ? ` Montant facture: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(intervention.montant_facture)}` : ''}`,
    lien: '/travaux',
  })

  logger.info(
    `[NotificationHandler] Intervention terminee + carnet entry (ID: ${intervention.id})`
  )
}

async function onSinistreCreated(event) {
  const sinistre = event.payload
  await notifySyndics(sinistre.copropriete_id, {
    type: 'general',
    titre: 'Nouveau sinistre declare',
    message: sinistre.description
      ? sinistre.description.substring(0, 200)
      : 'Un nouveau sinistre a ete declare.',
    lien: '/assurances',
  })
  logger.info(
    `[NotificationHandler] Sinistre notification sent (ID: ${sinistre.id})`
  )
}

// --- Registration ---

export function registerNotificationHandlers(eventBus) {
  eventBus.on(EVENT_TYPES.INCIDENT_CREATED, onIncidentCreated)
  eventBus.on(EVENT_TYPES.PAIEMENT_CREATED, onPaiementCreated)
  eventBus.on(
    EVENT_TYPES.ASSEMBLEE_STATUS_CHANGED,
    onAssembleeStatusChanged
  )
  eventBus.on(
    EVENT_TYPES.INTERVENTION_STATUS_CHANGED,
    onInterventionStatusChanged
  )
  eventBus.on(EVENT_TYPES.SINISTRE_CREATED, onSinistreCreated)
}
