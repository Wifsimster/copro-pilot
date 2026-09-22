import { describe, it, expect } from 'vitest'
import { lotSchema, paiementSchema } from '../src/schemas/index.js'

describe('schemas keep the fields the models persist', () => {
  it('paiementSchema keeps appel_fonds_id and notes', () => {
    const data = paiementSchema.parse({
      coproprietaire_id: 1,
      appel_fonds_id: 7,
      montant: 100,
      date_paiement: '2026-01-15',
      mode: 'virement',
      notes: 'T1',
    })
    expect(data.appel_fonds_id).toBe(7)
    expect(data.notes).toBe('T1')
  })

  it('lotSchema keeps owner, surface and description', () => {
    const data = lotSchema.parse({
      copropriete_id: 1,
      coproprietaire_id: 3,
      numero: 'A1',
      type: 'appartement',
      surface: 52.5,
      tantiemes: 100,
      description: 'T3',
    })
    expect(data).toMatchObject({
      coproprietaire_id: 3,
      surface: 52.5,
      description: 'T3',
    })
  })
})
