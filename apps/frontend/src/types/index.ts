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
  numero_immatriculation: string | null
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
  date_vote: string | null
  notes: string | null
  postes?: PosteDepense[]
  created_at: string
  updated_at: string
}

export interface PosteDepense {
  id: number
  budget_id: number
  nom: string
  categorie: string | null
  montant_prevu: number
  montant_reel: number | null
  cle_repartition_id: number | null
  cle_nom?: string
  created_at: string
  updated_at: string
}

export interface AppelFonds {
  id: number
  copropriete_id: number
  budget_id: number | null
  trimestre: number
  annee: number
  montant_total: number
  date_emission: string
  date_echeance: string
  statut: 'brouillon' | 'emis' | 'cloture'
  lignes?: AppelFondsLigne[]
  created_at: string
  updated_at: string
}

export interface AppelFondsLigne {
  id: number
  appel_fonds_id: number
  lot_id: number
  coproprietaire_id: number | null
  montant: number
  lot_numero?: string
  coproprietaire_nom?: string
  coproprietaire_prenom?: string
  created_at: string
  updated_at: string
}

export type ModePaiement = 'virement' | 'cheque' | 'prelevement' | 'especes' | 'autre'

export interface Paiement {
  id: number
  coproprietaire_id: number
  appel_fonds_id: number | null
  montant: number
  date_paiement: string
  mode: ModePaiement
  reference: string | null
  notes: string | null
  nom?: string
  prenom?: string
  created_at: string
  updated_at: string
}

export interface FondsTravaux {
  id: number
  copropriete_id: number
  annee: number
  cotisation_annuelle: number
  solde: number
  created_at: string
  updated_at: string
}

export interface SoldeCoproprietaire {
  total_du: number
  total_paye: number
  solde: number
}

// ============================================
// Assemblée Générale Types
// ============================================

export type TypeMajorite = 'article_24' | 'article_25' | 'article_26' | 'unanimite'

export interface AssembleeGenerale {
  id: number
  copropriete_id: number
  date: string
  heure: string | null
  lieu: string | null
  type: 'ordinaire' | 'extraordinaire'
  statut: 'planifiee' | 'convoquee' | 'en_cours' | 'terminee' | 'annulee'
  date_convocation: string | null
  ordre_du_jour: string | null
  pv_url: string | null
  notes: string | null
  resolutions?: Resolution[]
  presences?: PresenceAG[]
  created_at: string
  updated_at: string
}

export interface Resolution {
  id: number
  ag_id: number
  numero: number
  titre: string
  description: string | null
  majorite: TypeMajorite
  resultat: 'adoptee' | 'rejetee' | 'ajournee' | null
  voix_pour: number
  voix_contre: number
  abstentions: number
  created_at: string
  updated_at: string
}

export interface PresenceAG {
  id: number
  ag_id: number
  coproprietaire_id: number
  statut: 'present' | 'absent' | 'represente'
  represente_par_id: number | null
  tantiemes: number
  coproprietaire_nom?: string
  coproprietaire_prenom?: string
  represente_par_nom?: string
  represente_par_prenom?: string
  created_at: string
  updated_at: string
}

// ============================================
// Travaux & Incidents Types
// ============================================

export type UrgenceIncident = 'faible' | 'moyenne' | 'haute' | 'critique'
export type StatutIncident = 'ouvert' | 'en_cours' | 'resolu' | 'ferme'
export type StatutIntervention = 'en_attente' | 'planifiee' | 'en_cours' | 'terminee' | 'annulee'

export interface Incident {
  id: number
  copropriete_id: number
  lot_id: number | null
  signale_par_id: number | null
  titre: string
  description: string | null
  categorie: string | null
  urgence: UrgenceIncident
  statut: StatutIncident
  date_signalement: string
  date_resolution: string | null
  notes: string | null
  lot_numero?: string
  signale_par_nom?: string
  signale_par_prenom?: string
  created_at: string
  updated_at: string
}

export interface Intervention {
  id: number
  incident_id: number | null
  copropriete_id: number
  prestataire: string | null
  description: string | null
  montant_devis: number | null
  montant_facture: number | null
  date_prevue: string | null
  date_realisation: string | null
  statut: StatutIntervention
  notes: string | null
  incident_titre?: string
  created_at: string
  updated_at: string
}

export interface CarnetEntretien {
  id: number
  copropriete_id: number
  titre: string
  description: string | null
  prestataire: string | null
  montant: number | null
  date_realisation: string
  categorie: string | null
  intervention_id: number | null
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
