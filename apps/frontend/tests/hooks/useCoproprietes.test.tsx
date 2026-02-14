import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock the coproprietes API module (used by the hooks)
const mockGetAll = vi.fn()
const mockGetById = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDeleteCopro = vi.fn()

vi.mock('@/api/coproprietes', () => ({
  coproprietesApi: {
    getAll: (...args: unknown[]) => mockGetAll(...args),
    getById: (...args: unknown[]) => mockGetById(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDeleteCopro(...args),
  },
}))

// Mock auth-client to prevent import errors
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn().mockResolvedValue({ data: null }),
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
    signOut: vi.fn(),
    $Infer: { Session: {} },
  },
}))

const { useCoproprietes, useCopropriete, useCreateCopropriete, useUpdateCopropriete, useDeleteCopropriete } = await import('@/hooks/useCoproprietes')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCoproprietes', () => {
  it('fetches all coproprietes', async () => {
    const data = [{ id: 1, nom: 'Résidence A' }, { id: 2, nom: 'Résidence B' }]
    mockGetAll.mockResolvedValue({ data })

    const { result } = renderHook(() => useCoproprietes(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(data)
  })

  it('handles API error', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useCoproprietes(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Network error')
  })
})

describe('useCopropriete', () => {
  it('fetches a single copropriete by id', async () => {
    const data = { id: 1, nom: 'Résidence A' }
    mockGetById.mockResolvedValue({ data })

    const { result } = renderHook(() => useCopropriete(1), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(data)
    expect(mockGetById).toHaveBeenCalledWith(1)
  })

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useCopropriete(undefined as any), { wrapper: createWrapper() })

    expect(result.current.isFetching).toBe(false)
    expect(mockGetById).not.toHaveBeenCalled()
  })
})

describe('useCreateCopropriete', () => {
  it('calls coproprietesApi.create on mutation', async () => {
    mockCreate.mockResolvedValue({ data: { id: 3, nom: 'New' } })

    const { result } = renderHook(() => useCreateCopropriete(), { wrapper: createWrapper() })

    result.current.mutate({ nom: 'New', adresse: '1 Rue' } as any)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockCreate).toHaveBeenCalledWith({ nom: 'New', adresse: '1 Rue' })
  })
})

describe('useUpdateCopropriete', () => {
  it('calls coproprietesApi.update on mutation', async () => {
    mockUpdate.mockResolvedValue({ data: { id: 1, nom: 'Updated' } })

    const { result } = renderHook(() => useUpdateCopropriete(), { wrapper: createWrapper() })

    result.current.mutate({ id: 1, data: { nom: 'Updated' } as any })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockUpdate).toHaveBeenCalledWith(1, { nom: 'Updated' })
  })
})

describe('useDeleteCopropriete', () => {
  it('calls coproprietesApi.delete on mutation', async () => {
    mockDeleteCopro.mockResolvedValue({ message: 'ok' })

    const { result } = renderHook(() => useDeleteCopropriete(), { wrapper: createWrapper() })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockDeleteCopro).toHaveBeenCalledWith(1)
  })
})
