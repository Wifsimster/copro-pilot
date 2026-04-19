export const URGENCE_INCIDENT: readonly ['faible', 'moyenne', 'haute', 'critique']

export const STATUT_INCIDENT: readonly ['ouvert', 'en_cours', 'resolu', 'ferme']

export type UrgenceIncident = (typeof URGENCE_INCIDENT)[number]

export type StatutIncident = (typeof STATUT_INCIDENT)[number]
