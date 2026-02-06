// ============================================
// User & Auth Types
// ============================================

export type UserRole = 'admin' | 'user' | 'syndic' | 'coproprietaire'

export interface User {
  id: string
  email: string
  firstname: string
  lastname: string
  role: UserRole
}

// ============================================
// Copropriété Types
// ============================================

export interface Copropriete {
  id: number
  nom: string
  adresse: string
  code_postal: string
  ville: string
  date_creation: string
  nombre_lots: number
  created_at: string
  updated_at: string
}

// ============================================
// Lot Types
// ============================================

export type TypeLot = 'appartement' | 'cave' | 'parking' | 'commerce' | 'bureau' | 'autre'

export interface Lot {
  id: number
  copropriete_id: number
  coproprietaire_id: number | null
  numero: string
  type: TypeLot
  surface: number | null
  etage: number | null
  tantiemes: number
  description: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Copropriétaire Types
// ============================================

export interface Coproprietaire {
  id: number
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  adresse_correspondance: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Charges & Budget Types
// ============================================

export interface BudgetPrevisionnel {
  id: number
  copropriete_id: number
  annee: number
  montant_total: number
  statut: 'brouillon' | 'vote' | 'approuve'
  created_at: string
  updated_at: string
}

export interface AppelFonds {
  id: number
  copropriete_id: number
  trimestre: number
  annee: number
  montant_total: number
  date_emission: string
  date_echeance: string
  created_at: string
  updated_at: string
}

// ============================================
// Assemblée Générale Types
// ============================================

export type TypeMajorite = 'article_24' | 'article_25' | 'article_26' | 'unanimite'

export interface AssembleeGenerale {
  id: number
  copropriete_id: number
  date: string
  lieu: string | null
  type: 'ordinaire' | 'extraordinaire'
  statut: 'planifiee' | 'convoquee' | 'en_cours' | 'terminee'
  created_at: string
  updated_at: string
}

// ============================================
// Travaux & Incidents Types
// ============================================

export type UrgenceIncident = 'faible' | 'moyenne' | 'haute' | 'critique'
export type StatutIntervention = 'en_attente' | 'en_cours' | 'termine' | 'annule'

export interface Incident {
  id: number
  copropriete_id: number
  titre: string
  description: string
  categorie: string
  urgence: UrgenceIncident
  statut: StatutIntervention
  date_signalement: string
  created_at: string
  updated_at: string
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
}

export interface ApiError {
  error: string
  message?: string
  details?: string[]
}
