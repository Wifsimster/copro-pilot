import { describe, it, expect } from 'vitest'
import {
  parseBalanceInput,
  controleTantiemes,
  PASSATION_CHECKLIST,
} from '@/lib/repriseGestion'

describe('parseBalanceInput', () => {
  it('parses tab-separated lines with French decimals', () => {
    const text = '512\tBanque\t1000,50\t0\n450\tCopropriétaires\t0\t1000,50'
    const r = parseBalanceInput(text)
    expect(r).toHaveLength(2)
    expect(r[0]).toEqual({
      compte: '512',
      libelle: 'Banque',
      debit: 1000.5,
      credit: 0,
    })
    expect(r[1].credit).toBe(1000.5)
  })

  it('parses semicolon-separated lines', () => {
    const r = parseBalanceInput('606;Charges;500;0')
    expect(r[0]).toEqual({
      compte: '606',
      libelle: 'Charges',
      debit: 500,
      credit: 0,
    })
  })

  it('ignores blank lines and defaults missing amounts to 0', () => {
    const r = parseBalanceInput('\n512\tBanque\n\n')
    expect(r).toHaveLength(1)
    expect(r[0]).toEqual({
      compte: '512',
      libelle: 'Banque',
      debit: 0,
      credit: 0,
    })
  })

  it('returns empty for empty input', () => {
    expect(parseBalanceInput('')).toEqual([])
  })
})

describe('controleTantiemes', () => {
  it('accepts an exact base', () => {
    expect(controleTantiemes(10000, 10000)).toEqual({ ok: true, ecart: 0 })
  })
  it('reports the écart on a mismatch', () => {
    expect(controleTantiemes(999, 1000)).toEqual({ ok: false, ecart: -1 })
    expect(controleTantiemes(1002, 1000)).toEqual({ ok: false, ecart: 2 })
  })
})

describe('PASSATION_CHECKLIST', () => {
  it('covers the key passation documents', () => {
    const keys = PASSATION_CHECKLIST.map(i => i.key)
    expect(keys).toContain('etat_comptes')
    expect(keys).toContain('soldes_coproprietaires')
    expect(keys).toContain('tantiemes')
  })
})
