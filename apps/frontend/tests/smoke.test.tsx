import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// ─── Mock external auth dependency ────────────────────────────────────

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn().mockResolvedValue({ data: null }),
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
    signOut: vi.fn(),
    $Infer: { Session: {} }
  }
}))

// ─── Helpers ──────────────────────────────────────────────────────────

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false }
    }
  })
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

// ─── Smoke tests ──────────────────────────────────────────────────────

describe('Frontend smoke tests', () => {
  beforeEach(() => {
    // Reset DOM and storage between tests
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Core modules import without errors', () => {
    it('imports the API module', async () => {
      const mod = await import('@/api/api')
      expect(mod.api).toBeDefined()
      expect(mod.api.get).toBeTypeOf('function')
      expect(mod.api.post).toBeTypeOf('function')
      expect(mod.api.put).toBeTypeOf('function')
      expect(mod.api.delete).toBeTypeOf('function')
    })

    it('imports the auth store', async () => {
      const mod = await import('@/store/authStore')
      expect(mod.useAuthStore).toBeTypeOf('function')
    })

    it('imports the router configuration', async () => {
      const mod = await import('@/routes/index')
      expect(mod.router).toBeDefined()
    })
  })

  describe('Login page renders', () => {
    it('renders the login page at /login', async () => {
      const LoginPage = (await import('@/pages/LoginPage')).default

      const router = createMemoryRouter(
        [{ path: '/login', element: <LoginPage /> }],
        { initialEntries: ['/login'] }
      )

      renderWithProviders(<RouterProvider router={router} />)

      // The login page should render some kind of form or auth UI
      // Wait briefly for lazy/async rendering
      await vi.waitFor(() => {
        const form = document.querySelector('form')
          || screen.queryByRole('button')
          || document.querySelector('input')
        expect(form).not.toBeNull()
      }, { timeout: 3000 })
    })
  })

  describe('Auth store initial state', () => {
    it('starts unauthenticated', async () => {
      // Clear any previous state
      localStorage.removeItem('user')

      const { useAuthStore } = await import('@/store/authStore')
      const state = useAuthStore.getState()

      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
    })
  })

  describe('QueryClient configuration', () => {
    it('creates a QueryClient without errors', () => {
      const qc = createTestQueryClient()
      expect(qc).toBeDefined()
      expect(qc.getDefaultOptions().queries?.retry).toBe(false)
    })
  })
})
