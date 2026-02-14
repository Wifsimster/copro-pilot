import { describe, it, expect } from 'vitest'
import { z } from 'zod'

/**
 * Tests for the Zod validation schemas used across form dialogs.
 * Schemas are reconstructed here to test the validation rules in isolation,
 * matching the schemas defined in each FormDialog component.
 */

// ─── Copropriete schema ────────────────────────────────────────────────

const coproprieteSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  adresse: z.string().min(1, "L'adresse est obligatoire"),
  code_postal: z.string().min(1, 'Le code postal est obligatoire').max(10),
  ville: z.string().min(1, 'La ville est obligatoire'),
  nombre_lots: z.coerce.number().min(0).optional(),
  numero_immatriculation: z.string().optional(),
  nombre_batiments: z.coerce.number().min(0).optional(),
  nombre_ascenseurs: z.coerce.number().min(0).optional(),
  periode_construction: z.string().optional(),
  type_chauffage: z.enum(['individuel', 'collectif', 'mixte']).optional().or(z.literal('')),
  energie_chauffage: z.enum(['gaz', 'electricite', 'fioul', 'bois', 'pompe_chaleur', 'reseau_chaleur', 'autre']).optional().or(z.literal('')),
})

describe('coproprieteSchema', () => {
  it('accepts valid full data', () => {
    const result = coproprieteSchema.safeParse({
      nom: 'Résidence A',
      adresse: '1 Rue de la Paix',
      code_postal: '75001',
      ville: 'Paris',
      nombre_lots: 20,
      type_chauffage: 'collectif',
    })
    expect(result.success).toBe(true)
  })

  it('accepts minimal required fields only', () => {
    const result = coproprieteSchema.safeParse({
      nom: 'Test',
      adresse: 'Addr',
      code_postal: '75000',
      ville: 'Paris',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty nom', () => {
    const result = coproprieteSchema.safeParse({
      nom: '',
      adresse: '1 Rue',
      code_postal: '75001',
      ville: 'Paris',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty adresse', () => {
    const result = coproprieteSchema.safeParse({
      nom: 'Test',
      adresse: '',
      code_postal: '75001',
      ville: 'Paris',
    })
    expect(result.success).toBe(false)
  })

  it('rejects code_postal longer than 10 chars', () => {
    const result = coproprieteSchema.safeParse({
      nom: 'Test',
      adresse: 'Addr',
      code_postal: '12345678901',
      ville: 'Paris',
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative nombre_lots', () => {
    const result = coproprieteSchema.safeParse({
      nom: 'Test',
      adresse: 'Addr',
      code_postal: '75001',
      ville: 'Paris',
      nombre_lots: -1,
    })
    expect(result.success).toBe(false)
  })

  it('accepts empty string for type_chauffage', () => {
    const result = coproprieteSchema.safeParse({
      nom: 'Test',
      adresse: 'Addr',
      code_postal: '75001',
      ville: 'Paris',
      type_chauffage: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid type_chauffage value', () => {
    const result = coproprieteSchema.safeParse({
      nom: 'Test',
      adresse: 'Addr',
      code_postal: '75001',
      ville: 'Paris',
      type_chauffage: 'solaire',
    })
    expect(result.success).toBe(false)
  })
})

// ─── Lot schema ────────────────────────────────────────────────────────

const lotSchema = z.object({
  numero: z.string().min(1, 'Le numero est obligatoire'),
  type: z.enum(['appartement', 'cave', 'parking', 'commerce', 'bureau', 'autre']),
  surface: z.coerce.number().positive('La surface doit etre positive').optional().or(z.literal('')),
  etage: z.coerce.number().optional().or(z.literal('')),
  tantiemes: z.coerce.number().min(1, 'Les tantiemes sont obligatoires'),
  description: z.string().optional(),
})

describe('lotSchema', () => {
  it('accepts valid lot data', () => {
    const result = lotSchema.safeParse({
      numero: 'A101',
      type: 'appartement',
      surface: 65.5,
      tantiemes: 150,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty numero', () => {
    const result = lotSchema.safeParse({
      numero: '',
      type: 'appartement',
      tantiemes: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid type', () => {
    const result = lotSchema.safeParse({
      numero: 'A1',
      type: 'maison',
      tantiemes: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero tantiemes', () => {
    const result = lotSchema.safeParse({
      numero: 'A1',
      type: 'cave',
      tantiemes: 0,
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid types', () => {
    const types = ['appartement', 'cave', 'parking', 'commerce', 'bureau', 'autre']
    for (const type of types) {
      const result = lotSchema.safeParse({ numero: 'A1', type, tantiemes: 100 })
      expect(result.success).toBe(true)
    }
  })
})

// ─── Coproprietaire schema ─────────────────────────────────────────────

const coproprietaireSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prenom est obligatoire'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().optional(),
  adresse_correspondance: z.string().optional(),
})

describe('coproprietaireSchema', () => {
  it('accepts valid data', () => {
    const result = coproprietaireSchema.safeParse({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean@dupont.fr',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty email string', () => {
    const result = coproprietaireSchema.safeParse({
      nom: 'Dupont',
      prenom: 'Jean',
      email: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email format', () => {
    const result = coproprietaireSchema.safeParse({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty nom', () => {
    const result = coproprietaireSchema.safeParse({
      nom: '',
      prenom: 'Jean',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty prenom', () => {
    const result = coproprietaireSchema.safeParse({
      nom: 'Dupont',
      prenom: '',
    })
    expect(result.success).toBe(false)
  })
})

// ─── Budget schema ─────────────────────────────────────────────────────

const budgetSchema = z.object({
  annee: z.coerce.number().min(2000).max(2100),
  montant_total: z.coerce.number().min(0, 'Le montant doit etre positif'),
  statut: z.enum(['brouillon', 'vote', 'approuve']),
  notes: z.string().optional(),
})

describe('budgetSchema', () => {
  it('accepts valid budget', () => {
    const result = budgetSchema.safeParse({
      annee: 2025,
      montant_total: 50000,
      statut: 'brouillon',
    })
    expect(result.success).toBe(true)
  })

  it('rejects year below 2000', () => {
    const result = budgetSchema.safeParse({
      annee: 1999,
      montant_total: 50000,
      statut: 'brouillon',
    })
    expect(result.success).toBe(false)
  })

  it('rejects year above 2100', () => {
    const result = budgetSchema.safeParse({
      annee: 2101,
      montant_total: 50000,
      statut: 'brouillon',
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative montant_total', () => {
    const result = budgetSchema.safeParse({
      annee: 2025,
      montant_total: -100,
      statut: 'approuve',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid statut', () => {
    const result = budgetSchema.safeParse({
      annee: 2025,
      montant_total: 50000,
      statut: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid statuts', () => {
    for (const statut of ['brouillon', 'vote', 'approuve']) {
      const result = budgetSchema.safeParse({ annee: 2025, montant_total: 100, statut })
      expect(result.success).toBe(true)
    }
  })
})

// ─── Appel de fonds schema ─────────────────────────────────────────────

const appelSchema = z.object({
  trimestre: z.coerce.number().min(1).max(4),
  annee: z.coerce.number().min(2000).max(2100),
  montant_total: z.coerce.number().min(0, 'Le montant doit etre positif'),
  date_emission: z.string().min(1, 'La date est obligatoire'),
  date_echeance: z.string().min(1, 'La date est obligatoire'),
})

describe('appelSchema', () => {
  it('accepts valid appel', () => {
    const result = appelSchema.safeParse({
      trimestre: 1,
      annee: 2025,
      montant_total: 12000,
      date_emission: '2025-01-01',
      date_echeance: '2025-03-31',
    })
    expect(result.success).toBe(true)
  })

  it('rejects trimestre 0', () => {
    const result = appelSchema.safeParse({
      trimestre: 0,
      annee: 2025,
      montant_total: 100,
      date_emission: '2025-01-01',
      date_echeance: '2025-03-31',
    })
    expect(result.success).toBe(false)
  })

  it('rejects trimestre 5', () => {
    const result = appelSchema.safeParse({
      trimestre: 5,
      annee: 2025,
      montant_total: 100,
      date_emission: '2025-01-01',
      date_echeance: '2025-03-31',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty date_emission', () => {
    const result = appelSchema.safeParse({
      trimestre: 1,
      annee: 2025,
      montant_total: 100,
      date_emission: '',
      date_echeance: '2025-03-31',
    })
    expect(result.success).toBe(false)
  })
})

// ─── Paiement schema ──────────────────────────────────────────────────

const paiementSchema = z.object({
  montant: z.coerce.number().positive('Le montant doit etre positif'),
  date_paiement: z.string().min(1, 'La date est obligatoire'),
  mode: z.enum(['virement', 'cheque', 'prelevement', 'especes', 'autre']),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

describe('paiementSchema', () => {
  it('accepts valid payment', () => {
    const result = paiementSchema.safeParse({
      montant: 500,
      date_paiement: '2025-01-15',
      mode: 'virement',
    })
    expect(result.success).toBe(true)
  })

  it('rejects zero montant', () => {
    const result = paiementSchema.safeParse({
      montant: 0,
      date_paiement: '2025-01-15',
      mode: 'cheque',
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative montant', () => {
    const result = paiementSchema.safeParse({
      montant: -10,
      date_paiement: '2025-01-15',
      mode: 'especes',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid payment modes', () => {
    for (const mode of ['virement', 'cheque', 'prelevement', 'especes', 'autre']) {
      const result = paiementSchema.safeParse({
        montant: 100,
        date_paiement: '2025-01-01',
        mode,
      })
      expect(result.success).toBe(true)
    }
  })
})

// ─── Incident schema ──────────────────────────────────────────────────

const incidentSchema = z.object({
  titre: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().optional(),
  categorie: z.string().optional(),
  urgence: z.enum(['faible', 'moyenne', 'haute', 'critique']),
  statut: z.enum(['ouvert', 'en_cours', 'resolu', 'ferme']),
  date_signalement: z.string().min(1, 'La date est obligatoire'),
})

describe('incidentSchema', () => {
  it('accepts valid incident', () => {
    const result = incidentSchema.safeParse({
      titre: 'Fuite d\'eau',
      urgence: 'haute',
      statut: 'ouvert',
      date_signalement: '2025-06-15',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty titre', () => {
    const result = incidentSchema.safeParse({
      titre: '',
      urgence: 'faible',
      statut: 'ouvert',
      date_signalement: '2025-06-15',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid urgence level', () => {
    const result = incidentSchema.safeParse({
      titre: 'Test',
      urgence: 'extreme',
      statut: 'ouvert',
      date_signalement: '2025-06-15',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all urgence levels', () => {
    for (const urgence of ['faible', 'moyenne', 'haute', 'critique']) {
      const result = incidentSchema.safeParse({
        titre: 'Test',
        urgence,
        statut: 'ouvert',
        date_signalement: '2025-06-15',
      })
      expect(result.success).toBe(true)
    }
  })
})

// ─── Contrat schema ───────────────────────────────────────────────────

const contratSchema = z.object({
  prestataire_id: z.coerce.number().min(1, 'Le prestataire est obligatoire'),
  objet: z.string().min(1, "L'objet est obligatoire"),
  type: z.string().optional(),
  date_debut: z.string().min(1, 'La date de debut est obligatoire'),
  date_fin: z.string().optional(),
  montant_annuel: z.coerce.number().optional(),
  frequence_paiement: z.enum(['mensuel', 'trimestriel', 'semestriel', 'annuel']),
  preavis_mois: z.coerce.number().optional(),
  reconduction_tacite: z.boolean(),
  conditions_resiliation: z.string().optional(),
  statut: z.enum(['actif', 'expire', 'resilie', 'en_attente']),
  notes: z.string().optional(),
})

describe('contratSchema', () => {
  it('accepts valid contract', () => {
    const result = contratSchema.safeParse({
      prestataire_id: 1,
      objet: 'Entretien espaces verts',
      date_debut: '2025-01-01',
      frequence_paiement: 'mensuel',
      reconduction_tacite: true,
      statut: 'actif',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing prestataire_id (zero)', () => {
    const result = contratSchema.safeParse({
      prestataire_id: 0,
      objet: 'Test',
      date_debut: '2025-01-01',
      frequence_paiement: 'annuel',
      reconduction_tacite: false,
      statut: 'actif',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty objet', () => {
    const result = contratSchema.safeParse({
      prestataire_id: 1,
      objet: '',
      date_debut: '2025-01-01',
      frequence_paiement: 'annuel',
      reconduction_tacite: false,
      statut: 'actif',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid frequence_paiement values', () => {
    for (const freq of ['mensuel', 'trimestriel', 'semestriel', 'annuel']) {
      const result = contratSchema.safeParse({
        prestataire_id: 1,
        objet: 'Test',
        date_debut: '2025-01-01',
        frequence_paiement: freq,
        reconduction_tacite: false,
        statut: 'actif',
      })
      expect(result.success).toBe(true)
    }
  })

  it('accepts all valid statut values', () => {
    for (const statut of ['actif', 'expire', 'resilie', 'en_attente']) {
      const result = contratSchema.safeParse({
        prestataire_id: 1,
        objet: 'Test',
        date_debut: '2025-01-01',
        frequence_paiement: 'mensuel',
        reconduction_tacite: true,
        statut,
      })
      expect(result.success).toBe(true)
    }
  })
})

// ─── Assurance schema ─────────────────────────────────────────────────

const assuranceSchema = z.object({
  compagnie: z.string().min(1, 'La compagnie est obligatoire'),
  numero_police: z.string().optional(),
  type: z.enum(['multirisque_immeuble', 'responsabilite_civile', 'dommages_ouvrage', 'protection_juridique', 'autre']),
  date_debut: z.string().min(1, 'La date de debut est obligatoire'),
  date_fin: z.string().optional(),
  prime_annuelle: z.string().optional(),
  franchise: z.string().optional(),
  statut: z.enum(['actif', 'expire', 'resilie']),
  notes: z.string().optional(),
})

describe('assuranceSchema', () => {
  it('accepts valid assurance data', () => {
    const result = assuranceSchema.safeParse({
      compagnie: 'AXA',
      type: 'multirisque_immeuble',
      date_debut: '2025-01-01',
      statut: 'actif',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty compagnie', () => {
    const result = assuranceSchema.safeParse({
      compagnie: '',
      type: 'autre',
      date_debut: '2025-01-01',
      statut: 'actif',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid insurance type', () => {
    const result = assuranceSchema.safeParse({
      compagnie: 'AXA',
      type: 'vie',
      date_debut: '2025-01-01',
      statut: 'actif',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid insurance types', () => {
    for (const type of ['multirisque_immeuble', 'responsabilite_civile', 'dommages_ouvrage', 'protection_juridique', 'autre']) {
      const result = assuranceSchema.safeParse({
        compagnie: 'AXA',
        type,
        date_debut: '2025-01-01',
        statut: 'actif',
      })
      expect(result.success).toBe(true)
    }
  })
})

// ─── Assemblee schema ─────────────────────────────────────────────────

const agSchema = z.object({
  date: z.string().min(1, 'La date est obligatoire'),
  heure: z.string().optional(),
  lieu: z.string().optional(),
  type: z.enum(['ordinaire', 'extraordinaire']),
  ordre_du_jour: z.string().optional(),
})

describe('agSchema (assemblée générale)', () => {
  it('accepts valid AG data', () => {
    const result = agSchema.safeParse({
      date: '2025-06-15',
      type: 'ordinaire',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty date', () => {
    const result = agSchema.safeParse({
      date: '',
      type: 'ordinaire',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid type', () => {
    const result = agSchema.safeParse({
      date: '2025-06-15',
      type: 'speciale',
    })
    expect(result.success).toBe(false)
  })

  it('accepts both AG types', () => {
    for (const type of ['ordinaire', 'extraordinaire']) {
      const result = agSchema.safeParse({ date: '2025-06-15', type })
      expect(result.success).toBe(true)
    }
  })
})
