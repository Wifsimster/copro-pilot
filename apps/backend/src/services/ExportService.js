import knexDatabase from '../config/knex-database.js'
import { exportPdfService } from './ExportPdfService.js'
import { exportExcelService } from './ExportExcelService.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

class ExportService {
  async getBudgetPdf(budgetId) {
    try {
      const db = getDb()

      const budget = await db('budgets_previsionnels').where('id', budgetId).first()
      if (!budget) return null

      const postes = await db('postes_depenses')
        .select('postes_depenses.*', 'cles_repartition.nom as cle_nom')
        .leftJoin('cles_repartition', 'postes_depenses.cle_repartition_id', 'cles_repartition.id')
        .where('budget_id', budgetId)
        .orderBy('postes_depenses.nom', 'asc')

      const copropriete = await db('coproprietes').where('id', budget.copropriete_id).first()

      const pdfDoc = exportPdfService.generateBudgetPdf(budget, postes, copropriete)
      logger.info(`[ExportService] Budget PDF generated for budget ${budgetId}`)
      return pdfDoc
    } catch (error) {
      logger.error(`[ExportService] Error generating budget PDF ${budgetId}: ${error.message}`)
      throw error
    }
  }

  async getAppelFondsPdf(appelId) {
    try {
      const db = getDb()

      const appel = await db('appels_fonds').where('id', appelId).first()
      if (!appel) return null

      const lignes = await db('appels_fonds_lignes')
        .select(
          'appels_fonds_lignes.*',
          'lots.numero as lot_numero',
          'lots.tantiemes',
          'coproprietaires.nom as coproprietaire_nom',
          'coproprietaires.prenom as coproprietaire_prenom'
        )
        .join('lots', 'appels_fonds_lignes.lot_id', 'lots.id')
        .leftJoin('coproprietaires', 'appels_fonds_lignes.coproprietaire_id', 'coproprietaires.id')
        .where('appels_fonds_lignes.appel_fonds_id', appelId)
        .orderBy('lots.numero', 'asc')

      const copropriete = await db('coproprietes').where('id', appel.copropriete_id).first()

      const pdfDoc = exportPdfService.generateAppelFondsPdf(appel, lignes, copropriete)
      logger.info(`[ExportService] Appel de fonds PDF generated for appel ${appelId}`)
      return pdfDoc
    } catch (error) {
      logger.error(`[ExportService] Error generating appel de fonds PDF ${appelId}: ${error.message}`)
      throw error
    }
  }

  async getFeuillePresencePdf(agId) {
    try {
      const db = getDb()

      const ag = await db('assemblees_generales').where('id', agId).first()
      if (!ag) return null

      const presences = await db('presences_ag')
        .select(
          'presences_ag.*',
          'c.nom as coproprietaire_nom',
          'c.prenom as coproprietaire_prenom',
          'r.nom as represente_par_nom',
          'r.prenom as represente_par_prenom'
        )
        .join('coproprietaires as c', 'presences_ag.coproprietaire_id', 'c.id')
        .leftJoin('coproprietaires as r', 'presences_ag.represente_par_id', 'r.id')
        .where('presences_ag.ag_id', agId)
        .orderBy('c.nom', 'asc')

      const copropriete = await db('coproprietes').where('id', ag.copropriete_id).first()

      const pdfDoc = exportPdfService.generateFeuillePresencePdf(ag, presences, copropriete)
      logger.info(`[ExportService] Feuille de presence PDF generated for AG ${agId}`)
      return pdfDoc
    } catch (error) {
      logger.error(`[ExportService] Error generating feuille de presence PDF for AG ${agId}: ${error.message}`)
      throw error
    }
  }

  async getCarnetEntretienPdf(coproprieteId) {
    try {
      const db = getDb()

      const copropriete = await db('coproprietes').where('id', coproprieteId).first()
      if (!copropriete) return null

      const entries = await db('carnet_entretien')
        .where('copropriete_id', coproprieteId)
        .orderBy('date_realisation', 'desc')

      const pdfDoc = exportPdfService.generateCarnetEntretienPdf(entries, copropriete)
      logger.info(`[ExportService] Carnet d'entretien PDF generated for copropriete ${coproprieteId}`)
      return pdfDoc
    } catch (error) {
      logger.error(`[ExportService] Error generating carnet d'entretien PDF for copropriete ${coproprieteId}: ${error.message}`)
      throw error
    }
  }

  async getEtatImpayesPdf(coproprieteId) {
    try {
      const db = getDb()

      const copropriete = await db('coproprietes').where('id', coproprieteId).first()
      if (!copropriete) return null

      const impayes = await this._calculateImpayes(db, coproprieteId)

      const pdfDoc = exportPdfService.generateEtatImpayesPdf(impayes, copropriete)
      logger.info(`[ExportService] Etat des impayes PDF generated for copropriete ${coproprieteId}`)
      return pdfDoc
    } catch (error) {
      logger.error(`[ExportService] Error generating etat des impayes PDF for copropriete ${coproprieteId}: ${error.message}`)
      throw error
    }
  }

  async getCoproprietairesExcel(coproprieteId) {
    try {
      const db = getDb()

      let coproprietaires
      if (coproprieteId) {
        // Get coproprietaires linked to lots in this copropriete
        coproprietaires = await db('coproprietaires')
          .select('coproprietaires.*')
          .join('lots', 'coproprietaires.id', 'lots.coproprietaire_id')
          .where('lots.copropriete_id', coproprieteId)
          .groupBy('coproprietaires.id')
          .orderBy('coproprietaires.nom', 'asc')
      } else {
        coproprietaires = await db('coproprietaires')
          .select('*')
          .orderBy('nom', 'asc')
      }

      const buffer = await exportExcelService.generateCoproprietairesExcel(coproprietaires)
      logger.info(`[ExportService] Coproprietaires Excel generated (${coproprietaires.length} rows)`)
      return buffer
    } catch (error) {
      logger.error(`[ExportService] Error generating coproprietaires Excel: ${error.message}`)
      throw error
    }
  }

