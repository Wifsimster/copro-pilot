import type { UserRole } from '@/types'

const ADMIN_ROLES: UserRole[] = ['admin']
const ADMIN_ONLY_ROUTES = ['/users']
const COPROPRIETAIRE_ROUTES = ['/extranet']

export function isAdmin(role?: string): boolean {
  if (!role) return false
  return ADMIN_ROLES.includes(role.toLowerCase() as UserRole)
}

export function isCoproprietaire(role?: string): boolean {
  if (!role) return false
  return role.toLowerCase() === 'coproprietaire'
}

export function isAdminOnlyRoute(routeName: string): boolean {
  return ADMIN_ONLY_ROUTES.includes(routeName)
}

export function isCoproprietaireRoute(route: string): boolean {
  return COPROPRIETAIRE_ROUTES.includes(route)
}

export function isSyndic(role?: string): boolean {
  if (!role) return false
  return role.toLowerCase() === 'syndic'
}

export function canAccessRoute(role?: string, route?: string): boolean {
  if (!role || !route) return false
  if (isAdmin(role)) return true
  if (isCoproprietaire(role)) {
    return route.startsWith('/extranet') || ['/notifications', '/profil'].includes(route)
  }
  if (isSyndic(role) && route === '/gestion-utilisateurs') return true
  return !COPROPRIETAIRE_ROUTES.includes(route)
}
