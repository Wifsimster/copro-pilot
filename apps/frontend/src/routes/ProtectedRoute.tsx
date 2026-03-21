import { ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { isCoproprietaire } from '@/utils/roleAccess'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: ReactNode
  requiresAdmin?: boolean
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({
  children,
  requiresAdmin = false,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, isLoading, user, validateToken, isInitialized } = useAuthStore()
  const [isValidating, setIsValidating] = useState(!isInitialized)

  useEffect(() => {
    if (!isInitialized) {
      setIsValidating(true)
      validateToken().finally(() => setIsValidating(false))
    }
  }, [isInitialized, validateToken])

  if (isLoading || isValidating) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50 dark:bg-stone-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
          <p className="text-stone-600 dark:text-stone-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (requiresAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  if (allowedRoles && user?.role) {
    if (!allowedRoles.includes(user.role) && user.role !== 'admin') {
      const redirectTo = isCoproprietaire(user.role) ? '/extranet' : '/dashboard'
      return <Navigate to={redirectTo} replace />
    }
  }

  return <>{children}</>
}

export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
