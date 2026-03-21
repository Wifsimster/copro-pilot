import cron from 'node-cron'
import knexDatabase from '../config/knex-database.js'
import { NotificationModel } from '../models/Notification.js'
import { tacheGeneratorService } from './TacheGeneratorService.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

class WorkflowSchedulerService {
  constructor() {
    this.jobs = []
  }

  start() {
    logger.info('[WorkflowScheduler] Starting scheduled jobs...')

    // Daily at 8:00 — check all expiration alerts
    const dailyJob = cron.schedule('0 8 * * *', async () => {
      logger.info('[WorkflowScheduler] Running daily checks...')
      try {
        await Promise.allSettled([
          this.checkUnpaidCharges(),
          this.checkContractExpirations(),
          this.checkInsuranceExpirations(),
          this.checkDiagnosticExpirations(),
          this.checkAgPreparation(),
          this.checkSyndicContractRenewal(),
          tacheGeneratorService.generateAll().catch(err =>
            logger.error(
              `[WorkflowScheduler] TacheGenerator error: ${err.message}`
            )
          ),
        ])
        logger.info('[WorkflowScheduler] Daily checks completed')
      } catch (error) {
        logger.error(
          `[WorkflowScheduler] Daily check error: ${error.message}`
        )
      }
    })

    this.jobs.push(dailyJob)
    logger.info(
      '[WorkflowScheduler] Scheduled jobs started (daily at 08:00)'
    )
  }

  stop() {
    this.jobs.forEach((job) => job.stop())
    this.jobs = []
    logger.info('[WorkflowScheduler] All jobs stopped')
  }

  // --- Helpers ---

  async _getSyndicUsers() {
    const db = getDb()
    return db('user').whereIn('role', ['syndic', 'user'])
  }

  async _createNotificationForSyndics(data) {
    const users = await this._getSyndicUsers()
    const created = []
    for (const user of users) {
      try {
        const notif = await NotificationModel.create({
          ...data,
          user_id: user.id,
        })
        created.push(notif)
      } catch (error) {
        logger.error(
          `[WorkflowScheduler] Failed to create notification for user ${user.id}: ${error.message}`
        )
      }
    }
    return created
  }

  // --- Job: Unpaid charges ---

  async checkUnpaidCharges() {
    try {
      const db = getDb()
      const impayes = await db('appels_fonds_lignes')
        .select(
          'appels_fonds_lignes.coproprietaire_id',
          'coproprietaires.nom',
          'coproprietaires.prenom',
          'coproprietes.id as copropriete_id',
          'coproprietes.nom as copropriete_nom'
        )
        .join(
          'appels_fonds',
          'appels_fonds_lignes.appel_fonds_id',
          'appels_fonds.id'
        )
        .join(
          'coproprietes',
          'appels_fonds.copropriete_id',
          'coproprietes.id'
        )
        .leftJoin(
          'coproprietaires',
          'appels_fonds_lignes.coproprietaire_id',
          'coproprietaires.id'
        )
        .where('appels_fonds.statut', 'emis')
        .where(
          'appels_fonds.date_echeance',
          '<',
          db.raw("NOW() - INTERVAL '30 days'")
        )
        .groupBy(
          'appels_fonds_lignes.coproprietaire_id',
          'coproprietaires.nom',
          'coproprietaires.prenom',
          'coproprietes.id',
          'coproprietes.nom'
        )
        .havingRaw(
          'SUM(appels_fonds_lignes.montant) > 0'
        )

      if (impayes.length > 0) {
        await this._createNotificationForSyndics({
          type: 'paiement',
          titre: `${impayes.length} coproprietaire(s) avec charges impayees`,
          message: `Des charges sont impayees depuis plus de 30 jours. Verifiez les paiements en attente.`,
          lien: '/charges',
        })
        logger.info(
          `[WorkflowScheduler] Unpaid charges: ${impayes.length} found`
        )
      }
    } catch (error) {
      logger.error(
        `[WorkflowScheduler] checkUnpaidCharges error: ${error.message}`
      )
    }
  }

  // --- Job: Contract expirations ---

