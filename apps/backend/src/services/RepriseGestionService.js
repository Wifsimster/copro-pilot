/**
 * Reprise de gestion — validation d'une balance comptable importée.
 *
 * Prérequis d'adoption n°1 : un syndic qui reprend une copropriété en cours
 * d'exercice (art. 18-2 loi 1965) doit repartir de la balance existante. Avant
 * d'appliquer une balance importée, on la valide : équilibre débit/crédit,
 * lignes bien formées, doublons de comptes. Cette couche est pure (pas d'I/O)
 * pour être testable et réutilisable par l'endpoint et un futur import fichier.
 */

const CENT = 100

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
