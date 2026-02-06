import { randomBytes, scryptSync } from 'node:crypto'
import { randomUUID } from 'node:crypto'

/**
 * Hash a password using the same algorithm as Better Auth
 * (scrypt with N=16384, r=16, p=1, dkLen=64)
 */
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const key = scryptSync(password.normalize('NFKC'), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2
  })
  return `${salt}:${key.toString('hex')}`
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const email = 'admin@immo-ia.local'

  const existing = await knex('user').where({ email }).first()
  if (existing) {
    return
  }

  const userId = randomUUID()
  const accountId = randomUUID()
  const now = new Date()

  await knex('user').insert({
    id: userId,
    name: 'Administrateur',
    email,
    emailVerified: true,
    role: 'admin',
    isAdmin: true,
    displayName: 'Administrateur',
    createdAt: now,
    updatedAt: now
  })

  await knex('account').insert({
    id: accountId,
    accountId: userId,
    providerId: 'credential',
    userId,
    password: hashPassword('admin'),
    createdAt: now,
    updatedAt: now
  })
}
