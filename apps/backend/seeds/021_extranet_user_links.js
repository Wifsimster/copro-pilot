import { randomBytes, scryptSync, randomUUID } from 'node:crypto'

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
    maxmem: 128 * 16384 * 16 * 2,
  })
  return `${salt}:${key.toString('hex')}`
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const email = 'copro@copropilot.local'

  // Check if copro user already exists
  const existing = await knex('user').where({ email }).first()
  if (existing) return

  // Get first coproprietaire that isn't already linked
  const copro = await knex('coproprietaires').whereNull('user_id').first()
  if (!copro) return

  const userId = randomUUID()
  const accountId = randomUUID()
  const now = new Date()

  // Create user with coproprietaire role
  await knex('user').insert({
    id: userId,
    name: `${copro.prenom} ${copro.nom}`,
    email,
    emailVerified: true,
    role: 'coproprietaire',
    isAdmin: false,
    displayName: `${copro.prenom} ${copro.nom}`,
    createdAt: now,
    updatedAt: now,
  })

  // Create account with password
  await knex('account').insert({
    id: accountId,
    accountId: userId,
    providerId: 'credential',
    userId,
    password: hashPassword('copro'),
    createdAt: now,
    updatedAt: now,
  })

  // Link the coproprietaire record to this user
  await knex('coproprietaires')
    .where('id', copro.id)
    .update({ user_id: userId })
}
