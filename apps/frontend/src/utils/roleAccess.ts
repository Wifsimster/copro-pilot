import type { UserRole } from '@/types'

const ADMIN_ROLES: UserRole[] = ['admin']
const ADMIN_ONLY_ROUTES = ['/users']

export function isAdmin(role?: string): boolean {
  if (!role) return false
  return ADMIN_ROLES.includes(role.toLowerCase() as UserRole)
}

export function isAdminOnlyRoute(routeName: string): boolean {
  return ADMIN_ONLY_ROUTES.includes(routeName)
}
