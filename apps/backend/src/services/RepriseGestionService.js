/**
 * Reprise de gestion — validation d'une balance comptable importée.
 *
 * Prérequis d'adoption n°1 : un syndic qui reprend une copropriété en cours
 * d'exercice (art. 18-2 loi 1965) doit repartir de la balance existante. Avant
 * d'appliquer une balance importée, on la valide : équilibre débit/crédit,
 * lignes bien formées, doublons de comptes. Cette couche est pure (pas d'I/O)
 * pour être testable et réutilisable par l'endpoint et un futur import fichier.
 */
import { ComptabiliteReglementaireModel } from '../models/ComptabiliteReglementaire.js'
import { SoldeInitialModel } from '../models/SoldeInitial.js'
import logger from '../logger.js'

const CENT = 100

const REPRISE_ENTITE = 'reprise'

function toCents(n) {
  return Math.round(Number(n) * CENT)
}

/**
 * Valide une balance : tableau de lignes
 *   { compte: string, libelle?: string, debit?: number, credit?: number }
 *
 * Retourne :
 *   {
 *     valid: boolean,
 *     totals: { debit, credit, ecart },   // en euros
 *     lineErrors: [{ index, message }],
 *     duplicateComptes: string[],
 *   }
 *
 * Règles : chaque ligne a un `compte` non vide ; débit et crédit sont des
 * nombres >= 0 ; une balance est équilibrée si Σ débit == Σ crédit (au centime).
 */
export function validateBalance(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return {
      valid: false,
      totals: { debit: 0, credit: 0, ecart: 0 },
      lineErrors: [{ index: -1, message: 'Balance vide' }],
      duplicateComptes: [],
    }
  }

  const lineErrors = []
  const seen = new Map()
  const duplicateComptes = new Set()
  let debitCents = 0
  let creditCents = 0

  lines.forEach((line, index) => {
    const compte = String(line.compte ?? '').trim()
    if (!compte) {
      lineErrors.push({ index, message: 'Compte manquant' })
    } else {
      seen.set(compte, (seen.get(compte) || 0) + 1)
      if (seen.get(compte) === 2) duplicateComptes.add(compte)
    }

    const debit = line.debit ?? 0
    const credit = line.credit ?? 0

    if (!Number.isFinite(Number(debit)) || Number(debit) < 0) {
      lineErrors.push({ index, message: 'Débit invalide' })
    } else {
      debitCents += toCents(debit)
    }
    if (!Number.isFinite(Number(credit)) || Number(credit) < 0) {
      lineErrors.push({ index, message: 'Crédit invalide' })
    } else {
      creditCents += toCents(credit)
    }
  })

  const ecartCents = debitCents - creditCents
  const balanced = ecartCents === 0

  return {
    valid: balanced && lineErrors.length === 0,
    totals: {
      debit: debitCents / CENT,
      credit: creditCents / CENT,
      ecart: ecartCents / CENT,
    },
    lineErrors,
    duplicateComptes: [...duplicateComptes],
  }
}

/**
 * Build the à-nouveaux écritures ("report à nouveau") from a validated balance.
 * One écriture per line carrying a non-zero débit or crédit; zero lines are
 * skipped. Pure, so it can be unit-tested without a database.
 */
export function buildRepriseEcritures(lignes, { exerciceId, coproprieteId, dateEcriture }) {
  return (lignes || [])
    .filter(l => Number(l.debit || 0) !== 0 || Number(l.credit || 0) !== 0)
    .map(l => ({
      exercice_id: exerciceId,
      copropriete_id: coproprieteId,
      date_ecriture: dateEcriture,
      libelle: 'Report à nouveau (reprise de gestion)',
      compte_code: String(l.compte).trim(),
      debit: Number(l.debit || 0),
      credit: Number(l.credit || 0),
      piece_ref: 'REPRISE',
      entite_type: REPRISE_ENTITE,
    }))
}

/**
 * Sum of the per-owner opening balances (cent-exact). Used both for the UI's
 * running total and the contradictory control against the 450 account.
 */
export function sumSoldes(soldes) {
  const cents = (soldes || []).reduce(
    (s, x) => s + Math.round(Number(x.montant || 0) * CENT),
    0
  )
  return cents / CENT
}

class RepriseGestionService {
  /**
   * Import a validated closing balance as the exercise's opening position
   * (à-nouveaux). Refuses an unbalanced balance, finds or creates the exercise
   * for the year, and is idempotent (refuses a second reprise import).
   */
  async importerBalance({ copropriete_id, annee, lignes }) {
    const validation = validateBalance(lignes)
    if (!validation.valid) {
      const err = new Error(
        'Balance déséquilibrée ou invalide — import refusé.'
      )
      err.code = 'INVALID_BALANCE'
      err.validation = validation
      throw err
    }

    // Find or create the exercise for the year.
    const exercices =
      await ComptabiliteReglementaireModel.getExercicesByCopropriete(
        copropriete_id
      )
    let exercice = exercices.find(e => e.annee === annee)
    if (!exercice) {
      exercice = await ComptabiliteReglementaireModel.createExercice({
        copropriete_id,
        annee,
        date_debut: `${annee}-01-01`,
        date_fin: `${annee}-12-31`,
        statut: 'ouvert',
      })
    }

    // Idempotence: don't import a reprise twice into the same exercise.
    const existing =
      await ComptabiliteReglementaireModel.getEcrituresByExercice(exercice.id)
    if (existing.some(e => e.entite_type === REPRISE_ENTITE)) {
      const err = new Error(
        'Une reprise a déjà été importée pour cet exercice.'
      )
      err.code = 'ALREADY_IMPORTED'
      throw err
    }

    const ecritures = buildRepriseEcritures(lignes, {
      exerciceId: exercice.id,
      coproprieteId: copropriete_id,
      dateEcriture: exercice.date_debut,
    })
    if (ecritures.length) {
      await ComptabiliteReglementaireModel.createEcritures(ecritures)
    }

    logger.info(
      `[RepriseGestionService] Imported ${ecritures.length} à-nouveaux for copro ${copropriete_id} exercice ${annee}`
    )
    return { exercice, ecritures_count: ecritures.length }
  }

  /** Persist (upsert) the per-owner opening balances for a copro/année. */
  async saveSoldes({ copropriete_id, annee, soldes }) {
    await SoldeInitialModel.bulkUpsert(copropriete_id, annee, soldes)
    const saved = await SoldeInitialModel.getByCoproAnnee(copropriete_id, annee)
    return { total: sumSoldes(saved), soldes: saved }
  }

  async getSoldes(coproprieteId, annee) {
    return SoldeInitialModel.getByCoproAnnee(coproprieteId, annee)
  }
}

export const repriseGestionService = new RepriseGestionService()
