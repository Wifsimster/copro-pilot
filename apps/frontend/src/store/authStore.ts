import { create } from 'zustand'
import { authClient } from '@/lib/auth-client'
import { isAdmin as checkIsAdmin, canAccessRoute as checkCanAccessRoute } from '@/utils/roleAccess'
import logger from '@/utils/logger'
import type { User, UserRole } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  emailVerificationPending: boolean
}

interface AuthActions {
  setAuth: (user: User) => void
  clearAuth: () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  validateToken: () => Promise<boolean>
  initializeAuth: () => Promise<void>
}

type AuthStore = AuthState & AuthActions

function parseUserName(name: string | undefined | null): { firstname: string; lastname: string } {
  if (!name || typeof name !== 'string') {
    return { firstname: '', lastname: '' }
  }

  const parts = name.trim().split(/\s+/).filter(part => part.length > 0)
  if (parts.length === 0) {
    return { firstname: '', lastname: '' }
  }

  return {
    firstname: parts[0] || '',
    lastname: parts.slice(1).join(' ') || ''
  }
}

function saveUserToStorage(userData: User): void {
  sessionStorage.setItem('user_role', userData.role)
}

function clearUserFromStorage(): void {
  const keys = ['user', 'email', 'firstname', 'lastname', 'role', 'user_role']
  keys.forEach(key => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
}

interface SessionUser {
  id: string
  email?: string
  name?: string
  firstname?: string
  lastname?: string
  role?: string
}

function transformUser(sessionUser: SessionUser): User {
  const nameParts = sessionUser.firstname && sessionUser.lastname
    ? { firstname: sessionUser.firstname, lastname: sessionUser.lastname }
    : parseUserName(sessionUser.name)

  return {
    id: sessionUser.id,
    email: sessionUser.email || '',
    firstname: nameParts.firstname,
    lastname: nameParts.lastname,
    role: (sessionUser.role || 'user') as UserRole
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  emailVerificationPending: false,

  setAuth: (user: User) => {
    set({ user, isAuthenticated: true })
    saveUserToStorage(user)
  },

  clearAuth: () => {
    set({ user: null, isAuthenticated: false })
    clearUserFromStorage()
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true })
      const result = await authClient.signIn.email({ email, password })
      if (result.error) {
        throw new Error(result.error.message || 'Erreur de connexion')
      }
      if (result.data?.user) {
        const userData = transformUser(result.data.user as SessionUser)
        get().setAuth(userData)

        // Check for pending plan from landing page signup flow
        const pendingPlan = sessionStorage.getItem('pending_plan')
        if (pendingPlan && ['essentiel', 'pro', 'entreprise'].includes(pendingPlan)) {
          sessionStorage.removeItem('pending_plan')
          try {
            const checkoutRes = await fetch('/api/stripe/checkout-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ plan: pendingPlan }),
            })
            const checkoutData = await checkoutRes.json()
            if (checkoutData.data?.url) {
              window.location.href = checkoutData.data.url
              return
            }
          } catch (err) {
            logger.error('Stripe checkout redirect failed:', err)
            // Fall through to the app if Stripe fails
          }
        }

        // No explicit redirect here: setAuth flips isAuthenticated, and the
        // PublicRoute wrapping /login redirects to the correct landing page
        // (/dashboard or /extranet) client-side. A hard window.location
        // navigation would race that redirect and interrupt any navigation
        // issued right after login.
      }
    } catch (error) {
      logger.error('Sign in failed:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  signUp: async (name: string, email: string, password: string) => {
    try {
      set({ isLoading: true })
      const result = await authClient.signUp.email({ name, email, password })
      if (result.error) {
        throw new Error(result.error.message || "Erreur lors de l'inscription")
      }
      if (result.data?.user) {
        // Record GDPR consents (non-blocking but logged)
        const consentTypes = [
          'terms_of_service',
          'privacy_policy',
          'data_processing',
        ]
        Promise.all(
          consentTypes.map(type =>
            fetch('/api/gdpr/consents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                consent_type: type,
                granted: true,
                version: '1.0',
              }),
            })
          )
        ).catch(err => {
          logger.error('Failed to record GDPR consents:', err)
        })

        // Email verification is required — don't redirect, show pending message
        set({ emailVerificationPending: true })
      }
    } catch (error) {
      logger.error('Sign up failed:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true })
      await authClient.signOut()
    } catch (error) {
      logger.error('Backend logout failed:', error)
    } finally {
      get().clearAuth()
      set({ isLoading: false })
    }
    window.location.href = '/'
  },

  validateToken: async () => {
    try {
      set({ isLoading: true })
      const session = await authClient.getSession()

      if (session?.data?.user) {
        const userData = transformUser(session.data.user as SessionUser)
        get().setAuth(userData)
        return true
      } else {
        get().clearAuth()
        return false
      }
    } catch (error) {
      logger.error('Token validation failed:', error)
      get().clearAuth()
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  initializeAuth: async () => {
    if (get().isInitialized) return

    try {
      set({ isLoading: true })
      const session = await authClient.getSession()

      if (session?.data?.user) {
        const userData = transformUser(session.data.user as SessionUser)
        set({ user: userData, isAuthenticated: true })
        saveUserToStorage(userData)
      } else {
        get().clearAuth()
      }
    } catch (error) {
      logger.error('Error initializing auth:', error)
      get().clearAuth()
    } finally {
      set({ isLoading: false, isInitialized: true })
    }
  }
}))

export const selectUser = (state: AuthStore) => state.user
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated
export const selectIsLoading = (state: AuthStore) => state.isLoading
export const selectIsAdmin = (state: AuthStore) => checkIsAdmin(state.user?.role)
export const selectCanAccessRoute = (state: AuthStore) => (routeName: string) => {
  if (!state.isAuthenticated) return false
  return checkCanAccessRoute(state.user?.role, routeName)
}
