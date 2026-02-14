import { describe, it, expect } from 'vitest'
import { isAdmin, isAdminOnlyRoute } from '@/utils/roleAccess'

describe('isAdmin', () => {
  it('returns true for admin role', () => {
    expect(isAdmin('admin')).toBe(true)
  })

  it('returns true for Admin (case-insensitive)', () => {
    expect(isAdmin('Admin')).toBe(true)
  })

  it('returns true for ADMIN (uppercase)', () => {
    expect(isAdmin('ADMIN')).toBe(true)
  })

  it('returns false for user role', () => {
    expect(isAdmin('user')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isAdmin('')).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isAdmin(undefined)).toBe(false)
  })

  it('returns false for unknown role', () => {
    expect(isAdmin('moderator')).toBe(false)
  })
})

describe('isAdminOnlyRoute', () => {
  it('returns true for /users route', () => {
    expect(isAdminOnlyRoute('/users')).toBe(true)
  })

  it('returns false for /coproprietes route', () => {
    expect(isAdminOnlyRoute('/coproprietes')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isAdminOnlyRoute('')).toBe(false)
  })

  it('returns false for /dashboard route', () => {
    expect(isAdminOnlyRoute('/dashboard')).toBe(false)
  })
})
