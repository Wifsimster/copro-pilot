import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

const router = Router()

router.get('/dashboard', requireAuth(), async (req, res) => {
    try {
        const db = knexDatabase.getKnex()

        const [coproprietes, coproprietaires, incidentsOuverts, prochainAG, lots, locataires, budgets, impayesResult, fondsTravaux] = await Promise.all([
            db('coproprietes').count('id as count').first(),
            db('coproprietaires').count('id as count').first(),
            db('incidents').whereIn('statut', ['ouvert', 'en_cours']).count('id as count').first(),
            db('assemblees_generales')
                .where('date', '>=', db.fn.now())
                .whereIn('statut', ['planifiee', 'convoquee'])
                .count('id as count')
                .first(),
            db('lots').count('id as count').first(),
            db('locataires').count('id as count').first(),
            db('budgets_previsionnels').count('id as count').first(),
            db('appels_fonds')
                .where('statut', 'emis')
                .sum('montant_total as total')
                .first(),
            db('fonds_travaux')
                .sum('solde as total')
                .first(),
        ])

        const recentIncidents = await db('incidents')
            .select('incidents.id', 'incidents.copropriete_id', 'incidents.titre', 'incidents.urgence', 'incidents.statut', 'incidents.date_signalement', 'coproprietes.nom as copropriete_nom')
            .leftJoin('coproprietes', 'incidents.copropriete_id', 'coproprietes.id')
            .whereIn('incidents.statut', ['ouvert', 'en_cours'])
            .orderBy('incidents.date_signalement', 'desc')
            .limit(5)

        const prochainAGs = await db('assemblees_generales')
            .select('assemblees_generales.id', 'assemblees_generales.date', 'assemblees_generales.heure', 'assemblees_generales.type', 'assemblees_generales.statut', 'coproprietes.nom as copropriete_nom')
            .leftJoin('coproprietes', 'assemblees_generales.copropriete_id', 'coproprietes.id')
            .where('assemblees_generales.date', '>=', db.fn.now())
            .whereIn('assemblees_generales.statut', ['planifiee', 'convoquee'])
            .orderBy('assemblees_generales.date', 'asc')
            .limit(5)

        res.json({
            data: {
                counts: {
                    coproprietes: Number(coproprietes.count),
                    coproprietaires: Number(coproprietaires.count),
                    incidents_ouverts: Number(incidentsOuverts.count),
                    prochaines_ag: Number(prochainAG.count),
                    lots: Number(lots.count),
                    locataires: Number(locataires.count),
                    budgets: Number(budgets.count),
                    impayes: Number(impayesResult?.total || 0),
                    fonds_travaux: Number(fondsTravaux?.total || 0),
                },
                recent_incidents: recentIncidents,
                prochaines_ag: prochainAGs,
            },
        })
    } catch (error) {
        logger.error(`[Stats] Error fetching dashboard stats: ${error.message}`)
        res.status(500).json({ error: 'Impossible de récupérer les statistiques' })
    }
})

// ---------------------------------------------------------------------------
// Syndic Dashboard — workflow-oriented endpoint
// ---------------------------------------------------------------------------

