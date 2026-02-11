import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class ComptabiliteReglementaireModel {
  // ─── Exercices comptables ───────────────────────────────────

  static async getExercicesByCopropriete(coproprieteId) {
    const db = getDb()
    return db('exercices_comptables')
      .where('copropriete_id', coproprieteId)
      .orderBy('annee', 'desc')
  }

  static async getExerciceById(id) {
    const db = getDb()
    return db('exercices_comptables').where('id', id).first()
  }

  static async createExercice(data) {
    const db = getDb()
    const [result] = await db('exercices_comptables')
      .insert({
        copropriete_id: data.copropriete_id,
        annee: data.annee,
        date_debut: data.date_debut,
        date_fin: data.date_fin,
        statut: data.statut || 'ouvert',
        notes: data.notes || null,
      })
      .returning('*')
    return result
  }

  static async updateExercice(id, data) {
    const db = getDb()
    const [result] = await db('exercices_comptables')
      .where('id', id)
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*')
    return result
  }

  static async clotureExercice(id) {
    const db = getDb()
    const [result] = await db('exercices_comptables')
      .where('id', id)
      .update({
        statut: 'cloture',
        date_cloture: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning('*')
    return result
  }

  // ─── Plan comptable ────────────────────────────────────────

  static async getPlanComptable(coproprieteId) {
    const db = getDb()
    return db('plan_comptable')
      .where('copropriete_id', coproprieteId)
      .orderBy('code', 'asc')
  }

  static async getCompte(coproprieteId, code) {
    const db = getDb()
    return db('plan_comptable')
      .where({ copropriete_id: coproprieteId, code })
      .first()
  }

  static async createCompte(data) {
    const db = getDb()
    const [result] = await db('plan_comptable')
      .insert({
        copropriete_id: data.copropriete_id,
        code: data.code,
        libelle: data.libelle,
        classe: data.classe,
        type: data.type,
        actif: data.actif !== undefined ? data.actif : true,
      })
      .returning('*')
    return result
  }

  static async updateCompte(id, data) {
    const db = getDb()
    const [result] = await db('plan_comptable')
      .where('id', id)
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*')
    return result
  }

  // ─── Ecritures comptables ──────────────────────────────────

  static async getEcrituresByExercice(exerciceId) {
    const db = getDb()
    return db('ecritures_comptables')
      .where('exercice_id', exerciceId)
      .orderBy('date_ecriture', 'asc')
  }

  static async getEcrituresByCompte(coproprieteId, compteCode, exerciceId) {
    const db = getDb()
    const query = db('ecritures_comptables')
      .where({ copropriete_id: coproprieteId, compte_code: compteCode })
      .orderBy('date_ecriture', 'asc')
    if (exerciceId) {
      query.andWhere('exercice_id', exerciceId)
    }
    return query
  }

  static async createEcriture(data) {
    const db = getDb()
    const [result] = await db('ecritures_comptables')
      .insert({
        exercice_id: data.exercice_id,
        copropriete_id: data.copropriete_id,
        date_ecriture: data.date_ecriture,
        libelle: data.libelle,
        compte_code: data.compte_code,
        debit: data.debit || 0,
        credit: data.credit || 0,
        piece_ref: data.piece_ref || null,
        entite_type: data.entite_type || null,
        entite_id: data.entite_id || null,
        coproprietaire_id: data.coproprietaire_id || null,
        notes: data.notes || null,
      })
      .returning('*')
    return result
  }

  static async createEcritures(dataArray) {
    const db = getDb()
    return db('ecritures_comptables').insert(dataArray).returning('*')
  }

  static async deleteEcriture(id) {
    const db = getDb()
    return db('ecritures_comptables').where('id', id).del()
  }

  static async deleteEcrituresByExercice(exerciceId) {
    const db = getDb()
    return db('ecritures_comptables').where('exercice_id', exerciceId).del()
  }

  // ─── Journal ───────────────────────────────────────────────

  static async getJournal(exerciceId, { dateDebut, dateFin, compteCode } = {}) {
    const db = getDb()
    const query = db('ecritures_comptables')
      .where('exercice_id', exerciceId)
      .orderBy('date_ecriture', 'asc')
    if (dateDebut) {
      query.andWhere('date_ecriture', '>=', dateDebut)
    }
    if (dateFin) {
      query.andWhere('date_ecriture', '<=', dateFin)
    }
    if (compteCode) {
      query.andWhere('compte_code', compteCode)
    }
    return query
  }

  // ─── Grand Livre ───────────────────────────────────────────

  static async getGrandLivre(exerciceId) {
    const db = getDb()
    const totals = await db.raw(
      `SELECT compte_code, SUM(debit) as total_debit, SUM(credit) as total_credit
       FROM ecritures_comptables
       WHERE exercice_id = ?
       GROUP BY compte_code
       ORDER BY compte_code`,
      [exerciceId]
    )
    const ecritures = await db('ecritures_comptables')
      .where('exercice_id', exerciceId)
      .orderBy(['compte_code', 'date_ecriture'])
    return {
      totals: totals.rows,
      ecritures,
    }
  }

  // ─── Balance ───────────────────────────────────────────────

  static async getBalance(exerciceId) {
    const db = getDb()
    const exercice = await db('exercices_comptables')
      .where('id', exerciceId)
      .first()
    if (!exercice) return null
    const result = await db.raw(
      `SELECT
         ec.compte_code,
         pc.libelle,
         pc.classe,
         pc.type,
         SUM(ec.debit) as total_debit,
         SUM(ec.credit) as total_credit,
         SUM(ec.debit) - SUM(ec.credit) as solde
       FROM ecritures_comptables ec
       LEFT JOIN plan_comptable pc
         ON pc.code = ec.compte_code
         AND pc.copropriete_id = ?
       WHERE ec.exercice_id = ?
       GROUP BY ec.compte_code, pc.libelle, pc.classe, pc.type
       ORDER BY ec.compte_code`,
      [exercice.copropriete_id, exerciceId]
    )
    return result.rows
  }

  // ─── Annexe data helpers ───────────────────────────────────

  static async getAnnexe1Data(coproprieteId, annee) {
    const db = getDb()
    // Budget avec postes (charges)
    const budget = await db('budgets_previsionnels')
      .where({ copropriete_id: coproprieteId, annee })
      .first()
    let postes = []
    if (budget) {
      postes = await db('postes_depenses')
        .where('budget_id', budget.id)
        .orderBy('nom', 'asc')
    }
    // Produits: somme des paiements de l'annee
    const paiements = await db('paiements')
      .join('appels_fonds', 'paiements.appel_fonds_id', 'appels_fonds.id')
      .where('appels_fonds.copropriete_id', coproprieteId)
      .andWhere('appels_fonds.annee', annee)
      .sum('paiements.montant as total_paiements')
      .first()
    return {
      budget,
      postes,
      total_paiements: parseFloat(paiements?.total_paiements || 0),
    }
  }

  static async getAnnexe2Data(coproprieteId) {
    const db = getDb()
    // Comptes bancaires avec soldes
    const comptes = await db('comptes_bancaires')
      .where({ copropriete_id: coproprieteId, actif: true })
      .orderBy('type', 'asc')
    // Mouvements non rapproches
    const mouvementsNonRapproches = await db('mouvements_bancaires')
      .join('comptes_bancaires', 'mouvements_bancaires.compte_id', 'comptes_bancaires.id')
      .where('comptes_bancaires.copropriete_id', coproprieteId)
      .andWhere('mouvements_bancaires.rapproche', false)
      .select('mouvements_bancaires.*', 'comptes_bancaires.banque')
      .orderBy('mouvements_bancaires.date', 'desc')
    return {
      comptes,
      mouvements_non_rapproches: mouvementsNonRapproches,
    }
  }

  static async getAnnexe3Data(coproprieteId, annee) {
    const db = getDb()
    // Creances: total appele par coproprietaire pour l'annee
    const appeles = await db('appels_fonds_lignes')
      .join('appels_fonds', 'appels_fonds_lignes.appel_fonds_id', 'appels_fonds.id')
      .leftJoin('coproprietaires', 'appels_fonds_lignes.coproprietaire_id', 'coproprietaires.id')
      .where('appels_fonds.copropriete_id', coproprieteId)
      .andWhere('appels_fonds.annee', annee)
      .groupBy('appels_fonds_lignes.coproprietaire_id', 'coproprietaires.nom', 'coproprietaires.prenom')
      .select(
        'appels_fonds_lignes.coproprietaire_id',
        'coproprietaires.nom',
        'coproprietaires.prenom',
        db.raw('SUM(appels_fonds_lignes.montant) as total_appele')
      )
    // Paiements: total paye par coproprietaire pour l'annee
    const payes = await db('paiements')
      .join('appels_fonds', 'paiements.appel_fonds_id', 'appels_fonds.id')
      .where('appels_fonds.copropriete_id', coproprieteId)
      .andWhere('appels_fonds.annee', annee)
      .groupBy('paiements.coproprietaire_id')
      .select(
        'paiements.coproprietaire_id',
        db.raw('SUM(paiements.montant) as total_paye')
      )
    // Merge data
    const payesMap = {}
    for (const p of payes) {
      payesMap[p.coproprietaire_id] = parseFloat(p.total_paye || 0)
    }
    const creances = appeles.map((a) => {
      const totalAppele = parseFloat(a.total_appele || 0)
      const totalPaye = payesMap[a.coproprietaire_id] || 0
      return {
        coproprietaire_id: a.coproprietaire_id,
        nom: a.nom,
        prenom: a.prenom,
        total_appele: totalAppele,
        total_paye: totalPaye,
        solde: totalPaye - totalAppele,
      }
    })
    return { creances }
  }

  static async getAnnexe4Data(coproprieteId, annee) {
    const db = getDb()
    const fondsCourant = await db('fonds_travaux')
      .where({ copropriete_id: coproprieteId, annee })
      .first()
    const fondsPrecedent = await db('fonds_travaux')
      .where({ copropriete_id: coproprieteId, annee: annee - 1 })
      .first()
    return {
      annee_courante: fondsCourant || null,
      annee_precedente: fondsPrecedent || null,
    }
  }

  static async getAnnexe5Data(coproprieteId, annee) {
    const db = getDb()
    const budget = await db('budgets_previsionnels')
      .where({ copropriete_id: coproprieteId, annee })
      .first()
    let postes = []
    if (budget) {
      postes = await db('postes_depenses')
        .where('budget_id', budget.id)
        .orderBy('categorie', 'asc')
        .orderBy('nom', 'asc')
    }
    return {
      budget,
      postes,
    }
  }
}
