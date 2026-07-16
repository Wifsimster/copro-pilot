import { z } from 'zod'
import {
  URGENCE_INCIDENT,
  STATUT_INCIDENT,
} from '@copro-pilot/shared-enums'

export const coproprieteSchema = z.object({
  nom: z.string().min(1).max(255),
  adresse: z.string().min(1).max(500),
  code_postal: z.string().regex(/^\d{5}$/),
  ville: z.string().min(1).max(255),
  nombre_lots: z.number().int().positive().optional(),
  numero_immatriculation: z.string().max(50).optional(),
  date_creation_syndicat: z.string().optional(),
  siret: z.string().max(14).optional(),
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
  etage: z.number().int().optional().nullable(),
  superficie: z.number().positive().optional().nullable(),
  tantiemes: z.number().int().positive(),
})

export const paiementSchema = z.object({
  coproprietaire_id: z.number().int().positive(),
  montant: z.number().positive(),
  date_paiement: z.string().min(1),
  mode: z.string().min(1).max(50),
  reference: z.string().max(255).optional().nullable(),
})

export const budgetSchema = z.object({
  copropriete_id: z.number().int().positive(),
  annee: z.number().int().min(1900).max(2100),
  montant_total: z.number().positive(),
})

export const incidentSchema = z.object({
  copropriete_id: z.number().int().positive(),
  titre: z.string().min(1).max(255),
  description: z.string().min(1).optional(),
  urgence: z.enum(URGENCE_INCIDENT),
  statut: z.enum(STATUT_INCIDENT).optional(),
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
  lieu: z.string().min(1).max(500),
})

export const contratSchema = z.object({
  copropriete_id: z.number().int().positive(),
  prestataire_id: z.number().int().positive(),
  objet: z.string().min(1).max(500),
  date_debut: z.string().min(1),
  montant_annuel: z.number().positive(),
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

export const regularisationSchema = z.object({
  copropriete_id: z.number().int().positive(),
  annee: z.number().int().min(2000).max(2100),
  charges_reelles: z.number().nonnegative(),
  provisions: z.number().nonnegative(),
  statut: z.enum(['brouillon', 'validee']).optional(),
})
