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
  date_immatriculation: string | null
  date_derniere_maj_registre: string | null
  nombre_batiments: number
  nombre_ascenseurs: number
  periode_construction: string | null
  type_chauffage: 'individuel' | 'collectif' | 'mixte' | null
  energie_chauffage: 'gaz' | 'electricite' | 'fioul' | 'bois' | 'pompe_chaleur' | 'reseau_chaleur' | 'autre' | null
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
  user_id: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Parties Communes Types
// ============================================

export interface PartieCommune {
  id: number
  copropriete_id: number
  nom: string
  categorie: 'generales' | 'speciales'
  description: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Clé de Répartition Types
// ============================================

export interface CleRepartition {
  id: number
  copropriete_id: number
  nom: string
  description: string | null
  quote_parts?: LotCleRepartition[]
  created_at: string
  updated_at: string
}

export interface LotCleRepartition {
  id: number
  lot_id: number
  cle_repartition_id: number
  quote_part: number
  lot_numero?: string
  created_at: string
  updated_at: string
}

// ============================================
// Locataire Types
// ============================================

export interface Locataire {
  id: number
  lot_id: number
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  date_entree: string | null
  date_sortie: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Mutation Types
// ============================================

export type TypeMutation = 'vente' | 'donation' | 'succession' | 'autre'

export interface Mutation {
  id: number
  lot_id: number
  ancien_proprietaire_id: number | null
  nouveau_proprietaire_id: number | null
  date_mutation: string
  type: TypeMutation
  notes: string | null
  ancien_nom?: string
  ancien_prenom?: string
  nouveau_nom?: string
  nouveau_prenom?: string
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
// Comptabilité Réglementaire Types
// ============================================

export interface ExerciceComptable {
  id: number
  copropriete_id: number
  annee: number
  date_debut: string
  date_fin: string
  statut: 'ouvert' | 'cloture'
  date_cloture: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type TypeCompteComptable = 'actif' | 'passif' | 'charge' | 'produit'

export interface CompteComptable {
  id: number
  copropriete_id: number
  code: string
  libelle: string
  classe: number
  type: TypeCompteComptable
  actif: boolean
  created_at: string
  updated_at: string
}

export interface EcritureComptable {
  id: number
  exercice_id: number
  copropriete_id: number
  date_ecriture: string
  libelle: string
  compte_code: string
  debit: number
  credit: number
  piece_ref: string | null
  entite_type: string | null
  entite_id: number | null
  coproprietaire_id: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LigneBalance {
  compte_code: string
  libelle: string
  classe: number
  type: TypeCompteComptable
  total_debit: number
  total_credit: number
  solde: number
}

export interface LigneGrandLivre {
  compte_code: string
  total_debit: number
  total_credit: number
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
// Convocation AG Types
// ============================================

export type StatutConvocation = 'brouillon' | 'validee' | 'envoyee' | 'cloturee'
export type ModeEnvoi = 'email' | 'courrier_recommande' | 'les_deux'
export type StatutDestinataire = 'en_attente' | 'envoyee' | 'recue' | 'ar_signe'

export interface ConvocationAG {
  id: number
  ag_id: number
  date_envoi: string | null
  mode_envoi: ModeEnvoi
  statut: StatutConvocation
  contenu: string | null
  documents_annexes: string | null
  notes: string | null
  destinataires?: DestinataireConvocation[]
  created_at: string
  updated_at: string
}

export interface DestinataireConvocation {
  id: number
  convocation_id: number
  coproprietaire_id: number
  statut: StatutDestinataire
  date_envoi: string | null
  date_reception: string | null
  date_ar: string | null
  mode_envoi: 'email' | 'courrier_recommande' | null
  email_envoye_a: string | null
  notes: string | null
  coproprietaire_nom?: string
  coproprietaire_prenom?: string
  coproprietaire_email?: string
  created_at: string
  updated_at: string
}

export interface DelaiVerification {
  valide: boolean
  jours_restants: number
  date_ag: string
  date_limite_envoi: string
  message: string
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
// Conseil Syndical Types
// ============================================

export type RoleConseilSyndical = 'president' | 'membre' | 'suppleant'

export interface MembreConseilSyndical {
  id: number
  copropriete_id: number
  coproprietaire_id: number
  role: RoleConseilSyndical
  date_election: string
  date_fin_mandat: string | null
  ag_election_id: number | null
  notes: string | null
  coproprietaire_nom?: string
  coproprietaire_prenom?: string
  coproprietaire_email?: string
  created_at: string
  updated_at: string
}

// ============================================
// Diagnostic Types
// ============================================

export type TypeDiagnostic = 'dpe' | 'amiante' | 'plomb' | 'dtg' | 'ppt' | 'gaz' | 'electricite' | 'autre'
export type StatutDiagnostic = 'valide' | 'expire' | 'a_renouveler'

export interface Diagnostic {
  id: number
  copropriete_id: number
  type: TypeDiagnostic
  prestataire: string | null
  date_realisation: string
  date_validite: string | null
  document_url: string | null
  observations: string | null
  statut: StatutDiagnostic
  created_at: string
  updated_at: string
}

// ============================================
// Document Types
// ============================================

export type CategorieDocument = 'pv_ag' | 'contrat' | 'facture' | 'devis' | 'reglement' | 'assurance' | 'diagnostic' | 'courrier' | 'autre'

export type EntiteType = 'ag' | 'intervention' | 'budget' | 'contrat' | 'sinistre'

export interface Document {
  id: number
  copropriete_id: number
  nom: string
  categorie: CategorieDocument
  fichier_nom: string
  fichier_path: string
  mime_type: string | null
  taille: number | null
  description: string | null
  entite_type: EntiteType | null
  entite_id: number | null
  created_at: string
  updated_at: string
}

// ============================================
// Prestataire & Contrat Types
// ============================================

export interface Prestataire {
  id: number
  nom: string
  siret: string | null
  specialite: string | null
  contact_nom: string | null
  contact_email: string | null
  contact_telephone: string | null
  adresse: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type StatutContrat = 'actif' | 'expire' | 'resilie' | 'en_attente'
export type FrequencePaiement = 'mensuel' | 'trimestriel' | 'semestriel' | 'annuel'

export interface Contrat {
  id: number
  copropriete_id: number
  prestataire_id: number
  objet: string
  type: string | null
  date_debut: string
  date_fin: string | null
  montant_annuel: number | null
  frequence_paiement: FrequencePaiement
  conditions_resiliation: string | null
  preavis_mois: number | null
  reconduction_tacite: boolean
  statut: StatutContrat
  notes: string | null
  prestataire_nom?: string
  prestataire_specialite?: string
  created_at: string
  updated_at: string
}

// ============================================
// Compte Bancaire Types
// ============================================

export type TypeCompte = 'courant' | 'fonds_travaux' | 'emprunt'
export type TypeMouvement = 'credit' | 'debit'

export interface CompteBancaire {
  id: number
  copropriete_id: number
  banque: string
  iban: string
  bic: string | null
  type: TypeCompte
  libelle: string | null
  solde: number
  date_ouverture: string | null
  actif: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MouvementBancaire {
  id: number
  compte_id: number
  date: string
  libelle: string
  montant: number
  type: TypeMouvement
  categorie: string | null
  reference: string | null
  paiement_id: number | null
  rapproche: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Fiche Synthetique Types
// ============================================

export interface FicheSynthetique {
  identification: {
    nom: string
    adresse: string
    code_postal: string
    ville: string
    numero_immatriculation: string | null
    date_creation: string | null
    nombre_batiments: number
    nombre_ascenseurs: number
    periode_construction: string | null
    type_chauffage: string | null
    energie_chauffage: string | null
  }
  lots: {
    total: number
    total_tantiemes: number
    par_type: { type: string; count: number }[]
    nombre_coproprietaires: number
  }
  finances: {
    budget_previsionnel: {
      annee: number
      montant_total: number
      statut: string
    } | null
    postes_depenses: {
      nom: string
      categorie: string | null
      montant_prevu: number
      montant_reel: number
    }[]
    impayes: number
    fonds_travaux: number
  }
  diagnostics: {
    type: string
    statut: string
    date_realisation: string
    date_validite: string | null
  }[]
  contentieux: {
    incidents_en_cours: number
  }
  prochaine_ag: {
    date: string
    type: string
    statut: string
  } | null
}

// ============================================
// Assurance & Sinistre Types
// ============================================

export type TypeAssurance = 'multirisque_immeuble' | 'responsabilite_civile' | 'dommages_ouvrage' | 'protection_juridique' | 'autre'
export type StatutAssurance = 'actif' | 'expire' | 'resilie'
export type StatutSinistre = 'declare' | 'en_instruction' | 'accepte' | 'refuse' | 'clos'

export interface Assurance {
  id: number
  copropriete_id: number
  compagnie: string
  numero_police: string | null
  type: TypeAssurance
  date_debut: string
  date_fin: string | null
  prime_annuelle: number | null
  franchise: number | null
  statut: StatutAssurance
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Sinistre {
  id: number
  assurance_id: number | null
  incident_id: number | null
  copropriete_id: number
  numero_sinistre: string | null
  date_sinistre: string
  date_declaration: string | null
  description: string | null
  montant_estime: number | null
  montant_indemnise: number | null
  statut: StatutSinistre
  notes: string | null
  assurance_compagnie?: string
  assurance_numero_police?: string
  incident_titre?: string
  created_at: string
  updated_at: string
}

// ============================================
// Contentieux Types
// ============================================

export type TypeRelance = 'amiable' | 'mise_en_demeure' | 'contentieux'
export type StatutRelance = 'brouillon' | 'envoyee' | 'accusee_reception' | 'sans_effet'

export interface Relance {
  id: number
  copropriete_id: number
  coproprietaire_id: number
  type: TypeRelance
  date_relance: string
  montant_du: number
  mode_envoi: string | null
  statut: StatutRelance
  notes: string | null
  coproprietaire_nom?: string
  coproprietaire_prenom?: string
  created_at: string
  updated_at: string
}

export type StatutProcedure = 'en_preparation' | 'en_cours' | 'audience_fixee' | 'juge' | 'execute' | 'clos'

export interface Procedure {
  id: number
  copropriete_id: number
  coproprietaire_id: number
  avocat: string | null
  tribunal: string | null
  reference_dossier: string | null
  date_assignation: string | null
  date_audience: string | null
  date_jugement: string | null
  montant_reclame: number | null
  montant_obtenu: number | null
  frais_procedure: number | null
  statut: StatutProcedure
  decision: string | null
  notes: string | null
  coproprietaire_nom?: string
  coproprietaire_prenom?: string
  created_at: string
  updated_at: string
}

// ============================================
// Reglement de Copropriete Types
// ============================================

export type DestinationImmeuble = 'habitation' | 'commerce' | 'mixte'
export type CategorieArticle = 'parties_privatives' | 'parties_communes' | 'charges' | 'usage' | 'travaux' | 'conseil_syndical' | 'ag' | 'autre'

export interface ReglementCopropriete {
  id: number
  copropriete_id: number
  date_etablissement: string
  date_derniere_modification: string | null
  notaire: string | null
  destination_immeuble: DestinationImmeuble
  restrictions_usage: string | null
  conditions_travaux: string | null
  composition_conseil_syndical: string | null
  modalites_convocation_ag: string | null
  document_url: string | null
  notes: string | null
  articles?: ArticleReglement[]
  created_at: string
  updated_at: string
}

export interface ArticleReglement {
  id: number
  reglement_id: number
  numero: string
  titre: string
  contenu: string | null
  categorie: CategorieArticle
  ordre: number
  notes: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Notification Types
// ============================================

export type TypeNotification = 'incident' | 'ag' | 'paiement' | 'document' | 'general'

export interface Notification {
  id: number
  user_id: string
  copropriete_id: number | null
  type: TypeNotification
  titre: string
  message: string | null
  lu: boolean
  lien: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Global Search Types
// ============================================

export interface SearchResults {
  coproprietes: Pick<Copropriete, 'id' | 'nom' | 'adresse' | 'ville' | 'code_postal'>[]
  coproprietaires: Pick<Coproprietaire, 'id' | 'nom' | 'prenom' | 'email'>[]
  contrats: {
    id: number
    objet: string
    type: string | null
    statut: string
    prestataire_nom: string | null
  }[]
  incidents: Pick<Incident, 'id' | 'titre' | 'categorie' | 'urgence' | 'statut'>[]
  documents: Pick<Document, 'id' | 'nom' | 'categorie'>[]
  assemblees: Pick<AssembleeGenerale, 'id' | 'date' | 'type' | 'statut' | 'lieu'>[]
  assurances: Pick<Assurance, 'id' | 'compagnie' | 'numero_police' | 'type' | 'statut'>[]
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

// ============================================
// Employe Syndicat Types
// ============================================

export type TypeContrat = 'cdi' | 'cdd' | 'interim' | 'saisonnier'
export type StatutEmploye = 'actif' | 'inactif'

export interface EmployeSyndicat {
  id: number
  copropriete_id: number
  nom: string
  prenom: string
  poste: string
  type_contrat: TypeContrat
  date_embauche: string
  date_fin: string | null
  salaire_brut: number | null
  logement_fonction: boolean
  statut: StatutEmploye
  notes: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Declaration Registre Types
// ============================================

export type StatutDeclaration = 'brouillon' | 'soumis' | 'valide'

export interface DeclarationRegistre {
  id: number
  copropriete_id: number
  annee: number
  date_declaration: string | null
  donnees_declarees: DonneesDeclarees | null
  statut: StatutDeclaration
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DonneesDeclarees {
  identification: {
    nom: string
    adresse: string
    code_postal: string
    ville: string
    numero_immatriculation: string | null
    date_creation: string | null
    nombre_batiments: number
    nombre_ascenseurs: number
    periode_construction: string | null
    type_chauffage: string | null
    energie_chauffage: string | null
  }
  gouvernance?: {
    syndic_nom: string
    contrat_date_debut: string
    contrat_date_fin: string
    remuneration_forfait: number | null
    contrat_statut: string
  } | null
  lots: {
    total: number
    total_tantiemes: number
    par_type: { type: string; count: number }[]
    nombre_coproprietaires: number
  }
  finances: {
    budget_annee: number
    budget_montant: number | null
    budget_statut: string | null
    appels_fonds_nombre: number
    appels_fonds_montant: number
    fonds_travaux_cotisation: number | null
    fonds_travaux_solde: number | null
    total_impayes?: number
  }
  assemblee_generale?: {
    derniere_ag_date: string
    derniere_ag_type: string
  } | null
  procedures?: {
    nombre_actives: number
    montant_total_reclame: number
  }
  diagnostics?: {
    type: string
    statut: string
    date_realisation: string | null
    date_validite: string | null
  }[]
  personnel: {
    nombre_employes: number
    employes: {
      nom: string
      prenom: string
      poste: string
      type_contrat: string
    }[]
  }
}

// Contrats de syndic
export interface ContratSyndic {
  id: number
  copropriete_id: number
  syndic_nom: string
  date_debut: string
  date_fin: string
  remuneration_forfait: number | null
  prestations_incluses: string | null
  prestations_particulieres: string | null
  conditions_execution: string | null
  statut: 'en_cours' | 'expire' | 'resilie' | 'en_attente'
  ag_designation_id: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Propositions de syndic (mise en concurrence)
export interface PropositionSyndic {
  id: number
  copropriete_id: number
  syndic_nom: string
  date_reception: string
  montant_propose: number | null
  prestations_proposees: string | null
  document_url: string | null
  retenue: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Extranet Copropriétaire Types
// ============================================

export interface ExtranetProfil {
  coproprietaire: Coproprietaire
  lots: Lot[]
  coproprietes: Copropriete[]
  conseilSyndical: { copropriete_id: number; role: string }[]
}

export interface ExtranetCompte {
  total_du: number
  total_paye: number
  solde: number
}

export interface ExtranetChargeLigne {
  id: number
  appel_fonds_id: number
  montant: number
  trimestre: number
  annee: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ExtranetDocuments {
  documents: Document[]
  pvAG: AssembleeGenerale[]
  diagnostics: any[]
  assurances: Assurance[]
  contrats: any[]
  contratSyndic: any | null
}

export interface ExtranetConseilSyndical {
  coproprietaires: Coproprietaire[]
  soldes: { coproprietaire_id: number; nom: string; prenom: string; total_du: number; total_paye: number; solde: number }[]
  comptesBancaires: unknown[]
}

// ============================================
// Cycle Annuel (Workflow) Types
// ============================================

export type StatutTacheAnnuelle =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue'

export interface TacheAnnuelle {
  id: number
  copropriete_id: number
  annee: number
  tache_code: string
  tache_label: string
  statut: StatutTacheAnnuelle
  date_echeance: string | null
  date_completion: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TacheDefinition {
  code: string
  label: string
}

export interface CycleAnnuelSummary {
  total: number
  completed: number
  percentage: number
}
