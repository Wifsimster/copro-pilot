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

export function canAccessRoute(role?: string, route?: string): boolean {
  if (!role || !route) return false
  if (isAdmin(role)) return true
  if (isCoproprietaire(role)) {
    return ['/extranet', '/notifications', '/profil'].includes(route)
  }
  return !COPROPRIETAIRE_ROUTES.includes(route)
}
