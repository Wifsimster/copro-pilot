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
  const email = 'syndic@copropilot.local'

  const existing = await knex('user').where({ email }).first()
  if (existing) return

  const userId = randomUUID()
  const accountId = randomUUID()
  const now = new Date()

  await knex('user').insert({
    id: userId,
    name: 'Marie Duval',
    email,
    emailVerified: true,
    role: 'syndic',
    isAdmin: false,
    displayName: 'Marie Duval',
    // Demo account showcases every feature → full Entreprise plan.
    plan: 'entreprise',
    createdAt: now,
    updatedAt: now,
  })

  // Matching active subscription so the frontend (which reads the plan from
  // /stripe/subscription, not user.plan) unlocks plan-gated features too.
  await knex('subscriptions').insert({
    id: randomUUID(),
    user_id: userId,
    plan: 'entreprise',
    status: 'active',
    copropriete_limit: 50,
    user_limit: 25,
  })

  await knex('account').insert({
    id: accountId,
    accountId: userId,
    providerId: 'credential',
    userId,
    password: hashPassword('syndic'),
    createdAt: now,
    updatedAt: now,
  })
}
