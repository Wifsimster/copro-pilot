import { describe, it, expect } from 'vitest'
import {
  assembleeSchema,
  contratSchema,
  coproprieteSchema,
  incidentSchema,
  lotSchema,
  paiementSchema,
} from '../src/schemas/index.js'

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

describe('schemas accept what the forms send', () => {
  it('copropriété with default (0 / empty / null) values', () => {
    const data = coproprieteSchema.parse({
      nom: 'Les Tilleuls',
      adresse: '1 rue A',
      code_postal: '75001',
      ville: 'Paris',
      nombre_lots: 0,
      numero_immatriculation: '',
      nombre_batiments: 2,
      nombre_ascenseurs: 0,
      periode_construction: '',
      type_chauffage: null,
      energie_chauffage: 'gaz',
    })
    expect(data).toMatchObject({
      nombre_batiments: 2,
      energie_chauffage: 'gaz',
    })
  })

  it('incident without description keeps categorie and date', () => {
    const data = incidentSchema.parse({
      copropriete_id: 1,
      titre: 'Fuite',
      description: null,
      categorie: 'plomberie',
      urgence: 'haute',
      statut: 'ouvert',
      date_signalement: '2026-09-01',
    })
    expect(data).toMatchObject({
      categorie: 'plomberie',
      date_signalement: '2026-09-01',
    })
  })

  it('AG without lieu keeps heure and ordre du jour', () => {
    const data = assembleeSchema.parse({
      copropriete_id: 1,
      date: '2026-10-01',
      type: 'ordinaire',
      heure: '18:00',
      lieu: null,
      ordre_du_jour: 'Budget',
    })
    expect(data).toMatchObject({ heure: '18:00', ordre_du_jour: 'Budget' })
  })

  it('contrat without amount keeps its other fields', () => {
    const data = contratSchema.parse({
      copropriete_id: 1,
      prestataire_id: 2,
      objet: 'Ascenseur',
      date_debut: '2026-01-01',
      date_fin: null,
      montant_annuel: null,
      frequence_paiement: 'mensuel',
      reconduction_tacite: true,
      statut: 'actif',
      notes: 'n',
    })
    expect(data).toMatchObject({ frequence_paiement: 'mensuel', notes: 'n' })
  })

  it('PUT schemas accept partial payloads', () => {
    expect(assembleeSchema.partial().parse({ statut: 'terminee' })).toEqual({
      statut: 'terminee',
    })
  })
})