  async checkContractExpirations() {
    try {
      const db = getDb()
      const thresholds = [
        { days: 30, label: '30 jours' },
        { days: 60, label: '60 jours' },
        { days: 90, label: '90 jours' },
      ]

      for (const { days, label } of thresholds) {
        const expiring = await db('contrats')
          .select(
            'contrats.objet',
            'contrats.date_fin',
            'coproprietes.nom as copropriete_nom',
            'coproprietes.id as copropriete_id'
          )
          .join(
            'coproprietes',
            'contrats.copropriete_id',
            'coproprietes.id'
          )
          .where('contrats.statut', 'actif')
          .whereNotNull('contrats.date_fin')
          .whereRaw(
            'contrats.date_fin BETWEEN NOW() AND NOW() + ?::interval',
            [`${days} days`]
          )
          // Exclude those already within a tighter window
          .modify((qb) => {
            if (days > 30) {
              qb.whereRaw(
                'contrats.date_fin > NOW() + ?::interval',
                [`${days - 30} days`]
              )
            }
          })

        for (const contrat of expiring) {
          await this._createNotificationForSyndics({
            type: 'general',
            copropriete_id: contrat.copropriete_id,
            titre: `Contrat "${contrat.objet}" expire dans ${label}`,
            message: `${contrat.copropriete_nom} — le contrat "${contrat.objet}" arrive a echeance le ${new Date(contrat.date_fin).toLocaleDateString('fr-FR')}.`,
            lien: '/contrats',
          })
        }

        if (expiring.length > 0) {
          logger.info(
            `[WorkflowScheduler] Contracts expiring in ${label}: ${expiring.length}`
          )
        }
      }
    } catch (error) {
      logger.error(
        `[WorkflowScheduler] checkContractExpirations error: ${error.message}`
      )
    }
  }

  // --- Job: Insurance expirations ---

  async checkInsuranceExpirations() {
    try {
      const db = getDb()
      const thresholds = [
        { days: 30, label: '30 jours' },
        { days: 60, label: '60 jours' },
        { days: 90, label: '90 jours' },
      ]

      for (const { days, label } of thresholds) {
        const expiring = await db('assurances')
          .select(
            'assurances.compagnie',
            'assurances.type',
            'assurances.date_fin',
            'coproprietes.nom as copropriete_nom',
            'coproprietes.id as copropriete_id'
          )
          .join(
            'coproprietes',
            'assurances.copropriete_id',
            'coproprietes.id'
          )
          .where('assurances.statut', 'actif')
          .whereNotNull('assurances.date_fin')
          .whereRaw(
            'assurances.date_fin BETWEEN NOW() AND NOW() + ?::interval',
            [`${days} days`]
          )
          .modify((qb) => {
            if (days > 30) {
              qb.whereRaw(
                'assurances.date_fin > NOW() + ?::interval',
                [`${days - 30} days`]
              )
            }
          })

        for (const assurance of expiring) {
          await this._createNotificationForSyndics({
            type: 'general',
            copropriete_id: assurance.copropriete_id,
            titre: `Assurance ${assurance.type} expire dans ${label}`,
            message: `${assurance.copropriete_nom} — assurance ${assurance.compagnie} (${assurance.type}) expire le ${new Date(assurance.date_fin).toLocaleDateString('fr-FR')}.`,
            lien: '/assurances',
          })
        }
      }
    } catch (error) {
      logger.error(
        `[WorkflowScheduler] checkInsuranceExpirations error: ${error.message}`
      )
    }
  }

  // --- Job: Diagnostic expirations ---

  async checkDiagnosticExpirations() {
    try {
      const db = getDb()
      const thresholds = [
        { days: 30, label: '30 jours' },
        { days: 90, label: '90 jours' },
      ]

      for (const { days, label } of thresholds) {
        const expiring = await db('diagnostics')
          .select(
            'diagnostics.type',
            'diagnostics.date_validite',
            'coproprietes.nom as copropriete_nom',
            'coproprietes.id as copropriete_id'
          )
          .join(
            'coproprietes',
            'diagnostics.copropriete_id',
            'coproprietes.id'
          )
          .where('diagnostics.statut', 'valide')
          .whereNotNull('diagnostics.date_validite')
          .whereRaw(
            'diagnostics.date_validite BETWEEN NOW() AND NOW() + ?::interval',
            [`${days} days`]
          )
          .modify((qb) => {
            if (days > 30) {
              qb.whereRaw(
                'diagnostics.date_validite > NOW() + ?::interval',
                [`${days - 30} days`]
              )
            }
          })

        for (const diag of expiring) {
          await this._createNotificationForSyndics({
            type: 'general',
            copropriete_id: diag.copropriete_id,
            titre: `Diagnostic ${diag.type.toUpperCase()} expire dans ${label}`,
            message: `${diag.copropriete_nom} — le diagnostic ${diag.type.toUpperCase()} expire le ${new Date(diag.date_validite).toLocaleDateString('fr-FR')}. Pensez a le renouveler.`,
            lien: `/coproprietes/${diag.copropriete_id}`,
          })
        }
      }
    } catch (error) {
      logger.error(
        `[WorkflowScheduler] checkDiagnosticExpirations error: ${error.message}`
      )
    }
  }

