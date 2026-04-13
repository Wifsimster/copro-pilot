import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'
import { sha256, canonicalStringify } from '../utils/crypto.js'

const getDb = () => knexDatabase.getKnex()

/**
 * Build the canonical payload that is hashed for a row.
 * Keys are always the same and the canonical stringifier
 * sorts them, so two runs on identical data always yield
 * the same digest.
 */
function buildHashPayload(row) {
  return canonicalStringify({
    user_id: row.user_id ?? null,
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id ?? null,
    ip_address: row.ip_hash ?? null,
    user_agent: row.user_agent ?? null,
    details:
      row.changes === null || row.changes === undefined
        ? null
        : typeof row.changes === 'string'
          ? row.changes
          : JSON.stringify(row.changes),
    description: row.description ?? null,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    prev_hash: row.prev_hash ?? null,
  })
}

export class AuditLogModel {
  /**
   * Append a new entry to the audit log.
   *
   * Runs inside a SERIALIZABLE-ish transaction: we lock the
   * most recent row FOR UPDATE so two concurrent inserts
   * cannot both read the same `prev_hash` and corrupt the
   * chain.
   */
  static async create(entry) {
    const db = getDb()

    return db.transaction(async trx => {
      const latest = await trx('audit_log')
        .orderBy('id', 'desc')
        .forUpdate()
        .first('hash')

      const prevHash = latest?.hash || null
      const createdAt = new Date()

      const changesJson = entry.changes
        ? JSON.stringify(entry.changes)
        : null

      const row = {
        user_id: entry.user_id || null,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id || null,
        description: entry.description || null,
        changes: changesJson,
        ip_hash: entry.ip_hash || null,
        created_at: createdAt,
        prev_hash: prevHash,
      }

      const hash = sha256(buildHashPayload(row))

      const [result] = await trx('audit_log')
        .insert({ ...row, hash })
        .returning('*')

      return result
    })
  }

  static async query({
    userId,
    action,
    entityType,
    from,
    to,
    page = 1,
    limit = 50,
  }) {
    const db = getDb()
    let query = db('audit_log').orderBy('created_at', 'desc')

    if (userId) query = query.where('user_id', userId)
    if (action) query = query.where('action', action)
    if (entityType) query = query.where('entity_type', entityType)
    if (from) query = query.where('created_at', '>=', from)
    if (to) query = query.where('created_at', '<=', to)

    const offset = (page - 1) * limit
    const countResult = await query
      .clone()
      .count('id as total')
      .first()
    const data = await query.offset(offset).limit(limit)

    const total = parseInt(countResult?.total || 0, 10)

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Walk the audit_log chain and verify every row's hash
   * matches its canonical content and links correctly to
   * the previous row.
   *
   * @param {number} fromId  inclusive lower bound on id
   * @param {number|null} toId  inclusive upper bound on id
   * @returns {Promise<{ valid: boolean, brokenAt?: number, message?: string, total: number }>}
   */
  static async verifyChain(fromId = 0, toId = null) {
    const db = getDb()

    let query = db('audit_log')
      .where('id', '>=', fromId)
      .orderBy('id', 'asc')

    if (toId !== null && toId !== undefined) {
      query = query.andWhere('id', '<=', toId)
    }

    const rows = await query

    if (rows.length === 0) {
      return { valid: true, total: 0 }
    }

    // For the first row in the selected window we need the
    // previous row's hash to validate the linkage, unless we
    // start at the very beginning of the chain.
    let expectedPrevHash = null
    if (fromId > 0) {
      const previous = await db('audit_log')
        .where('id', '<', rows[0].id)
        .orderBy('id', 'desc')
        .first('hash')
      expectedPrevHash = previous?.hash || null
    }

    for (const row of rows) {
      if ((row.prev_hash || null) !== expectedPrevHash) {
        return {
          valid: false,
          brokenAt: Number(row.id),
          message: `prev_hash mismatch at id=${row.id}: expected ${expectedPrevHash}, got ${row.prev_hash}`,
          total: rows.length,
        }
      }

      const recomputed = sha256(buildHashPayload(row))
      if (recomputed !== row.hash) {
        return {
          valid: false,
          brokenAt: Number(row.id),
          message: `hash mismatch at id=${row.id}: recomputed ${recomputed} does not match stored ${row.hash}`,
          total: rows.length,
        }
      }

      expectedPrevHash = row.hash
    }

    return { valid: true, total: rows.length }
  }

  /**
   * Soft-archive (or, with `force: true`, physically delete)
   * audit log rows older than the given date.
   *
   * Physical deletion breaks the hash chain and should only
   * be used for legally mandated purges — the caller must
   * opt in explicitly with `{ force: true }`.
   */
  static async purgeOlderThan(date, options = {}) {
    const db = getDb()
    const { force = false } = options

    logger.warn(
      '[AuditLogModel] purgeOlderThan called — this affects the tamper-proof audit chain',
      { date, force }
    )

    if (force) {
      logger.warn(
        '[AuditLogModel] Physical deletion of audit_log rows — hash chain will be broken for the purged range'
      )
      return db('audit_log').where('created_at', '<', date).del()
    }

    return db('audit_log')
      .where('created_at', '<', date)
      .update({ archived: true })
  }
}
