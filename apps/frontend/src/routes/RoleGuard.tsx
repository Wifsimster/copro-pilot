import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { isCoproprietaire, isAdmin } from '@/utils/roleAccess'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const user = useAuthStore(state => state.user)
  const role = user?.role

  if (!role) return <Navigate to="/" replace />
  if (isAdmin(role)) return <>{children}</>
  if (allowedRoles.includes(role)) return <>{children}</>

  const redirectTo = isCoproprietaire(role) ? '/extranet' : '/'
  return <Navigate to={redirectTo} replace />
}
