import { describe, it, expect } from 'vitest'
import {
  validateBalance,
  buildRepriseEcritures,
  sumSoldes,
} from '../../src/services/RepriseGestionService.js'

describe('validateBalance', () => {
  it('accepts a balanced trial balance', () => {
    const r = validateBalance([
      { compte: '512', libelle: 'Banque', debit: 1000 },
      { compte: '450', libelle: 'Copropriétaires', credit: 1000 },
    ])
    expect(r.valid).toBe(true)
    expect(r.totals).toEqual({ debit: 1000, credit: 1000, ecart: 0 })
    expect(r.lineErrors).toEqual([])
  })

  it('flags an unbalanced trial balance with the écart', () => {
    const r = validateBalance([
      { compte: '512', debit: 1000 },
      { compte: '450', credit: 900 },
    ])
    expect(r.valid).toBe(false)
    expect(r.totals.ecart).toBe(100)
  })

  it('is exact to the cent (no float drift)', () => {
    const r = validateBalance([
      { compte: '512', debit: 0.1 },
      { compte: '513', debit: 0.2 },
      { compte: '450', credit: 0.3 },
    ])
    expect(r.totals.ecart).toBe(0)
    expect(r.valid).toBe(true)
  })

  it('reports missing account and invalid amounts per line', () => {
    const r = validateBalance([
      { compte: '', debit: 100 },
      { compte: '450', credit: -5 },
    ])
    expect(r.valid).toBe(false)
    expect(r.lineErrors).toEqual(
      expect.arrayContaining([
        { index: 0, message: 'Compte manquant' },
        { index: 1, message: 'Crédit invalide' },
      ])
    )
  })

  it('detects duplicate accounts', () => {
    const r = validateBalance([
      { compte: '512', debit: 500 },
      { compte: '512', debit: 500 },
      { compte: '450', credit: 1000 },
    ])
    expect(r.duplicateComptes).toContain('512')
  })

  it('rejects an empty balance', () => {
    const r = validateBalance([])
    expect(r.valid).toBe(false)
    expect(r.lineErrors[0].message).toBe('Balance vide')
  })
})

describe('buildRepriseEcritures', () => {
  const ctx = { exerciceId: 7, coproprieteId: 3, dateEcriture: '2026-01-01' }

  it('maps non-zero lines to à-nouveaux écritures', () => {
    const e = buildRepriseEcritures(
      [
        { compte: '512', libelle: 'Banque', debit: 1000, credit: 0 },
        { compte: '450', libelle: 'Copro', debit: 0, credit: 1000 },
      ],
      ctx
    )
    expect(e).toHaveLength(2)
    expect(e[0]).toMatchObject({
      exercice_id: 7,
      copropriete_id: 3,
      date_ecriture: '2026-01-01',
      compte_code: '512',
      debit: 1000,
      credit: 0,
      piece_ref: 'REPRISE',
      entite_type: 'reprise',
      libelle: 'Report à nouveau (reprise de gestion)',
    })
  })

  it('skips lines with no débit and no crédit', () => {
    const e = buildRepriseEcritures(
      [
        { compte: '512', debit: 0, credit: 0 },
        { compte: '606', debit: 500, credit: 0 },
      ],
      ctx
    )
    expect(e).toHaveLength(1)
    expect(e[0].compte_code).toBe('606')
  })
})

describe('sumSoldes', () => {
  it('sums signed opening balances cent-exactly', () => {
    expect(
      sumSoldes([{ montant: 100.1 }, { montant: 50.2 }, { montant: -30.3 }])
    ).toBe(120)
  })
  it('handles an empty list', () => {
    expect(sumSoldes([])).toBe(0)
    expect(sumSoldes(undefined)).toBe(0)
  })
})
