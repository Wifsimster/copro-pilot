export const CATEGORIE_LABELS: Record<string, string> = {
  general: 'General',
  maintenance: 'Maintenance',
  financier: 'Financier',
  juridique: 'Juridique',
  autre: 'Autre',
}

export const CATEGORIE_COLORS: Record<string, string> = {
  general: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  financier: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  juridique: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  autre: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
}

export const STATUT_LABELS: Record<string, string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  resolu: 'Resolu',
  ferme: 'Ferme',
}

export const STATUT_COLORS: Record<string, string> = {
  ouvert: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  resolu: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ferme: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
}

export const PRIORITE_LABELS: Record<string, string> = {
  basse: 'Basse',
  normale: 'Normale',
  haute: 'Haute',
  urgente: 'Urgente',
}

export const PRIORITE_COLORS: Record<string, string> = {
  basse: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  normale: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  haute: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgente: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}
