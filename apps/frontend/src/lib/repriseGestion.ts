/**
 * Reprise de gestion — pure helpers for the guided passation workflow.
 *
 * A syndic taking over a copropriété mid-year (art. 18-2 loi 1965) does not
 * start from a clean Excel: they receive PDFs and uncertain balances from the
 * outgoing syndic. This workflow guides the passation — the adoption wall.
 * Framework-free so it can be unit-tested.
 */

export interface PassationItem {
  key: string
  label: string
  /** Legal / practical note explaining why it matters. */
  note: string
}

/** Documents to obtain from the outgoing syndic (art. 18-2). */
export const PASSATION_CHECKLIST: PassationItem[] = [
  {
    key: 'etat_comptes',
    label: "État des comptes du syndicat",
    note: "Le syndic sortant a 3 mois pour remettre l'état des comptes après la fin du mandat (art. 18-2).",
  },
  {
    key: 'balance',
    label: 'Balance comptable de clôture',
    note: 'Base de reprise : soldes de tous les comptes à la date de passation.',
  },
  {
    key: 'soldes_coproprietaires',
    label: 'Soldes individuels des copropriétaires',
    note: "Créances et dettes par copropriétaire — un solde faux se conteste en AG.",
  },
  {
    key: 'tantiemes',
    label: 'Tantièmes et clés de répartition',
    note: "La somme des tantièmes doit valoir 1 000 ou 10 000 selon le règlement.",
  },
  {
    key: 'contrats',
    label: 'Contrats en cours et carnet d’entretien',
    note: 'Assurances, prestataires, emprunts — pour ne pas rompre un contrat par méconnaissance.',
  },
]

export interface BalanceLine {
  compte: string
  libelle?: string
  debit?: number
  credit?: number
}

function toNumber(raw: string): number | undefined {
  if (raw == null) return undefined
  const cleaned = raw.trim().replace(/\s/g, '').replace(',', '.')
  if (cleaned === '') return undefined
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : undefined
}

/**
 * Parse a pasted balance (from Excel or a PDF export). Each non-empty line is
 * `compte <sep> libellé <sep> débit <sep> crédit`, where <sep> is a tab, a
 * semicolon, or a comma-with-following-space (so decimal commas survive).
 * Missing débit/crédit default to 0.
 */
export function parseBalanceInput(text: string): BalanceLine[] {
  if (!text) return []
  const sep = text.includes('\t') ? '\t' : ';'
  return text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(line => {
      const cells = line.split(sep).map(c => c.trim())
      const [compte = '', libelle = '', debit = '', credit = ''] = cells
      return {
        compte,
        libelle: libelle || undefined,
        debit: toNumber(debit) ?? 0,
        credit: toNumber(credit) ?? 0,
      }
    })
}

/**
 * Contradictory control on tantièmes: the sum entered must match the expected
 * base (1000 or 10000). Returns the écart so the UI can flag a mismatch before
 * it corrupts every future répartition.
 */
export function controleTantiemes(
  totalSaisi: number,
  base: 1000 | 10000
): { ok: boolean; ecart: number } {
  const ecart = totalSaisi - base
  return { ok: ecart === 0, ecart }
}
