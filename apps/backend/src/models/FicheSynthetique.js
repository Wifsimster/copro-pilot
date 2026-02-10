import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class FicheSynthetiqueModel {
  static async getForCopropriete(coproprieteId) {
    const db = getDb()

    // Run all queries in parallel
    const [
      copropriete,
      lotsStats,
      lotsByType,
      coproprietairesCount,
      budgetActuel,
      postesDepenses,
      impayesTotal,
      fondsTravaux,
      diagnostics,
      incidentsEnCours,
      prochaineAG,
    ] = await Promise.all([
      // 1. Copropriete info
      db('coproprietes').where('id', coproprieteId).first(),

      // 2. Lots stats
      db('lots')
        .where('copropriete_id', coproprieteId)
        .select(
          db.raw('count(*) as total'),
          db.raw('sum(tantiemes) as total_tantiemes')
        )
        .first(),

      // 3. Lots by type
      db('lots')
        .where('copropriete_id', coproprieteId)
        .select('type')
        .count('* as count')
        .groupBy('type'),

      // 4. Distinct coproprietaires count
      db('lots')
        .where('copropriete_id', coproprieteId)
        .whereNotNull('coproprietaire_id')
        .countDistinct('coproprietaire_id as count')
        .first(),

      // 5. Current year budget
      db('budgets_previsionnels')
        .where('copropriete_id', coproprieteId)
        .orderBy('annee', 'desc')
        .first(),

      // 6. Postes de dépenses for latest budget (will use budget ID after)
      db('budgets_previsionnels')
        .where('copropriete_id', coproprieteId)
        .orderBy('annee', 'desc')
        .first()
        .then(budget => {
          if (!budget) return []
          return db('postes_depenses')
            .where('budget_id', budget.id)
            .orderBy('categorie', 'asc')
        }),

      // 7. Impayés (appels de fonds émis non payés)
      db('appels_fonds')
        .where('copropriete_id', coproprieteId)
        .where('statut', 'emis')
        .sum('montant_total as total')
        .first(),

      // 8. Fonds travaux total
      db('fonds_travaux')
        .where('copropriete_id', coproprieteId)
        .sum('solde as total')
        .first(),

      // 9. Diagnostics
      db('diagnostics')
        .where('copropriete_id', coproprieteId)
        .select('type', 'statut', 'date_realisation', 'date_validite')
        .orderBy('type', 'asc'),

      // 10. Incidents en cours
      db('incidents')
        .where('copropriete_id', coproprieteId)
        .whereIn('statut', ['ouvert', 'en_cours'])
        .count('* as count')
        .first(),

      // 11. Prochaine AG
      db('assemblees_generales')
        .where('copropriete_id', coproprieteId)
        .where('date', '>=', db.fn.now())
        .orderBy('date', 'asc')
        .first(),
    ])

    if (!copropriete) return null

    return {
      identification: {
        nom: copropriete.nom,
        adresse: copropriete.adresse,
        code_postal: copropriete.code_postal,
        ville: copropriete.ville,
        numero_immatriculation: copropriete.numero_immatriculation,
        date_creation: copropriete.date_creation,
        nombre_batiments: copropriete.nombre_batiments || 0,
        nombre_ascenseurs: copropriete.nombre_ascenseurs || 0,
        periode_construction: copropriete.periode_construction,
        type_chauffage: copropriete.type_chauffage,
        energie_chauffage: copropriete.energie_chauffage,
      },
      lots: {
        total: Number(lotsStats?.total || 0),
        total_tantiemes: Number(lotsStats?.total_tantiemes || 0),
        par_type: lotsByType.map(l => ({ type: l.type, count: Number(l.count) })),
        nombre_coproprietaires: Number(coproprietairesCount?.count || 0),
      },
      finances: {
        budget_previsionnel: budgetActuel
          ? {
              annee: budgetActuel.annee,
              montant_total: Number(budgetActuel.montant_total || 0),
              statut: budgetActuel.statut,
            }
          : null,
        postes_depenses: postesDepenses.map(p => ({
          nom: p.nom,
          categorie: p.categorie,
          montant_prevu: Number(p.montant_prevu || 0),
          montant_reel: Number(p.montant_reel || 0),
        })),
        impayes: Number(impayesTotal?.total || 0),
        fonds_travaux: Number(fondsTravaux?.total || 0),
      },
      diagnostics: diagnostics.map(d => ({
        type: d.type,
        statut: d.statut,
        date_realisation: d.date_realisation,
        date_validite: d.date_validite,
      })),
      contentieux: {
        incidents_en_cours: Number(incidentsEnCours?.count || 0),
      },
      prochaine_ag: prochaineAG
        ? {
            date: prochaineAG.date,
            type: prochaineAG.type,
            statut: prochaineAG.statut,
          }
        : null,
    }
  }
}
