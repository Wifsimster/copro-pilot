/**
 * Test data factories.
 * Each function returns a plain object with sensible defaults.
 * Pass an overrides object to customise any field.
 */

let _seq = 0
const nextId = () => ++_seq

export function resetSequence() {
  _seq = 0
}

export function buildCopropriete(overrides = {}) {
  const id = overrides.id ?? nextId()
  return {
    id,
    nom: `Résidence ${id}`,
    adresse: `${id} Rue de la Paix`,
    code_postal: '75001',
    ville: 'Paris',
    nombre_lots: 20,
    nombre_batiments: 1,
    nombre_ascenseurs: 0,
    annee_construction: 1980,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function buildCoproprietaire(overrides = {}) {
  const id = overrides.id ?? nextId()
  return {
    id,
    nom: `Dupont${id}`,
    prenom: `Jean${id}`,
    email: `dupont${id}@test.fr`,
    telephone: '0600000000',
    adresse: `${id} Rue Test`,
    code_postal: '75001',
    ville: 'Paris',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function buildLot(overrides = {}) {
  const id = overrides.id ?? nextId()
  return {
    id,
    copropriete_id: overrides.copropriete_id ?? 1,
    coproprietaire_id: overrides.coproprietaire_id ?? null,
    numero: `A${String(id).padStart(3, '0')}`,
    type: 'appartement',
    etage: 1,
    superficie: 50,
    tantiemes: 100,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function buildPaiement(overrides = {}) {
  const id = overrides.id ?? nextId()
  return {
    id,
    coproprietaire_id: overrides.coproprietaire_id ?? 1,
    appel_fonds_id: overrides.appel_fonds_id ?? null,
    montant: 250.00,
    date_paiement: '2025-04-01',
    mode: 'virement',
    reference: `PAI-${id}`,
    notes: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function buildAppelFonds(overrides = {}) {
  const id = overrides.id ?? nextId()
  return {
    id,
    copropriete_id: overrides.copropriete_id ?? 1,
    budget_id: overrides.budget_id ?? null,
    trimestre: 1,
    annee: 2025,
    montant_total: 10000,
    date_emission: '2025-01-01',
    date_echeance: '2025-03-30',
    statut: 'brouillon',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function buildBudget(overrides = {}) {
  const id = overrides.id ?? nextId()
  return {
    id,
    copropriete_id: overrides.copropriete_id ?? 1,
    annee: 2025,
    montant_total: 40000,
    statut: 'vote',
    notes: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function buildMutation(overrides = {}) {
  const id = overrides.id ?? nextId()
  return {
    id,
    lot_id: overrides.lot_id ?? 1,
    ancien_proprietaire_id: overrides.ancien_proprietaire_id ?? null,
    nouveau_proprietaire_id: overrides.nouveau_proprietaire_id ?? null,
    date_mutation: '2025-06-01',
    type: 'vente',
    notes: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}
