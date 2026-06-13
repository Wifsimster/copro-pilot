import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class StatsModel {
  /**
   * Overview counters + recent activity for the generic dashboard endpoint.
   */
  static async getDashboardOverview() {
    const db = getDb()

    const [
      coproprietes,
      coproprietaires,
      incidentsOuverts,
      prochainAG,
      lots,
      locataires,
      budgets,
      impayesResult,
      fondsTravaux,
    ] = await Promise.all([
      db('coproprietes').count('id as count').first(),
      db('coproprietaires').count('id as count').first(),
      db('incidents')
        .whereIn('statut', ['ouvert', 'en_cours'])
        .count('id as count')
        .first(),
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
      db('fonds_travaux').sum('solde as total').first(),
    ])

    const recentIncidents = await db('incidents')
      .select(
        'incidents.id',
        'incidents.copropriete_id',
        'incidents.titre',
        'incidents.urgence',
        'incidents.statut',
        'incidents.date_signalement',
        'coproprietes.nom as copropriete_nom'
      )
      .leftJoin('coproprietes', 'incidents.copropriete_id', 'coproprietes.id')
      .whereIn('incidents.statut', ['ouvert', 'en_cours'])
      .orderBy('incidents.date_signalement', 'desc')
      .limit(5)

    const prochainAGs = await db('assemblees_generales')
      .select(
        'assemblees_generales.id',
        'assemblees_generales.date',
        'assemblees_generales.heure',
        'assemblees_generales.type',
        'assemblees_generales.statut',
        'coproprietes.nom as copropriete_nom'
      )
      .leftJoin(
        'coproprietes',
        'assemblees_generales.copropriete_id',
        'coproprietes.id'
      )
      .where('assemblees_generales.date', '>=', db.fn.now())
      .whereIn('assemblees_generales.statut', ['planifiee', 'convoquee'])
      .orderBy('assemblees_generales.date', 'asc')
      .limit(5)

    return {
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
    }
  }

  /**
   * Raw datasets backing the workflow-oriented syndic dashboard. All datasets
   * are optionally scoped to a single copropriété. Transformation into
   * alerts/tasks/activity/metrics happens in the service layer.
   */
  static async getSyndicDashboardData(coproprieteId = null) {
    const db = getDb()

    // Optionally scope a query by copropriete_id
    const scoped = (qb, col = 'copropriete_id') => {
      if (coproprieteId) qb.where(col, coproprieteId)
      return qb
    }

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
      // Enhanced stats
      tauxRecouvrementData,
      impayesEvolution,
      incidentsParStatut,
      prochainEcheances,
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
          .join('coproprietes', 'contrats.copropriete_id', 'coproprietes.id')
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
          .join('coproprietes', 'assurances.copropriete_id', 'coproprietes.id')
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
          .join('coproprietes', 'diagnostics.copropriete_id', 'coproprietes.id')
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
          .where('date_echeance', '<', db.raw("NOW() - INTERVAL '30 days'"))
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
          .whereIn('interventions.statut', ['planifiee', 'en_cours'])
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
          .whereIn('assemblees_generales.statut', ['planifiee', 'convoquee'])
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
          .whereIn('relances.statut', ['brouillon', 'envoyee'])
          .orderBy('relances.date_relance', 'desc')
          .limit(5),
        'relances.copropriete_id'
      ),

      // --- METRICS ---
      scoped(db('coproprietes').count('id as count').first()),
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
          .whereRaw("date_fin BETWEEN NOW() AND NOW() + INTERVAL '90 days'")
          .count('id as count')
          .first()
      ),
      scoped(
        db('procedures')
          .whereIn('statut', ['en_preparation', 'en_cours', 'audience_fixee'])
          .count('id as count')
          .first()
      ),
      scoped(
        db('sinistres')
          .whereIn('statut', ['declare', 'en_instruction'])
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

      // --- ENHANCED STATS ---

      // Taux de recouvrement: total_paye / total_appele
      (async () => {
        const appelQuery = scoped(
          db('appels_fonds')
            .whereIn('statut', ['emis', 'cloture'])
            .sum('montant_total as total_appele')
            .first()
        )
        const payeQuery = scoped(
          db('paiements').sum('montant as total_paye').first(),
          'coproprietaire_id'
        )
        const [appele, paye] = await Promise.all([appelQuery, payeQuery])
        return {
          total_appele: parseFloat(appele?.total_appele || 0),
          total_paye: parseFloat(paye?.total_paye || 0),
        }
      })(),

      // Impayes evolution: last 6 months total impayes per month
      (async () => {
        const rows = await db.raw(
          `
          SELECT
            to_char(date_trunc('month', af.date_echeance), 'YYYY-MM') AS mois,
            COALESCE(SUM(af.montant_total), 0)
              - COALESCE(SUM(p.total_paye), 0) AS impayes
          FROM appels_fonds af
          LEFT JOIN (
            SELECT appel_fonds_id, SUM(montant) AS total_paye
            FROM paiements
            GROUP BY appel_fonds_id
          ) p ON p.appel_fonds_id = af.id
          WHERE af.statut = 'emis'
            AND af.date_echeance >= date_trunc('month', NOW()) - INTERVAL '5 months'
            AND af.date_echeance < date_trunc('month', NOW()) + INTERVAL '1 month'
            ${coproprieteId ? 'AND af.copropriete_id = ?' : ''}
          GROUP BY date_trunc('month', af.date_echeance)
          ORDER BY mois ASC
        `,
          coproprieteId ? [coproprieteId] : []
        )
        return rows.rows || []
      })(),

      // Incidents par statut
      (async () => {
        const qb = db('incidents')
          .select('statut')
          .count('id as count')
          .groupBy('statut')
        if (coproprieteId) qb.where('copropriete_id', coproprieteId)
        return qb
      })(),

      // Prochaines echeances: next 5 upcoming appel_fonds echeances
      scoped(
        db('appels_fonds')
          .select(
            'appels_fonds.id',
            'appels_fonds.trimestre',
            'appels_fonds.annee',
            'appels_fonds.montant_total',
            'appels_fonds.date_echeance',
            'appels_fonds.copropriete_id',
            'coproprietes.nom as copropriete_nom'
          )
          .leftJoin(
            'coproprietes',
            'appels_fonds.copropriete_id',
            'coproprietes.id'
          )
          .where('appels_fonds.statut', 'emis')
          .where('appels_fonds.date_echeance', '>=', db.fn.now())
          .orderBy('appels_fonds.date_echeance', 'asc')
          .limit(5)
      ),
    ])

    return {
      criticalIncidents,
      agsSansConvocation,
      expiringContrats,
      expiringAssurances,
      expiringDiagnostics,
      impayesCount,
      expiringSyndicContrats,
      upcomingInterventions,
      weekAGs,
      overdueTaches,
      draftAppels,
      pendingRelances,
      countCoproprietes,
      countIncidentsOuverts,
      countIncidentsCritiques,
      sumImpayes,
      countProchainAG,
      countContratsExpirant,
      countProceduresActives,
      countSinistresOuverts,
      recentIncidents,
      recentPaiements,
      recentInterventions,
      recentDocuments,
      tauxRecouvrementData,
      impayesEvolution,
      incidentsParStatut,
      prochainEcheances,
    }
  }
}
