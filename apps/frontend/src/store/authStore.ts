import { create } from 'zustand'
import { authClient } from '@/lib/auth-client'
import { isAdmin as checkIsAdmin, isAdminOnlyRoute } from '@/utils/roleAccess'
import logger from '@/utils/logger'
import type { User, UserRole } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
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
  localStorage.setItem('user', JSON.stringify(userData))
  localStorage.setItem('email', userData.email)
  localStorage.setItem('role', userData.role)
}

function clearUserFromStorage(): void {
  const keys = ['user', 'email', 'firstname', 'lastname', 'role']
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
        window.location.href = '/#/'
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
        const userData = transformUser(result.data.user as SessionUser)
        get().setAuth(userData)
        window.location.href = '/#/'
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
      get().clearAuth()
      await authClient.signOut()
    } catch (error) {
      logger.error('Backend logout failed:', error)
    } finally {
      set({ isLoading: false })
    }
    window.location.href = '/#/login'
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
  if (isAdminOnlyRoute(routeName)) return checkIsAdmin(state.user?.role)
  return true
}
