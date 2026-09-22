import { describe, it, expect } from 'vitest'
import { toLocalIsoDate } from '@/utils/date'

describe('toLocalIsoDate', () => {
  it('uses the local calendar day', () => {
    expect(toLocalIsoDate(new Date(2026, 0, 5, 0, 30))).toBe('2026-01-05')
  })
})
