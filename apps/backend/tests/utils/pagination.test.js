import { describe, it, expect } from 'vitest'
import { parsePaginationParams } from '../../src/utils/pagination.js'

describe('parsePaginationParams', () => {
  it('defaults sortBy to created_at', () => {
    expect(parsePaginationParams({}).sortBy).toBe('created_at')
  })

  it('keeps a bare column name', () => {
    expect(parsePaginationParams({ sortBy: 'date_paiement' }).sortBy).toBe(
      'date_paiement'
    )
  })

  it('rejects qualified or malformed column names', () => {
    for (const sortBy of ['user.email', 'id; drop', 'Nom', ['a']]) {
      expect(parsePaginationParams({ sortBy }).sortBy).toBe('created_at')
    }
  })
})
