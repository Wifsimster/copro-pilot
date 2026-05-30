import { z } from 'zod'

export const ticketSchema = z.object({
  sujet: z.string().min(1, 'Le sujet est obligatoire'),
  categorie: z.enum(['general', 'maintenance', 'financier', 'juridique', 'autre']),
  priorite: z.enum(['basse', 'normale', 'haute', 'urgente']),
})

export type TicketFormData = z.infer<typeof ticketSchema>

export const updateTicketSchema = z.object({
  sujet: z.string().min(1, 'Le sujet est obligatoire'),
  categorie: z.enum(['general', 'maintenance', 'financier', 'juridique', 'autre']),
  statut: z.enum(['ouvert', 'en_cours', 'resolu', 'ferme']),
  priorite: z.enum(['basse', 'normale', 'haute', 'urgente']),
})

export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>
