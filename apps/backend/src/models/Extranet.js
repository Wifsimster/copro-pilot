import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class ExtranetModel {
  // ── User identification ──────────────────────────────────────────

  static async getCoproprietaireByUserId(userId) {
    const db = getDb()
    return db('coproprietaires')
      .where('user_id', userId)
      .first()
  }

  static async getCoproprietesByCoproprietaire(coproprietaireId) {
    const db = getDb()
    return db('lots')
      .select('coproprietes.*')
      .join('coproprietes', 'lots.copropriete_id', 'coproprietes.id')
      .where('lots.coproprietaire_id', coproprietaireId)
      .groupBy('coproprietes.id')
      .orderBy('coproprietes.nom', 'asc')
  }

  static async isConseilSyndical(coproprietaireId, coproprieteId) {
    const db = getDb()
    const row = await db('conseil_syndical')
      .where({
        coproprietaire_id: coproprietaireId,
        copropriete_id: coproprieteId,
      })
      .first()
    return !!row
  }

  // ── Documents accessible to all copropriétaires ──────────────────

  static async getDocumentsCopropriete(coproprieteId) {
    const db = getDb()
    return db('documents')
      .where('copropriete_id', coproprieteId)
      .whereIn('categorie', ['reglement', 'diagnostic', 'assurance', 'contrat'])
      .orderBy('created_at', 'desc')
  }

  static async getDerniersPVAG(coproprieteId, limit = 3) {
    const db = getDb()
    const ags = await db('assemblees_generales')
      .where('copropriete_id', coproprieteId)
      .where('statut', 'terminee')
      .orderBy('date', 'desc')
      .limit(limit)

    for (const ag of ags) {
      ag.resolutions = await db('resolutions')
        .where('ag_id', ag.id)
        .orderBy('numero', 'asc')
    }

    return ags
  }

  static async getDiagnostics(coproprieteId) {
    const db = getDb()
    return db('diagnostics')
      .where('copropriete_id', coproprieteId)
      .orderBy('date_realisation', 'desc')
  }

  static async getAssurances(coproprieteId) {
    const db = getDb()
    return db('assurances')
      .where('copropriete_id', coproprieteId)
      .where(function () {
        this.where('date_fin', '>=', db.fn.now())
          .orWhereNull('date_fin')
      })
      .orderBy('date_debut', 'desc')
  }

  static async getContrats(coproprieteId) {
    const db = getDb()
    return db('contrats')
      .select('contrats.*', 'prestataires.nom as prestataire_nom')
      .join('prestataires', 'contrats.prestataire_id', 'prestataires.id')
      .where('contrats.copropriete_id', coproprieteId)
      .where('contrats.statut', 'actif')
      .orderBy('contrats.date_debut', 'desc')
  }

  static async getContratSyndic(coproprieteId) {
    const db = getDb()
    return db('contrats_syndic')
      .where('copropriete_id', coproprieteId)
      .where('statut', 'en_cours')
      .orderBy('date_debut', 'desc')
      .first()
  }

  // ── Individual copropriétaire access ─────────────────────────────

  static async getMonCompte(coproprietaireId) {
    const db = getDb()
    const [totalDu] = await db('appels_fonds_lignes')
      .where('coproprietaire_id', coproprietaireId)
      .sum('montant as total')
    const [totalPaye] = await db('paiements')
      .where('coproprietaire_id', coproprietaireId)
      .sum('montant as total')
    return {
      total_du: parseFloat(totalDu?.total || 0),
      total_paye: parseFloat(totalPaye?.total || 0),
      solde: parseFloat(totalPaye?.total || 0) - parseFloat(totalDu?.total || 0),
    }
  }

  static async getMesCharges(coproprietaireId, annees = 2) {
    const db = getDb()
    const anneeMin = new Date().getFullYear() - annees + 1
    return db('appels_fonds_lignes')
      .select(
        'appels_fonds_lignes.*',
        'appels_fonds.trimestre',
        'appels_fonds.annee',
        'appels_fonds.statut as appel_statut'
      )
      .join('appels_fonds', 'appels_fonds_lignes.appel_fonds_id', 'appels_fonds.id')
      .where('appels_fonds_lignes.coproprietaire_id', coproprietaireId)
      .where('appels_fonds.annee', '>=', anneeMin)
      .orderBy([
        { column: 'appels_fonds.annee', order: 'desc' },
        { column: 'appels_fonds.trimestre', order: 'desc' },
      ])
  }

  static async getMesAppelsFonds(coproprietaireId, annees = 3) {
    const db = getDb()
    const anneeMin = new Date().getFullYear() - annees + 1
    return db('appels_fonds_lignes')
      .select(
        'appels_fonds_lignes.*',
        'appels_fonds.trimestre',
        'appels_fonds.annee',
        'appels_fonds.montant_total',
        'appels_fonds.statut as appel_statut',
        'appels_fonds.date_emission',
        'appels_fonds.date_echeance'
      )
      .join('appels_fonds', 'appels_fonds_lignes.appel_fonds_id', 'appels_fonds.id')
      .where('appels_fonds_lignes.coproprietaire_id', coproprietaireId)
      .where('appels_fonds.annee', '>=', anneeMin)
      .orderBy([
        { column: 'appels_fonds.annee', order: 'desc' },
        { column: 'appels_fonds.trimestre', order: 'desc' },
      ])
  }

  static async getMesLots(coproprietaireId) {
    const db = getDb()
    return db('lots')
      .select('lots.*', 'coproprietes.nom as copropriete_nom')
      .join('coproprietes', 'lots.copropriete_id', 'coproprietes.id')
      .where('lots.coproprietaire_id', coproprietaireId)
      .orderBy('coproprietes.nom', 'asc')
  }

  static async getMonFondsTravaux(coproprietaireId) {
    const db = getDb()
    const lots = await db('lots')
      .select('lots.id', 'lots.tantiemes', 'lots.copropriete_id', 'coproprietes.nom as copropriete_nom')
      .join('coproprietes', 'lots.copropriete_id', 'coproprietes.id')
      .where('lots.coproprietaire_id', coproprietaireId)

    const results = []

    for (const lot of lots) {
      const totalTantiemes = await db('lots')
        .where('copropriete_id', lot.copropriete_id)
        .sum('tantiemes as total')
        .first()

      const fonds = await db('fonds_travaux')
        .where('copropriete_id', lot.copropriete_id)
        .orderBy('annee', 'desc')

      const ratio = totalTantiemes?.total
        ? lot.tantiemes / parseFloat(totalTantiemes.total)
        : 0

      results.push({
        lot_id: lot.id,
        copropriete_id: lot.copropriete_id,
        copropriete_nom: lot.copropriete_nom,
        tantiemes: lot.tantiemes,
        ratio,
        fonds: fonds.map(f => ({
          ...f,
          quote_part: parseFloat((f.solde * ratio).toFixed(2)),
          cotisation_quote_part: parseFloat((f.cotisation_annuelle * ratio).toFixed(2)),
        })),
      })
    }

    return results
  }

  // ── Conseil syndical access (additional) ─────────────────────────

  static async getListeCoproprietaires(coproprieteId) {
    const db = getDb()
    return db('coproprietaires')
      .select('coproprietaires.*')
      .join('lots', 'lots.coproprietaire_id', 'coproprietaires.id')
      .where('lots.copropriete_id', coproprieteId)
      .groupBy('coproprietaires.id')
      .orderBy('coproprietaires.nom', 'asc')
  }

  static async getSoldesCharges(coproprieteId) {
    const db = getDb()
    const coproprietaires = await db('coproprietaires')
      .select('coproprietaires.id', 'coproprietaires.nom', 'coproprietaires.prenom', 'coproprietaires.email')
      .join('lots', 'lots.coproprietaire_id', 'coproprietaires.id')
      .where('lots.copropriete_id', coproprieteId)
      .groupBy('coproprietaires.id')
      .orderBy('coproprietaires.nom', 'asc')

    const results = []

    for (const copro of coproprietaires) {
      const [totalDu] = await db('appels_fonds_lignes')
        .where('coproprietaire_id', copro.id)
        .sum('montant as total')
      const [totalPaye] = await db('paiements')
        .where('coproprietaire_id', copro.id)
        .sum('montant as total')
      results.push({
        ...copro,
        total_du: parseFloat(totalDu?.total || 0),
        total_paye: parseFloat(totalPaye?.total || 0),
        solde: parseFloat(totalPaye?.total || 0) - parseFloat(totalDu?.total || 0),
      })
    }

    return results
  }

  static async getRelevesBancaires(coproprieteId) {
    const db = getDb()
    return db('comptes_bancaires')
      .where('copropriete_id', coproprieteId)
      .where('actif', true)
      .orderBy('type', 'asc')
  }
}