router.get('/syndic-dashboard', requireAuth(), async (req, res) => {
  try {
    const db = knexDatabase.getKnex()
    const coproprieteId = req.query.copropriete_id
      ? Number(req.query.copropriete_id)
      : null

    // Helper: optionally scope a query by copropriete_id
    const scoped = (qb, col = 'copropriete_id') => {
      if (coproprieteId) qb.where(col, coproprieteId)
      return qb
    }

    // --- Run all queries in parallel ---
    const [
      // Alerts
      criticalIncidents,
      agsSansConvocation,
      expiringContrats,
      expiringAssurances,
      expiringDiagnostics,
      impayesCount,
      expiringSyndicContrats,
      // Tasks
      upcomingInterventions,
      weekAGs,
      overdueTaches,
      draftAppels,
      pendingRelances,
      // Metrics
      countCoproprietes,
      countIncidentsOuverts,
      countIncidentsCritiques,
      sumImpayes,
      countProchainAG,
      countContratsExpirant,
      countProceduresActives,
      countSinistresOuverts,
      // Activity
      recentIncidents,
      recentPaiements,
      recentInterventions,
      recentDocuments,
    ] = await Promise.all([
      // --- ALERTS ---

      // 1. Critical/high urgency incidents
      scoped(
        db('incidents')
          .select(
            'incidents.id',
            'incidents.titre',
            'incidents.urgence',
            'incidents.statut',
            'incidents.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .leftJoin(
            'coproprietes',
            'incidents.copropriete_id',
            'coproprietes.id'
          )
          .whereIn('incidents.urgence', ['critique', 'haute'])
          .whereIn('incidents.statut', ['ouvert', 'en_cours'])
          .orderByRaw(
            "CASE incidents.urgence WHEN 'critique' THEN 0 ELSE 1 END"
          )
          .limit(10),
        'incidents.copropriete_id'
      ),

      // 2. AGs within 30 days without convocations
      scoped(
        db('assemblees_generales')
          .select(
            'assemblees_generales.id',
            'assemblees_generales.date',
            'assemblees_generales.type',
            'assemblees_generales.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .leftJoin(
            'coproprietes',
            'assemblees_generales.copropriete_id',
            'coproprietes.id'
          )
          .leftJoin(
            'convocations_ag',
            'assemblees_generales.id',
            'convocations_ag.ag_id'
          )
          .whereIn('assemblees_generales.statut', ['planifiee'])
          .whereRaw(
            "assemblees_generales.date BETWEEN NOW() AND NOW() + INTERVAL '30 days'"
          )
          .whereNull('convocations_ag.id')
          .orderBy('assemblees_generales.date', 'asc'),
        'assemblees_generales.copropriete_id'
      ),

      // 3. Contracts expiring within 30 days
      scoped(
        db('contrats')
          .select(
            'contrats.id',
            'contrats.objet',
            'contrats.date_fin',
            'contrats.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .join(
            'coproprietes',
            'contrats.copropriete_id',
            'coproprietes.id'
          )
          .where('contrats.statut', 'actif')
          .whereNotNull('contrats.date_fin')
          .whereRaw(
            "contrats.date_fin BETWEEN NOW() AND NOW() + INTERVAL '30 days'"
          ),
        'contrats.copropriete_id'
      ),

      // 4. Insurances expiring within 30 days
      scoped(
        db('assurances')
          .select(
            'assurances.id',
            'assurances.compagnie',
            'assurances.type',
            'assurances.date_fin',
            'assurances.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .join(
            'coproprietes',
            'assurances.copropriete_id',
            'coproprietes.id'
          )
          .where('assurances.statut', 'actif')
          .whereNotNull('assurances.date_fin')
          .whereRaw(
            "assurances.date_fin BETWEEN NOW() AND NOW() + INTERVAL '30 days'"
          ),
        'assurances.copropriete_id'
      ),

      // 5. Diagnostics expiring within 30 days
      scoped(
        db('diagnostics')
          .select(
            'diagnostics.id',
            'diagnostics.type',
            'diagnostics.date_validite',
            'diagnostics.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .join(
            'coproprietes',
            'diagnostics.copropriete_id',
            'coproprietes.id'
          )
          .where('diagnostics.statut', 'valide')
          .whereNotNull('diagnostics.date_validite')
          .whereRaw(
            "diagnostics.date_validite BETWEEN NOW() AND NOW() + INTERVAL '30 days'"
          ),
        'diagnostics.copropriete_id'
      ),

      // 6. Unpaid charges > 30 days
      scoped(
        db('appels_fonds')
          .count('id as count')
          .where('statut', 'emis')
          .where(
            'date_echeance',
            '<',
            db.raw("NOW() - INTERVAL '30 days'")
          )
          .first()
      ),

      // 7. Syndic contracts expiring within 3 months
      scoped(
        db('contrats_syndic')
          .select(
            'contrats_syndic.id',
            'contrats_syndic.syndic_nom',
            'contrats_syndic.date_fin',
            'contrats_syndic.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .join(
            'coproprietes',
            'contrats_syndic.copropriete_id',
            'coproprietes.id'
          )
          .where('contrats_syndic.statut', 'en_cours')
          .whereRaw(
            "contrats_syndic.date_fin BETWEEN NOW() AND NOW() + INTERVAL '3 months'"
          ),
        'contrats_syndic.copropriete_id'
      ),

      // --- TASKS ---

      // 1. Interventions this week
      scoped(
        db('interventions')
          .select(
            'interventions.id',
            'interventions.description',
            'interventions.date_prevue',
            'interventions.statut',
            'interventions.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .leftJoin(
            'coproprietes',
            'interventions.copropriete_id',
            'coproprietes.id'
          )
          .whereIn('interventions.statut', [
            'planifiee',
            'en_cours',
          ])
          .whereRaw(
            "interventions.date_prevue BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'"
          )
          .orderBy('interventions.date_prevue', 'asc')
          .limit(10),
        'interventions.copropriete_id'
      ),

      // 2. AGs this week
      scoped(
        db('assemblees_generales')
          .select(
            'assemblees_generales.id',
            'assemblees_generales.date',
            'assemblees_generales.heure',
            'assemblees_generales.type',
            'assemblees_generales.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .leftJoin(
            'coproprietes',
            'assemblees_generales.copropriete_id',
            'coproprietes.id'
          )
          .whereIn('assemblees_generales.statut', [
            'planifiee',
            'convoquee',
          ])
          .whereRaw(
            "assemblees_generales.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'"
          )
          .orderBy('assemblees_generales.date', 'asc'),
        'assemblees_generales.copropriete_id'
      ),

      // 3. Overdue annual tasks (table may not exist yet)
      scoped(
        db('taches_annuelles')
          .select(
            'taches_annuelles.id',
            'taches_annuelles.tache_label',
            'taches_annuelles.date_echeance',
            'taches_annuelles.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .leftJoin(
            'coproprietes',
            'taches_annuelles.copropriete_id',
            'coproprietes.id'
          )
          .where('taches_annuelles.statut', 'overdue')
          .orderBy('taches_annuelles.date_echeance', 'asc')
          .limit(10),
        'taches_annuelles.copropriete_id'
      ).catch(() => []),

      // 4. Draft appels de fonds
      scoped(
        db('appels_fonds')
          .select(
            'appels_fonds.id',
            'appels_fonds.trimestre',
            'appels_fonds.annee',
            'appels_fonds.montant_total',
            'appels_fonds.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .leftJoin(
            'coproprietes',
            'appels_fonds.copropriete_id',
            'coproprietes.id'
          )
          .where('appels_fonds.statut', 'brouillon')
          .orderBy('appels_fonds.annee', 'asc')
          .orderBy('appels_fonds.trimestre', 'asc')
          .limit(5)
      ),

      // 5. Pending relances
      scoped(
        db('relances')
          .select(
            'relances.id',
            'relances.type',
            'relances.montant_du',
            'relances.date_relance',
            'relances.statut',
            'relances.copropriete_id',
            'coproprietaires.nom as coproprietaire_nom',
            'coproprietaires.prenom as coproprietaire_prenom',
            'coproprietes.nom as copropriete_nom'
          )
          .leftJoin(
            'coproprietes',
            'relances.copropriete_id',
            'coproprietes.id'
          )
          .leftJoin(
            'coproprietaires',
            'relances.coproprietaire_id',
            'coproprietaires.id'
          )
          .whereIn('relances.statut', [
            'brouillon',
            'envoyee',
          ])
          .orderBy('relances.date_relance', 'desc')
          .limit(5),
        'relances.copropriete_id'
      ),

      // --- METRICS ---
      scoped(
        db('coproprietes').count('id as count').first()
      ),
      scoped(
        db('incidents')
          .whereIn('statut', ['ouvert', 'en_cours'])
          .count('id as count')
          .first()
      ),
      scoped(
        db('incidents')
          .where('urgence', 'critique')
          .whereIn('statut', ['ouvert', 'en_cours'])
          .count('id as count')
          .first()
      ),
      scoped(
        db('appels_fonds')
          .where('statut', 'emis')
          .sum('montant_total as total')
          .first()
      ),
      scoped(
        db('assemblees_generales')
          .where('date', '>=', db.fn.now())
          .whereIn('statut', ['planifiee', 'convoquee'])
          .count('id as count')
          .first()
      ),
      scoped(
        db('contrats')
          .where('statut', 'actif')
          .whereNotNull('date_fin')
          .whereRaw(
            "date_fin BETWEEN NOW() AND NOW() + INTERVAL '90 days'"
          )
          .count('id as count')
          .first()
      ),
      scoped(
        db('procedures')
          .whereIn('statut', [
            'en_preparation',
            'en_cours',
            'audience_fixee',
          ])
          .count('id as count')
          .first()
      ),
      scoped(
        db('sinistres')
          .whereIn('statut', [
            'declare',
            'en_instruction',
          ])
          .count('id as count')
          .first()
      ),

      // --- ACTIVITY (recent 5 each) ---

      // Recent incidents
      scoped(
        db('incidents')
          .select(
            'incidents.id',
            'incidents.titre',
            'incidents.date_signalement as date',
            'incidents.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .leftJoin(
            'coproprietes',
            'incidents.copropriete_id',
            'coproprietes.id'
          )
          .orderBy('incidents.date_signalement', 'desc')
          .limit(5),
        'incidents.copropriete_id'
      ),

      // Recent paiements
      scoped(
        db('paiements')
          .select(
            'paiements.id',
            'paiements.montant',
            'paiements.date_paiement as date',
            'coproprietaires.nom as coproprietaire_nom',
            'coproprietaires.prenom as coproprietaire_prenom'
          )
          .leftJoin(
            'coproprietaires',
            'paiements.coproprietaire_id',
            'coproprietaires.id'
          )
          .orderBy('paiements.date_paiement', 'desc')
          .limit(5),
        'paiements.coproprietaire_id'
      ),

      // Recent interventions (terminee)
      scoped(
        db('interventions')
          .select(
            'interventions.id',
            'interventions.description',
            'interventions.date_realisation as date',
            'interventions.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .leftJoin(
            'coproprietes',
            'interventions.copropriete_id',
            'coproprietes.id'
          )
          .where('interventions.statut', 'terminee')
          .orderBy('interventions.date_realisation', 'desc')
          .limit(5),
        'interventions.copropriete_id'
      ),

      // Recent documents
      scoped(
        db('documents')
          .select(
            'documents.id',
            'documents.nom',
            'documents.categorie',
            'documents.created_at as date',
            'documents.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .leftJoin(
            'coproprietes',
            'documents.copropriete_id',
            'coproprietes.id'
          )
          .orderBy('documents.created_at', 'desc')
          .limit(5),
        'documents.copropriete_id'
      ),
    ])

    // --- Build alerts array ---
    const alerts = []

    for (const inc of criticalIncidents) {
      alerts.push({
        id: `incident-${inc.id}`,
        severity: inc.urgence === 'critique' ? 'critique' : 'haute',
        category: 'incident',
        title: inc.titre,
        description: `Incident ${inc.statut === 'en_cours' ? 'en cours' : 'ouvert'}`,
        link: `/travaux?copropriete=${inc.copropriete_id}`,
        copropriete_nom: inc.copropriete_nom,
      })
    }

    for (const ag of agsSansConvocation) {
      const daysUntil = Math.ceil(
        (new Date(ag.date) - new Date()) / 86400000
      )
      alerts.push({
        id: `ag-conv-${ag.id}`,
        severity: daysUntil <= 21 ? 'critique' : 'haute',
        category: 'ag',
        title: `AG ${ag.type} sans convocation`,
        description: `Dans ${daysUntil} jours${daysUntil <= 21 ? ' — delai legal depasse' : ''}`,
        link: `/assemblees/${ag.id}`,
        copropriete_nom: ag.copropriete_nom,
        date_echeance: ag.date,
      })
    }

    for (const c of expiringContrats) {
      const daysUntil = Math.ceil(
        (new Date(c.date_fin) - new Date()) / 86400000
      )
      alerts.push({
        id: `contrat-${c.id}`,
        severity: daysUntil <= 15 ? 'haute' : 'moyenne',
        category: 'contrat',
        title: `Contrat "${c.objet}" expire bientot`,
        description: `Expire dans ${daysUntil} jours`,
        link: '/contrats',
        copropriete_nom: c.copropriete_nom,
        date_echeance: c.date_fin,
      })
    }

    for (const a of expiringAssurances) {
      const daysUntil = Math.ceil(
        (new Date(a.date_fin) - new Date()) / 86400000
      )
      alerts.push({
        id: `assurance-${a.id}`,
        severity: daysUntil <= 15 ? 'haute' : 'moyenne',
        category: 'assurance',
        title: `Assurance ${a.type} expire bientot`,
        description: `${a.compagnie} — expire dans ${daysUntil} jours`,
        link: '/assurances',
        copropriete_nom: a.copropriete_nom,
        date_echeance: a.date_fin,
      })
    }

    for (const d of expiringDiagnostics) {
      const daysUntil = Math.ceil(
        (new Date(d.date_validite) - new Date()) / 86400000
      )
      alerts.push({
        id: `diagnostic-${d.id}`,
        severity: daysUntil <= 15 ? 'haute' : 'moyenne',
        category: 'diagnostic',
        title: `Diagnostic ${d.type.toUpperCase()} expire bientot`,
        description: `Expire dans ${daysUntil} jours`,
        link: `/coproprietes/${d.copropriete_id}`,
        copropriete_nom: d.copropriete_nom,
        date_echeance: d.date_validite,
      })
    }

    if (Number(impayesCount?.count || 0) > 0) {
      alerts.push({
        id: 'impayes-overdue',
        severity: 'haute',
        category: 'impaye',
        title: `${impayesCount.count} appel(s) de fonds impaye(s)`,
        description: 'Charges impayees depuis plus de 30 jours',
        link: '/charges',
      })
    }

    for (const cs of expiringSyndicContrats) {
      const daysUntil = Math.ceil(
        (new Date(cs.date_fin) - new Date()) / 86400000
      )
      alerts.push({
        id: `contrat-syndic-${cs.id}`,
        severity: daysUntil <= 60 ? 'haute' : 'moyenne',
        category: 'contrat_syndic',
        title: `Contrat syndic ${cs.syndic_nom} expire bientot`,
        description: `Expire dans ${Math.ceil(daysUntil / 30)} mois — pensez a la mise en concurrence`,
        link: '/contrats-syndic',
        copropriete_nom: cs.copropriete_nom,
        date_echeance: cs.date_fin,
      })
    }

    // Sort alerts: critique first, then haute, then moyenne
    const severityOrder = { critique: 0, haute: 1, moyenne: 2, info: 3 }
    alerts.sort(
      (a, b) =>
        (severityOrder[a.severity] ?? 9) -
        (severityOrder[b.severity] ?? 9)
    )

    // --- Build tasks array ---
    const tasks = []

    for (const intv of upcomingInterventions) {
      const isToday =
        new Date(intv.date_prevue).toDateString() ===
        new Date().toDateString()
      tasks.push({
        id: `intervention-${intv.id}`,
        type: 'intervention',
        title: intv.description || 'Intervention planifiee',
        description: intv.statut === 'en_cours' ? 'En cours' : 'Planifiee',
        link: '/travaux',
        copropriete_nom: intv.copropriete_nom,
        date: intv.date_prevue,
        priority: isToday ? 'haute' : 'normale',
      })
    }

    for (const ag of weekAGs) {
      const isToday =
        new Date(ag.date).toDateString() ===
        new Date().toDateString()
      tasks.push({
        id: `ag-${ag.id}`,
        type: 'ag',
        title: `AG ${ag.type}${ag.heure ? ` a ${ag.heure}` : ''}`,
        description: new Date(ag.date).toLocaleDateString('fr-FR'),
        link: `/assemblees/${ag.id}`,
        copropriete_nom: ag.copropriete_nom,
        date: ag.date,
        priority: isToday ? 'haute' : 'normale',
      })
    }

    for (const t of overdueTaches) {
      tasks.push({
        id: `cycle-${t.id}`,
        type: 'cycle_annuel',
        title: t.tache_label,
        description: 'Tache en retard',
        link: `/coproprietes/${t.copropriete_id}`,
        copropriete_nom: t.copropriete_nom,
        date: t.date_echeance,
        priority: 'haute',
      })
    }

    for (const af of draftAppels) {
      tasks.push({
        id: `appel-${af.id}`,
        type: 'appel_fonds',
        title: `Appel de fonds T${af.trimestre} ${af.annee}`,
        description: `${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(af.montant_total)} — brouillon`,
        link: '/charges',
        copropriete_nom: af.copropriete_nom,
        priority: 'normale',
      })
    }

    for (const r of pendingRelances) {
      tasks.push({
        id: `relance-${r.id}`,
        type: 'relance',
        title: `Relance ${r.type} — ${r.coproprietaire_nom} ${r.coproprietaire_prenom}`,
        description: `${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(r.montant_du)} — ${r.statut}`,
        link: '/contentieux',
        copropriete_nom: r.copropriete_nom,
        date: r.date_relance,
        priority: r.type === 'contentieux' ? 'haute' : 'normale',
      })
    }

    // Sort tasks: haute priority first, then by date
    tasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority === 'haute' ? -1 : 1
      }
      if (a.date && b.date) {
        return new Date(a.date) - new Date(b.date)
      }
      return 0
    })

    // --- Build activity array ---
    const activityItems = []

    for (const inc of recentIncidents) {
      activityItems.push({
        id: `act-incident-${inc.id}`,
        type: 'incident',
        title: inc.titre,
        description: 'Incident signale',
        link: `/travaux?copropriete=${inc.copropriete_id}`,
        copropriete_nom: inc.copropriete_nom,
        date: inc.date,
      })
    }

    for (const p of recentPaiements) {
      activityItems.push({
        id: `act-paiement-${p.id}`,
        type: 'paiement',
        title: `Paiement de ${p.coproprietaire_nom} ${p.coproprietaire_prenom}`,
        description: new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        }).format(p.montant),
        link: '/charges',
        date: p.date,
      })
    }

    for (const intv of recentInterventions) {
      activityItems.push({
        id: `act-intervention-${intv.id}`,
        type: 'intervention',
        title: intv.description || 'Intervention terminee',
        description: 'Intervention realisee',
        link: '/travaux',
        copropriete_nom: intv.copropriete_nom,
        date: intv.date,
      })
    }

    for (const doc of recentDocuments) {
      activityItems.push({
        id: `act-document-${doc.id}`,
        type: 'document',
        title: doc.nom,
        description: `Document ${doc.categorie}`,
        link: '/documents',
        copropriete_nom: doc.copropriete_nom,
        date: doc.date,
      })
    }

    // Sort by date desc, take top 10
    activityItems.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )
    const activity = activityItems.slice(0, 10)

    // --- Build metrics ---
    const metrics = {
      coproprietes: Number(countCoproprietes?.count || 0),
      incidents_ouverts: Number(
        countIncidentsOuverts?.count || 0
      ),
      incidents_critiques: Number(
        countIncidentsCritiques?.count || 0
      ),
      impayes: Number(sumImpayes?.total || 0),
      prochaines_ag: Number(countProchainAG?.count || 0),
      contrats_expirant: Number(
        countContratsExpirant?.count || 0
      ),
      procedures_actives: Number(
        countProceduresActives?.count || 0
      ),
      sinistres_ouverts: Number(
        countSinistresOuverts?.count || 0
      ),
    }

    res.json({
      data: { alerts, tasks, metrics, activity },
    })
  } catch (error) {
    logger.error(
      `[Stats] Error fetching syndic dashboard: ${error.message}`
    )
    res.status(500).json({
      error:
        'Impossible de recuperer le tableau de bord',
    })
  }
})

export default router
