import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

class AgReportService {
  /**
   * Annexe 1 — Etat financier : budget vs realise par poste
   */
  async getAnnexe1(coproprieteId, annee) {
    try {
      const db = getDb()

      const budget = await db('budgets_previsionnels')
        .where({ copropriete_id: coproprieteId, annee })
        .first()

      if (!budget) {
        return {
          postes: [],
          total_prevu: 0,
          total_realise: 0,
        }
      }

      const postes = await db('postes_depenses')
        .where('budget_id', budget.id)
        .orderBy('nom', 'asc')

      const exercice = await db('exercices_comptables')
        .where({ copropriete_id: coproprieteId, annee })
        .first()

      let ecrituresByPoste = {}
      if (exercice) {
        const ecritures = await db('ecritures_comptables')
          .select('libelle')
          .sum('debit as total_debit')
          .sum('credit as total_credit')
          .where('exercice_id', exercice.id)
          .groupBy('libelle')

        ecritures.forEach(e => {
          ecrituresByPoste[e.libelle] =
            parseFloat(e.total_debit || 0) -
            parseFloat(e.total_credit || 0)
        })
      }

      const postesResult = postes.map(p => {
        const prevu = parseFloat(p.montant_prevu || 0)
        const realise =
          parseFloat(p.montant_reel || 0) ||
          (ecrituresByPoste[p.nom] ?? 0)
        const ecart = realise - prevu
        const ecart_pct =
          prevu !== 0
            ? Math.round((ecart / prevu) * 10000) / 100
            : 0

        return {
          nom: p.nom,
          budget_prevu: prevu,
          realise,
          ecart,
          ecart_pct,
        }
      })

      const total_prevu = postesResult.reduce(
        (s, p) => s + p.budget_prevu,
        0
      )
      const total_realise = postesResult.reduce(
        (s, p) => s + p.realise,
        0
      )

      return { postes: postesResult, total_prevu, total_realise }
    } catch (error) {
      logger.error(
        `[AgReportService] Error getAnnexe1: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Annexe 2 — Situation de tresorerie
   */
  async getAnnexe2(coproprieteId, annee) {
    try {
      const db = getDb()

      const comptes = await db('comptes_bancaires')
        .where({ copropriete_id: coproprieteId, actif: true })
        .orderBy('type', 'asc')

      const comptesResult = comptes.map(c => ({
        nom: c.libelle || c.banque,
        iban: c.iban,
        solde: parseFloat(c.solde || 0),
      }))

      const total_tresorerie = comptesResult.reduce(
        (s, c) => s + c.solde,
        0
      )

      const appels = await db('appels_fonds')
        .where({ copropriete_id: coproprieteId, annee })

      const appels_emis = appels.reduce(
        (s, a) => s + parseFloat(a.montant_total || 0),
        0
      )

      const appelIds = appels.map(a => a.id)
      let appels_recus = 0
      if (appelIds.length > 0) {
        const [result] = await db('paiements')
          .whereIn('appel_fonds_id', appelIds)
          .sum('montant as total')
        appels_recus = parseFloat(result?.total || 0)
      }

      return {
        comptes: comptesResult,
        total_tresorerie,
        appels_emis,
        appels_recus,
      }
    } catch (error) {
      logger.error(
        `[AgReportService] Error getAnnexe2: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Annexe 3 — Soldes des coproprietaires
   */
  async getAnnexe3(coproprieteId, annee) {
    try {
      const db = getDb()

      const lots = await db('lots')
        .select(
          'lots.id as lot_id',
          'lots.numero',
          'lots.coproprietaire_id',
          'coproprietaires.nom',
          'coproprietaires.prenom'
        )
        .join(
          'coproprietaires',
          'lots.coproprietaire_id',
          'coproprietaires.id'
        )
        .where('lots.copropriete_id', coproprieteId)
        .whereNotNull('lots.coproprietaire_id')
        .orderBy('coproprietaires.nom', 'asc')

      const coproprietaireMap = {}

      for (const lot of lots) {
        if (!coproprietaireMap[lot.coproprietaire_id]) {
          coproprietaireMap[lot.coproprietaire_id] = {
            nom: lot.nom,
            prenom: lot.prenom,
            lots: [],
            coproprietaire_id: lot.coproprietaire_id,
          }
        }
        coproprietaireMap[lot.coproprietaire_id].lots.push(
          lot.numero
        )
      }

      const appels = await db('appels_fonds')
        .where({ copropriete_id: coproprieteId, annee })

      const appelIds = appels.map(a => a.id)

      const coproprietaires = []
      let total_impayes = 0

      for (const copro of Object.values(coproprietaireMap)) {
        let total_appele = 0
        if (appelIds.length > 0) {
          const [result] = await db('appels_fonds_lignes')
            .whereIn('appel_fonds_id', appelIds)
            .where('coproprietaire_id', copro.coproprietaire_id)
            .sum('montant as total')
          total_appele = parseFloat(result?.total || 0)
        }

        let total_paye = 0
        if (appelIds.length > 0) {
          const [result] = await db('paiements')
            .whereIn('appel_fonds_id', appelIds)
            .where('coproprietaire_id', copro.coproprietaire_id)
            .sum('montant as total')
          total_paye = parseFloat(result?.total || 0)
        }

        const solde = total_paye - total_appele
        if (solde < 0) {
          total_impayes += Math.abs(solde)
        }

        coproprietaires.push({
          nom: copro.nom,
          prenom: copro.prenom,
          lots: copro.lots.join(', '),
          total_appele,
          total_paye,
          solde,
        })
      }

      return { coproprietaires, total_impayes }
    } catch (error) {
      logger.error(
        `[AgReportService] Error getAnnexe3: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Annexe 4 — Etat des dettes fournisseurs
   */
  async getAnnexe4(coproprieteId, annee) {
    try {
      const db = getDb()

      const contrats = await db('contrats')
        .select(
          'contrats.*',
          'prestataires.nom as prestataire_nom'
        )
        .join(
          'prestataires',
          'contrats.prestataire_id',
          'prestataires.id'
        )
        .where('contrats.copropriete_id', coproprieteId)
        .where('contrats.statut', 'actif')
        .orderBy('prestataires.nom', 'asc')

      const fournisseurs = contrats.map(c => ({
        nom: c.prestataire_nom,
        contrat: c.objet,
        montant_du: parseFloat(c.montant_annuel || 0),
        date_echeance: c.date_fin || null,
      }))

      const total_dettes = fournisseurs.reduce(
        (s, f) => s + f.montant_du,
        0
      )

      return { fournisseurs, total_dettes }
    } catch (error) {
      logger.error(
        `[AgReportService] Error getAnnexe4: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Annexe 5 — Fonds travaux (loi ALUR)
   */
  async getAnnexe5(coproprieteId, annee) {
    try {
      const db = getDb()

      const fondsCurrent = await db('fonds_travaux')
        .where({ copropriete_id: coproprieteId, annee })
        .first()

      const fondsPrevious = await db('fonds_travaux')
        .where({
          copropriete_id: coproprieteId,
          annee: annee - 1,
        })
        .first()

      const solde_debut = parseFloat(
        fondsPrevious?.solde || 0
      )
      const cotisations = parseFloat(
        fondsCurrent?.cotisation_annuelle || 0
      )
      const solde_fin = parseFloat(fondsCurrent?.solde || 0)
      const depenses = solde_debut + cotisations - solde_fin

      const mouvements = []
      if (solde_debut > 0) {
        mouvements.push({
          libelle: 'Report exercice precedent',
          montant: solde_debut,
          type: 'credit',
        })
      }
      if (cotisations > 0) {
        mouvements.push({
          libelle: `Cotisations annuelles ${annee}`,
          montant: cotisations,
          type: 'credit',
        })
      }
      if (depenses > 0) {
        mouvements.push({
          libelle: `Depenses travaux ${annee}`,
          montant: depenses,
          type: 'debit',
        })
      }

      return {
        solde_debut,
        cotisations,
        depenses: depenses > 0 ? depenses : 0,
        solde_fin,
        mouvements,
      }
    } catch (error) {
      logger.error(
        `[AgReportService] Error getAnnexe5: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Pack complet — toutes les annexes
   */
  async getPackComplet(coproprieteId, annee) {
    try {
      const [annexe1, annexe2, annexe3, annexe4, annexe5] =
        await Promise.all([
          this.getAnnexe1(coproprieteId, annee),
          this.getAnnexe2(coproprieteId, annee),
          this.getAnnexe3(coproprieteId, annee),
          this.getAnnexe4(coproprieteId, annee),
          this.getAnnexe5(coproprieteId, annee),
        ])

      return { annexe1, annexe2, annexe3, annexe4, annexe5 }
    } catch (error) {
      logger.error(
        `[AgReportService] Error getPackComplet: ${error.message}`
      )
      throw error
    }
  }
}

export const agReportService = new AgReportService()
