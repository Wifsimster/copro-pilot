import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock auth-client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn().mockResolvedValue({ data: null }),
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
    signOut: vi.fn(),
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
const LoginPage = (await import('@/pages/LoginPage')).default

function renderLoginPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  const router = createMemoryRouter(
    [{ path: '/login', element: <LoginPage /> }],
    { initialEntries: ['/login'] }
  )

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()

  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
  })
})

describe('LoginPage', () => {
  it('renders a login form with email and password inputs', async () => {
    renderLoginPage()

    await waitFor(() => {
      const inputs = document.querySelectorAll('input')
      expect(inputs.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('renders a submit button', async () => {
    renderLoginPage()

    await waitFor(() => {
      const buttons = screen.queryAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('renders the application name', async () => {
    renderLoginPage()

    await waitFor(() => {
      const text = document.body.textContent
      expect(text).toContain('CoproPilot')
    })
  })
})
