import { vi } from 'vitest'

/**
 * Creates a chainable mock of the Knex query builder.
 *
 * @param {*} resolvedValue – The value that terminal methods (.first(),
 *   .returning(), .then()) will resolve to. Arrays are returned as-is;
 *   scalars are wrapped in an array for .returning().
 * @returns {{ chain: object, knex: Function }} The raw chain and a
 *   callable knex mock (knex('table')).
 */
export function createKnexMock(resolvedValue = []) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    whereNotNull: vi.fn().mockReturnThis(),
    whereNull: vi.fn().mockReturnThis(),
    join: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    del: vi.fn().mockResolvedValue(1),
    returning: vi.fn().mockResolvedValue(
      Array.isArray(resolvedValue) ? resolvedValue : [resolvedValue]
    ),
    first: vi.fn().mockResolvedValue(
      Array.isArray(resolvedValue) ? resolvedValue[0] : resolvedValue
    ),
    orderBy: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    count: vi.fn().mockReturnThis(),
    countDistinct: vi.fn().mockReturnThis(),
    sum: vi.fn().mockReturnThis(),
    // Make the chain thenable so `await knex('table')` works
    then(resolve) {
      return Promise.resolve(
        resolve(Array.isArray(resolvedValue) ? resolvedValue : [resolvedValue])
      )
    },
  }

  const knex = vi.fn(() => chain)

  // knex.fn.now() helper used by models for updated_at
  knex.fn = { now: vi.fn().mockReturnValue('NOW()') }

  // knex.raw() for raw SQL queries
  knex.raw = vi.fn().mockResolvedValue({ rows: [] })

  /**
   * knex.transaction(async trx => { ... })
   * Calls the callback with the same chainable mock so inner queries
   * can be asserted. The trx callable also supports trx('table').
   */
  knex.transaction = vi.fn(async callback => {
    const trxChain = { ...chain }
    // Reset thenable so each trx('table') call can be independently resolved
    const trx = vi.fn(() => trxChain)
    trx.fn = knex.fn
    trx.raw = knex.raw
    return callback(trx)
  })

  return { chain, knex }
}

/**
 * Convenience: creates a knex mock pre-configured to return different
 * values for successive calls.
 *
 * @param {Array<*>} values – Each entry is the resolvedValue for the
 *   Nth call to knex('table').
 */
export function createSequentialKnexMock(values) {
  let callIndex = 0
  const chains = values.map(val => {
    const isArray = Array.isArray(val)
    return {
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      whereNotNull: vi.fn().mockReturnThis(),
      whereNull: vi.fn().mockReturnThis(),
      join: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      del: vi.fn().mockResolvedValue(1),
      returning: vi.fn().mockResolvedValue(isArray ? val : [val]),
      first: vi.fn().mockResolvedValue(isArray ? val[0] : val),
      orderBy: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      count: vi.fn().mockReturnThis(),
      countDistinct: vi.fn().mockReturnThis(),
      sum: vi.fn().mockReturnThis(),
      then(resolve) {
        return Promise.resolve(resolve(isArray ? val : [val]))
      },
    }
  })

  const knex = vi.fn(() => {
    const c = chains[callIndex] || chains[chains.length - 1]
    callIndex++
    return c
  })

  knex.fn = { now: vi.fn().mockReturnValue('NOW()') }
  knex.raw = vi.fn().mockResolvedValue({ rows: [] })
  knex.transaction = vi.fn(async callback => {
    const trx = vi.fn(() => {
      const c = chains[callIndex] || chains[chains.length - 1]
      callIndex++
      return c
    })
    trx.fn = knex.fn
    trx.raw = knex.raw
    return callback(trx)
  })

  return { chains, knex, resetIndex: () => { callIndex = 0 } }
}