  async getBalanceComptesExcel(coproprieteId) {
    try {
      const db = getDb()

      const copropriete = await db('coproprietes').where('id', coproprieteId).first()
      if (!copropriete) return null

      const balances = await this._calculateImpayes(db, coproprieteId)

      const buffer = await exportExcelService.generateBalanceComptesExcel(balances, copropriete)
      logger.info(`[ExportService] Balance des comptes Excel generated for copropriete ${coproprieteId}`)
      return buffer
    } catch (error) {
      logger.error(`[ExportService] Error generating balance des comptes Excel for copropriete ${coproprieteId}: ${error.message}`)
      throw error
    }
  }

  async getEtatChargesExcel(budgetId) {
    try {
      const db = getDb()

      const budget = await db('budgets_previsionnels').where('id', budgetId).first()
      if (!budget) return null

      const postes = await db('postes_depenses')
        .select('postes_depenses.*', 'cles_repartition.nom as cle_nom')
        .leftJoin('cles_repartition', 'postes_depenses.cle_repartition_id', 'cles_repartition.id')
        .where('budget_id', budgetId)
        .orderBy('postes_depenses.nom', 'asc')

      const copropriete = await db('coproprietes').where('id', budget.copropriete_id).first()

      const buffer = await exportExcelService.generateEtatChargesExcel(postes, budget, copropriete)
      logger.info(`[ExportService] Etat des charges Excel generated for budget ${budgetId}`)
      return buffer
    } catch (error) {
      logger.error(`[ExportService] Error generating etat des charges Excel for budget ${budgetId}: ${error.message}`)
      throw error
    }
  }

  async getEtatImpayesExcel(coproprieteId) {
    try {
      const db = getDb()

      const copropriete = await db('coproprietes').where('id', coproprieteId).first()
      if (!copropriete) return null

      const impayes = await this._calculateImpayes(db, coproprieteId)

      const buffer = await exportExcelService.generateEtatImpayesExcel(impayes, copropriete)
      logger.info(`[ExportService] Etat des impayes Excel generated for copropriete ${coproprieteId}`)
      return buffer
    } catch (error) {
      logger.error(`[ExportService] Error generating etat des impayes Excel for copropriete ${coproprieteId}: ${error.message}`)
      throw error
    }
  }

  /**
   * Calculate unpaid amounts per coproprietaire for a given copropriete.
   * - Get total due from appel_fonds_lignes (via appels_fonds scoped to copropriete)
   * - Get total paid from paiements (via appels_fonds scoped to copropriete)
   * - Calculate solde = total_du - total_paye
   * - Get date of last payment
   */
  async _calculateImpayes(db, coproprieteId) {
    // Get total due per coproprietaire from appel_fonds_lignes
    const totalsDus = await db('appels_fonds_lignes')
      .select('appels_fonds_lignes.coproprietaire_id')
      .sum('appels_fonds_lignes.montant as total_du')
      .join('appels_fonds', 'appels_fonds_lignes.appel_fonds_id', 'appels_fonds.id')
      .where('appels_fonds.copropriete_id', coproprieteId)
      .whereNotNull('appels_fonds_lignes.coproprietaire_id')
      .groupBy('appels_fonds_lignes.coproprietaire_id')

    // Get total paid per coproprietaire from paiements
    const totalsPayes = await db('paiements')
      .select('paiements.coproprietaire_id')
      .sum('paiements.montant as total_paye')
      .max('paiements.date_paiement as date_dernier_paiement')
      .join('appels_fonds', 'paiements.appel_fonds_id', 'appels_fonds.id')
      .where('appels_fonds.copropriete_id', coproprieteId)
      .groupBy('paiements.coproprietaire_id')

    // Build a map of paiements by coproprietaire_id
    const payeMap = new Map()
    for (const row of totalsPayes) {
      payeMap.set(row.coproprietaire_id, {
        total_paye: parseFloat(row.total_paye || 0),
        date_dernier_paiement: row.date_dernier_paiement,
      })
    }

    // Collect all coproprietaire ids
    const coproprietaireIds = totalsDus.map((r) => r.coproprietaire_id)
    if (coproprietaireIds.length === 0) return []

    // Fetch coproprietaire names
    const coproprietaires = await db('coproprietaires')
      .whereIn('id', coproprietaireIds)
      .select('id', 'nom', 'prenom')

    const nameMap = new Map()
    for (const c of coproprietaires) {
      nameMap.set(c.id, { nom: c.nom, prenom: c.prenom })
    }

    // Build impayes array
    const impayes = []
    for (const row of totalsDus) {
      const du = parseFloat(row.total_du || 0)
      const payeInfo = payeMap.get(row.coproprietaire_id) || { total_paye: 0, date_dernier_paiement: null }
      const nameInfo = nameMap.get(row.coproprietaire_id) || { nom: 'Inconnu', prenom: '' }

      impayes.push({
        coproprietaire_id: row.coproprietaire_id,
        nom: nameInfo.nom,
        prenom: nameInfo.prenom,
        montant_du: du,
        montant_paye: payeInfo.total_paye,
        solde: du - payeInfo.total_paye,
        date_dernier_paiement: payeInfo.date_dernier_paiement,
      })
    }

    // Sort by nom ascending
    impayes.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''))

    return impayes
  }
}

export const exportService = new ExportService()
