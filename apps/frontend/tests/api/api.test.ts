import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Must mock import.meta.env before importing api
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

const { api } = await import('@/api/api')

beforeEach(() => {
  vi.clearAllMocks()
})

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  })
}

function errorResponse(status: number, body: unknown = {}) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve(body),
  })
}

// ─── api.get ───────────────────────────────────────────────────────────

describe('api.get', () => {
  it('makes a GET request to the correct URL', async () => {
    mockFetch.mockReturnValue(jsonResponse([{ id: 1 }]))

    await api.get('/coproprietes')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/coproprietes'),
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('returns parsed JSON response', async () => {
    const data = [{ id: 1, nom: 'Test' }]
    mockFetch.mockReturnValue(jsonResponse(data))

    const result = await api.get('/coproprietes')

    expect(result).toEqual(data)
  })

  it('appends query parameters to the URL', async () => {
    mockFetch.mockReturnValue(jsonResponse([]))

    await api.get('/coproprietes', { page: 1, search: 'test' })

    const calledUrl = mockFetch.mock.calls[0][0]
    expect(calledUrl).toContain('page=1')
    expect(calledUrl).toContain('search=test')
  })

  it('excludes undefined params', async () => {
    mockFetch.mockReturnValue(jsonResponse([]))

    await api.get('/coproprietes', { page: 1, search: undefined })

    const calledUrl = mockFetch.mock.calls[0][0]
    expect(calledUrl).toContain('page=1')
    expect(calledUrl).not.toContain('search')
  })

  it('includes credentials: include', async () => {
    mockFetch.mockReturnValue(jsonResponse([]))

    await api.get('/coproprietes')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: 'include' })
    )
  })

  it('includes Content-Type: application/json header', async () => {
    mockFetch.mockReturnValue(jsonResponse([]))

    await api.get('/coproprietes')

    const options = mockFetch.mock.calls[0][1]
    expect(options.headers['Content-Type']).toBe('application/json')
  })
})

// ─── api.post ──────────────────────────────────────────────────────────

describe('api.post', () => {
  it('makes a POST request with JSON body', async () => {
    mockFetch.mockReturnValue(jsonResponse({ id: 1 }))
    const payload = { nom: 'Test', adresse: '123 Rue' }

    await api.post('/coproprietes', payload)

    const [url, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify(payload))
  })

  it('sends POST without body when data is undefined', async () => {
    mockFetch.mockReturnValue(jsonResponse({}))

    await api.post('/endpoint')

    const options = mockFetch.mock.calls[0][1]
    expect(options.method).toBe('POST')
    expect(options.body).toBeUndefined()
  })
})

// ─── api.put ───────────────────────────────────────────────────────────

describe('api.put', () => {
  it('makes a PUT request with JSON body', async () => {
    mockFetch.mockReturnValue(jsonResponse({ id: 1 }))

    await api.put('/coproprietes/1', { nom: 'Updated' })

    const options = mockFetch.mock.calls[0][1]
    expect(options.method).toBe('PUT')
    expect(options.body).toBe(JSON.stringify({ nom: 'Updated' }))
  })
})

// ─── api.patch ─────────────────────────────────────────────────────────

describe('api.patch', () => {
  it('makes a PATCH request', async () => {
    mockFetch.mockReturnValue(jsonResponse({ id: 1 }))

    await api.patch('/coproprietes/1', { nom: 'Patched' })

    const options = mockFetch.mock.calls[0][1]
    expect(options.method).toBe('PATCH')
  })
})

// ─── api.delete ────────────────────────────────────────────────────────

describe('api.delete', () => {
  it('makes a DELETE request', async () => {
    mockFetch.mockReturnValue(jsonResponse({}))

    await api.delete('/coproprietes/1')

    const options = mockFetch.mock.calls[0][1]
    expect(options.method).toBe('DELETE')
  })
})

// ─── Error handling ────────────────────────────────────────────────────

describe('error handling', () => {
  it('throws an error for 4xx responses', async () => {
    mockFetch.mockReturnValue(errorResponse(404, { error: 'Not found' }))

    await expect(api.get('/nonexistent')).rejects.toThrow()
  })

  it('includes HTTP status on the error object', async () => {
    mockFetch.mockReturnValue(errorResponse(403, { error: 'Forbidden' }))

    try {
      await api.get('/admin')
      expect.fail('Should have thrown')
    } catch (e: any) {
      expect(e.status).toBe(403)
    }
  })

  it('uses error.message from response body', async () => {
    mockFetch.mockReturnValue(errorResponse(400, { message: 'Validation failed' }))

    await expect(api.get('/bad')).rejects.toThrow('Validation failed')
  })

  it('uses error.error from response body as fallback', async () => {
    mockFetch.mockReturnValue(errorResponse(400, { error: 'Bad request' }))

    await expect(api.get('/bad')).rejects.toThrow('Bad request')
  })

  it('falls back to HTTP status text when body has no message', async () => {
    mockFetch.mockReturnValue(errorResponse(500, {}))

    await expect(api.get('/fail')).rejects.toThrow('HTTP 500')
  })

  it('handles non-JSON error responses gracefully', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 502,
        json: () => Promise.reject(new Error('Not JSON')),
      })
    )

    await expect(api.get('/bad-gateway')).rejects.toThrow('HTTP 502')
  })
})
