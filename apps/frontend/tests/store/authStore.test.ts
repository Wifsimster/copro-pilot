import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock auth-client before importing the store
const mockSignInEmail = vi.fn()
const mockSignUpEmail = vi.fn()
const mockSignOut = vi.fn()
const mockGetSession = vi.fn()

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: { email: mockSignInEmail },
    signUp: { email: mockSignUpEmail },
    signOut: mockSignOut,
    getSession: mockGetSession,
    $Infer: { Session: {} },
  },
}))

vi.mock('@/utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

const { useAuthStore } = await import('@/store/authStore')

// Mock window.location
const originalLocation = window.location
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()

  // Reset store state
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
  })

  // @ts-expect-error - mock window.location.href
  delete window.location
  window.location = { ...originalLocation, href: '' }
})

describe('authStore', () => {
  // ─── Initial state ─────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts unauthenticated', () => {
      const state = useAuthStore.getState()

      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.isInitialized).toBe(false)
    })
  })

  // ─── setAuth ───────────────────────────────────────────────────────

  describe('setAuth', () => {
    it('sets user and isAuthenticated', () => {
      const user = { id: '1', email: 'test@test.com', firstname: 'Test', lastname: 'User', role: 'user' as const }

      useAuthStore.getState().setAuth(user)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(user)
      expect(state.isAuthenticated).toBe(true)
    })

    it('persists only role to sessionStorage (GDPR PII minimization)', () => {
      const user = { id: '1', email: 'test@test.com', firstname: 'Test', lastname: 'User', role: 'admin' as const }

      useAuthStore.getState().setAuth(user)

      expect(sessionStorage.getItem('user_role')).toBe('admin')
      expect(localStorage.getItem('user')).toBeNull()
      expect(localStorage.getItem('email')).toBeNull()
    })
  })

  // ─── clearAuth ─────────────────────────────────────────────────────

  describe('clearAuth', () => {
    it('clears user and isAuthenticated', () => {
      const user = { id: '1', email: 'test@test.com', firstname: 'Test', lastname: 'User', role: 'user' as const }
      useAuthStore.getState().setAuth(user)

      useAuthStore.getState().clearAuth()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('removes data from localStorage', () => {
      localStorage.setItem('user', 'data')
      localStorage.setItem('email', 'data')
      localStorage.setItem('role', 'data')

      useAuthStore.getState().clearAuth()

      expect(localStorage.getItem('user')).toBeNull()
      expect(localStorage.getItem('email')).toBeNull()
      expect(localStorage.getItem('role')).toBeNull()
    })
  })

  // ─── signIn ────────────────────────────────────────────────────────

  describe('signIn', () => {
    it('authenticates and sets user on success', async () => {
      mockSignInEmail.mockResolvedValue({
        data: {
          user: { id: 'usr-1', email: 'test@test.com', name: 'Jean Dupont', role: 'user' },
        },
      })

      await useAuthStore.getState().signIn('test@test.com', 'password')

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user?.email).toBe('test@test.com')
      expect(state.user?.firstname).toBe('Jean')
      expect(state.user?.lastname).toBe('Dupont')
      expect(state.isLoading).toBe(false)
    })

    it('does not hard-redirect on success (routing handles it)', async () => {
      mockSignInEmail.mockResolvedValue({
        data: {
          user: { id: 'usr-1', email: 'a@b.com', name: 'A B', role: 'user' },
        },
      })

      await useAuthStore.getState().signIn('a@b.com', 'pass')

      // signIn only sets auth state; PublicRoute redirects to the landing
      // page client-side. A hard window.location navigation would race that
      // redirect, so it must not happen here.
      expect(window.location.href).toBe('')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('throws on API error', async () => {
      mockSignInEmail.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      })

      await expect(
        useAuthStore.getState().signIn('test@test.com', 'wrong')
      ).rejects.toThrow('Invalid credentials')

      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
    })

    it('sets isLoading during the call', async () => {
      let loadingDuringCall = false
      mockSignInEmail.mockImplementation(async () => {
        loadingDuringCall = useAuthStore.getState().isLoading
        return { data: { user: { id: '1', name: 'A', role: 'user' } } }
      })

      await useAuthStore.getState().signIn('a@b.com', 'p')

      expect(loadingDuringCall).toBe(true)
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  // ─── signUp ────────────────────────────────────────────────────────

  describe('signUp', () => {
    it('creates account and sets emailVerificationPending on success', async () => {
      mockSignUpEmail.mockResolvedValue({
        data: {
          user: { id: 'usr-2', email: 'new@test.com', name: 'New User', role: 'user' },
        },
      })

      await useAuthStore.getState().signUp('New User', 'new@test.com', 'password')

      const state = useAuthStore.getState()
      expect(state.emailVerificationPending).toBe(true)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })

    it('throws on API error', async () => {
      mockSignUpEmail.mockResolvedValue({
        error: { message: 'Email already exists' },
      })

      await expect(
        useAuthStore.getState().signUp('Test', 'dup@test.com', 'pass')
      ).rejects.toThrow('Email already exists')

      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  // ─── logout ────────────────────────────────────────────────────────

  describe('logout', () => {
    it('clears auth state and calls signOut', async () => {
      mockSignOut.mockResolvedValue(undefined)
      useAuthStore.getState().setAuth({
        id: '1', email: 'a@b.com', firstname: 'A', lastname: 'B', role: 'user' as const,
      })

      await useAuthStore.getState().logout()

      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
      expect(mockSignOut).toHaveBeenCalled()
      expect(window.location.href).toBe('/')
    })

    it('still clears state even if backend signOut fails', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'))
      useAuthStore.getState().setAuth({
        id: '1', email: 'a@b.com', firstname: 'A', lastname: 'B', role: 'user' as const,
      })

      await useAuthStore.getState().logout()

      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(window.location.href).toBe('/')
    })
  })

  // ─── validateToken ─────────────────────────────────────────────────

  describe('validateToken', () => {
    it('returns true and sets user when session is valid', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          user: { id: 'usr-1', email: 'a@b.com', name: 'Alice Martin', role: 'admin' },
        },
      })

      const result = await useAuthStore.getState().validateToken()

      expect(result).toBe(true)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user?.firstname).toBe('Alice')
      expect(useAuthStore.getState().user?.lastname).toBe('Martin')
    })

    it('returns false and clears auth when session is invalid', async () => {
      mockGetSession.mockResolvedValue({ data: null })

      const result = await useAuthStore.getState().validateToken()

      expect(result).toBe(false)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('returns false on error and clears auth', async () => {
      mockGetSession.mockRejectedValue(new Error('Network'))

      const result = await useAuthStore.getState().validateToken()

      expect(result).toBe(false)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  // ─── initializeAuth ────────────────────────────────────────────────

  describe('initializeAuth', () => {
    it('sets isInitialized to true after initialization', async () => {
      mockGetSession.mockResolvedValue({ data: null })

      await useAuthStore.getState().initializeAuth()

      expect(useAuthStore.getState().isInitialized).toBe(true)
    })

    it('restores user from valid session', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          user: { id: 'usr-1', email: 'a@b.com', name: 'Test User', role: 'user' },
        },
      })

      await useAuthStore.getState().initializeAuth()

      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user?.email).toBe('a@b.com')
    })

    it('clears auth when session is invalid', async () => {
      mockGetSession.mockResolvedValue({ data: null })

      await useAuthStore.getState().initializeAuth()

      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('only runs once (idempotent)', async () => {
      mockGetSession.mockResolvedValue({ data: null })

      await useAuthStore.getState().initializeAuth()
      await useAuthStore.getState().initializeAuth()

      expect(mockGetSession).toHaveBeenCalledTimes(1)
    })
  })

  // ─── User name parsing ─────────────────────────────────────────────

  describe('user name parsing (via signIn)', () => {
    it('parses "Jean Dupont" into firstname=Jean, lastname=Dupont', async () => {
      mockSignInEmail.mockResolvedValue({
        data: { user: { id: '1', name: 'Jean Dupont', role: 'user' } },
      })

      await useAuthStore.getState().signIn('a@b.com', 'p')

      expect(useAuthStore.getState().user?.firstname).toBe('Jean')
      expect(useAuthStore.getState().user?.lastname).toBe('Dupont')
    })

    it('handles single-word name', async () => {
      mockSignInEmail.mockResolvedValue({
        data: { user: { id: '1', name: 'Admin', role: 'admin' } },
      })

      await useAuthStore.getState().signIn('a@b.com', 'p')

      expect(useAuthStore.getState().user?.firstname).toBe('Admin')
      expect(useAuthStore.getState().user?.lastname).toBe('')
    })

    it('handles three-part name', async () => {
      mockSignInEmail.mockResolvedValue({
        data: { user: { id: '1', name: 'Jean Pierre Dupont', role: 'user' } },
      })

      await useAuthStore.getState().signIn('a@b.com', 'p')

      expect(useAuthStore.getState().user?.firstname).toBe('Jean')
      expect(useAuthStore.getState().user?.lastname).toBe('Pierre Dupont')
    })

    it('handles empty name', async () => {
      mockSignInEmail.mockResolvedValue({
        data: { user: { id: '1', name: '', role: 'user' } },
      })

      await useAuthStore.getState().signIn('a@b.com', 'p')

      expect(useAuthStore.getState().user?.firstname).toBe('')
      expect(useAuthStore.getState().user?.lastname).toBe('')
    })

    it('handles null name', async () => {
      mockSignInEmail.mockResolvedValue({
        data: { user: { id: '1', name: null, role: 'user' } },
      })

      await useAuthStore.getState().signIn('a@b.com', 'p')

      expect(useAuthStore.getState().user?.firstname).toBe('')
      expect(useAuthStore.getState().user?.lastname).toBe('')
    })

    it('uses pre-split firstname/lastname if available', async () => {
      mockSignInEmail.mockResolvedValue({
        data: {
          user: { id: '1', firstname: 'Marie', lastname: 'Curie', name: 'Ignored', role: 'user' },
        },
      })

      await useAuthStore.getState().signIn('a@b.com', 'p')

      expect(useAuthStore.getState().user?.firstname).toBe('Marie')
      expect(useAuthStore.getState().user?.lastname).toBe('Curie')
    })
  })
})

// ─── Selectors ─────────────────────────────────────────────────────────

describe('selectors', () => {
  it('selectIsAdmin returns true for admin role', async () => {
    const { selectIsAdmin } = await import('@/store/authStore')
    const state = {
      user: { id: '1', email: 'a@b.com', firstname: 'A', lastname: 'B', role: 'admin' as const },
      isAuthenticated: true,
    }
    expect(selectIsAdmin(state as any)).toBe(true)
  })

  it('selectIsAdmin returns false for user role', async () => {
    const { selectIsAdmin } = await import('@/store/authStore')
    const state = {
      user: { id: '1', email: 'a@b.com', firstname: 'A', lastname: 'B', role: 'user' as const },
      isAuthenticated: true,
    }
    expect(selectIsAdmin(state as any)).toBe(false)
  })

  it('selectCanAccessRoute blocks unauthenticated users', async () => {
    const { selectCanAccessRoute } = await import('@/store/authStore')
    const state = { isAuthenticated: false, user: null }
    const canAccess = selectCanAccessRoute(state as any)
    expect(canAccess('/coproprietes')).toBe(false)
  })

  it('selectCanAccessRoute allows authenticated non-admin on normal routes', async () => {
    const { selectCanAccessRoute } = await import('@/store/authStore')
    const state = {
      isAuthenticated: true,
      user: { id: '1', email: 'a@b.com', firstname: 'A', lastname: 'B', role: 'user' as const },
    }
    const canAccess = selectCanAccessRoute(state as any)
    expect(canAccess('/coproprietes')).toBe(true)
  })
})