  // --- Job: AG preparation ---

  async checkAgPreparation() {
    try {
      const db = getDb()

      // AGs within 30 days without convocations sent
      const agsSansConvocation = await db('assemblees_generales')
        .select(
          'assemblees_generales.id',
          'assemblees_generales.date',
          'assemblees_generales.type',
          'coproprietes.nom as copropriete_nom',
          'coproprietes.id as copropriete_id'
        )
        .join(
          'coproprietes',
          'assemblees_generales.copropriete_id',
          'coproprietes.id'
        )
        .leftJoin(
          'convocations_ag',
          'assemblees_generales.id',
          'convocations_ag.ag_id'
        )
        .whereIn('assemblees_generales.statut', [
          'planifiee',
        ])
        .whereRaw(
          "assemblees_generales.date BETWEEN NOW() AND NOW() + INTERVAL '30 days'"
        )
        .whereNull('convocations_ag.id')

      for (const ag of agsSansConvocation) {
        const daysUntil = Math.ceil(
          (new Date(ag.date) - new Date()) / 86400000
        )
        const urgence = daysUntil <= 21 ? 'URGENT — ' : ''
        await this._createNotificationForSyndics({
          type: 'ag',
          copropriete_id: ag.copropriete_id,
          titre: `${urgence}AG ${ag.type} dans ${daysUntil} jours sans convocation`,
          message: `${ag.copropriete_nom} — l'AG du ${new Date(ag.date).toLocaleDateString('fr-FR')} n'a pas encore de convocation envoyee.${daysUntil <= 21 ? ' Le delai legal de 21 jours est depasse !' : ''}`,
          lien: `/assemblees/${ag.id}`,
        })
      }

      if (agsSansConvocation.length > 0) {
        logger.info(
          `[WorkflowScheduler] AG without convocations: ${agsSansConvocation.length}`
        )
      }
    } catch (error) {
      logger.error(
        `[WorkflowScheduler] checkAgPreparation error: ${error.message}`
      )
    }
  }

  // --- Job: Syndic contract renewal ---

  async checkSyndicContractRenewal() {
    try {
      const db = getDb()
      const thresholds = [
        { months: 3, label: '3 mois' },
        { months: 6, label: '6 mois' },
      ]

      for (const { months, label } of thresholds) {
        const expiring = await db('contrats_syndic')
          .select(
            'contrats_syndic.syndic_nom',
            'contrats_syndic.date_fin',
            'coproprietes.nom as copropriete_nom',
            'coproprietes.id as copropriete_id'
          )
          .join(
            'coproprietes',
            'contrats_syndic.copropriete_id',
            'coproprietes.id'
          )
          .where('contrats_syndic.statut', 'en_cours')
          .whereRaw(
            'contrats_syndic.date_fin BETWEEN NOW() AND NOW() + ?::interval',
            [`${months} months`]
          )
          .modify((qb) => {
            if (months > 3) {
              qb.whereRaw(
                'contrats_syndic.date_fin > NOW() + ?::interval',
                [`${months - 3} months`]
              )
            }
          })

        for (const contrat of expiring) {
          await this._createNotificationForSyndics({
            type: 'general',
            copropriete_id: contrat.copropriete_id,
            titre: `Contrat syndic expire dans ${label}`,
            message: `${contrat.copropriete_nom} — le contrat avec ${contrat.syndic_nom} expire le ${new Date(contrat.date_fin).toLocaleDateString('fr-FR')}. Pensez a lancer la mise en concurrence.`,
            lien: '/contrats-syndic',
          })
        }
      }
    } catch (error) {
      logger.error(
        `[WorkflowScheduler] checkSyndicContractRenewal error: ${error.message}`
      )
    }
  }
}

export const workflowSchedulerService =
  new WorkflowSchedulerService()
