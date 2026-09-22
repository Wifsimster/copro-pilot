import { z } from 'zod'
import {
  URGENCE_INCIDENT,
  STATUT_INCIDENT,
} from '@copro-pilot/shared-enums'

// Optional text/number the forms send as null (or '') when left empty
const optionalText = z.string().optional().nullable()
const optionalCount = z.number().int().nonnegative().optional().nullable()

export const coproprieteSchema = z.object({
  nom: z.string().min(1).max(255),
  adresse: z.string().min(1).max(500),
  code_postal: z.string().regex(/^\d{5}$/),
  ville: z.string().min(1).max(255),
  nombre_lots: optionalCount,
  numero_immatriculation: z.string().max(50).optional().nullable(),
  date_creation: optionalText,
  date_immatriculation: optionalText,
  nombre_batiments: optionalCount,
  nombre_ascenseurs: optionalCount,
  periode_construction: optionalText,
  type_chauffage: z
    .enum(['individuel', 'collectif', 'mixte'])
    .optional()
    .nullable(),
  energie_chauffage: z
    .enum([
      'gaz',
      'electricite',
      'fioul',
      'bois',
      'pompe_chaleur',
      'reseau_chaleur',
      'autre',
    ])
    .optional()
    .nullable(),
  reglement_copropriete_url: optionalText,
  notes: optionalText,
})

export const coproprietaireSchema = z.object({
  nom: z.string().min(1).max(255),
  prenom: z.string().min(1).max(255),
  email: z.string().email().max(255).optional().nullable(),
  telephone: z.string().max(20).optional().nullable(),
  adresse: z.string().max(500).optional().nullable(),
})

export const lotSchema = z.object({
  copropriete_id: z.number().int().positive(),
  numero: z.string().min(1).max(50),
  type: z.string().min(1).max(100),
  coproprietaire_id: z.number().int().positive().optional().nullable(),
  etage: z.number().int().optional().nullable(),
  surface: z.number().positive().optional().nullable(),
  tantiemes: z.number().int().positive(),
  description: z.string().optional().nullable(),
})

export const paiementSchema = z.object({
  coproprietaire_id: z.number().int().positive(),
  appel_fonds_id: z.number().int().positive().optional().nullable(),
  montant: z.number().positive(),
  date_paiement: z.string().min(1),
  mode: z.string().min(1).max(50),
  reference: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const budgetSchema = z.object({
  copropriete_id: z.number().int().positive(),
  annee: z.number().int().min(1900).max(2100),
  montant_total: z.number().positive(),
})

export const incidentSchema = z.object({
  copropriete_id: z.number().int().positive(),
  titre: z.string().min(1).max(255),
  description: optionalText,
  categorie: optionalText,
  urgence: z.enum(URGENCE_INCIDENT),
  statut: z.enum(STATUT_INCIDENT).optional(),
  lot_id: z.number().int().positive().optional().nullable(),
  date_signalement: optionalText,
  date_resolution: optionalText,
  notes: optionalText,
})

export const documentCreateSchema = z.object({
  copropriete_id: z.number().int().positive(),
  nom: z.string().min(1).max(255),
  fichier_nom: z.string().min(1).max(255),
  fichier_path: z.string().min(1).max(500),
})

export const relanceSchema = z.object({
  copropriete_id: z.number().int().positive(),
  coproprietaire_id: z.number().int().positive(),
  type: z.string().min(1).max(100),
  date_relance: z.string().min(1),
  montant_du: z.number().positive(),
})

export const assembleeSchema = z.object({
  copropriete_id: z.number().int().positive(),
  date: z.string().min(1),
  type: z.string().min(1).max(100),
  heure: optionalText,
  lieu: z.string().max(500).optional().nullable(),
  ordre_du_jour: optionalText,
  statut: z
    .enum(['planifiee', 'convoquee', 'en_cours', 'terminee', 'annulee'])
    .optional(),
  date_convocation: optionalText,
  pv_url: optionalText,
  notes: optionalText,
})

export const contratSchema = z.object({
  copropriete_id: z.number().int().positive(),
  prestataire_id: z.number().int().positive(),
  objet: z.string().min(1).max(500),
  type: z.string().max(100).optional().nullable(),
  date_debut: z.string().min(1),
  date_fin: optionalText,
  montant_annuel: z.number().nonnegative().optional().nullable(),
  frequence_paiement: z
    .enum(['mensuel', 'trimestriel', 'semestriel', 'annuel'])
    .optional(),
  preavis_mois: optionalCount,
  reconduction_tacite: z.boolean().optional(),
  conditions_resiliation: optionalText,
  statut: z.enum(['actif', 'expire', 'resilie', 'en_attente']).optional(),
  notes: optionalText,
})

export const balanceImportSchema = z.object({
  copropriete_id: z.number().int().positive(),
  lignes: z
    .array(
      z.object({
        compte: z.string().min(1).max(20),
        libelle: z.string().max(255).optional(),
        debit: z.number().nonnegative().optional(),
        credit: z.number().nonnegative().optional(),
      })
    )
    .min(1),
})

export const balanceRepriseImportSchema = balanceImportSchema.extend({
  annee: z.number().int().min(2000).max(2100),
})

export const soldesInitiauxSchema = z.object({
  copropriete_id: z.number().int().positive(),
  annee: z.number().int().min(2000).max(2100),
  soldes: z
    .array(
      z.object({
        coproprietaire_id: z.number().int().positive(),
        montant: z.number(),
      })
    )
    .min(1),
})

export const regularisationSchema = z.object({
  copropriete_id: z.number().int().positive(),
  annee: z.number().int().min(2000).max(2100),
  charges_reelles: z.number().nonnegative(),
  provisions: z.number().nonnegative(),
  statut: z.enum(['brouillon', 'validee']).optional(),
})
