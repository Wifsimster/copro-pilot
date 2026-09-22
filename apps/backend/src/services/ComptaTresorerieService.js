import { MouvementBancaireModel } from '../models/MouvementBancaire.js'

/**
 * Comptabilité de trésorerie simplifiée (cash-basis) pour les petites
 * copropriétés dispensées de la comptabilité d'engagement (< 10 lots, budget
 * < 15 000 € — dérogation ordonnance 2019-1101 / art. 14-3 loi 1965).
 *
 * Pas de partie double : on résume les mouvements bancaires en recettes /
 * dépenses / solde, avec une ventilation par catégorie. La logique de calcul
 * est pure (testable) et séparée de l'accès aux données.
 */

const CENT = 100

/**
 * Build a cash-basis statement from raw bank movements.
 * Each movement: { type: 'credit'|'debit', montant: number, categorie?: string }
 * Returns { recettes, depenses, solde, parCategorie: { [cat]: { recettes, depenses } } }
 * All amounts in euros, cent-exact.
 */
export function computeCashBasisStatement(mouvements) {
  let recettesCents = 0
  let depensesCents = 0
  const parCategorie = {}

  for (const m of mouvements ?? []) {
    const cents = Math.round(Number(m.montant) * CENT)
    if (!Number.isFinite(cents)) continue
    const cat = m.categorie || 'Non catégorisé'
    if (!parCategorie[cat]) parCategorie[cat] = { recettes: 0, depenses: 0 }

    if (m.type === 'credit') {
      recettesCents += cents
      parCategorie[cat].recettes += cents
    } else if (m.type === 'debit') {
      depensesCents += cents
      parCategorie[cat].depenses += cents
    }
  }

  for (const cat of Object.keys(parCategorie)) {
    parCategorie[cat].recettes /= CENT
    parCategorie[cat].depenses /= CENT
  }

  return {
    recettes: recettesCents / CENT,
    depenses: depensesCents / CENT,
    solde: (recettesCents - depensesCents) / CENT,
    parCategorie,
  }
}

/**
 * Normalize a DATE value to 'YYYY-MM-DD'. node-postgres returns DATE
 * columns as local-midnight Date objects, which don't compare with strings.
 */
export function toIsoDay(value) {
  if (value instanceof Date) {
    const mm = String(value.getMonth() + 1).padStart(2, '0')
    const dd = String(value.getDate()).padStart(2, '0')
    return `${value.getFullYear()}-${mm}-${dd}`
  }
  return String(value).slice(0, 10)
}

class ComptaTresorerieService {
  /**
   * Cash-basis statement for a single bank account, optionally filtered by
   * date range (filtering applied in memory on the returned movements).
   */
  async getStatementForCompte(compteId, { from, to } = {}) {
    const mouvements =
      await MouvementBancaireModel.getAllByCompte(compteId)
    const filtered = mouvements.filter(m => {
      const day = toIsoDay(m.date)
      if (from && day < from) return false
      if (to && day > to) return false
      return true
    })
    return computeCashBasisStatement(filtered)
  }
}

export const comptaTresorerieService = new ComptaTresorerieService()
