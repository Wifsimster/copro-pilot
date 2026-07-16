import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export const ANALYTICS_EVENT_TYPES = [
  'signup',
  'activation',
  'conversion',
  'churn',
]

export class AnalyticsEventModel {
  /**
   * Record a funnel event. Never throws to the caller's critical path — the
   * service layer decides how to handle failures (analytics must not break a
   * checkout or a signup).
   */
  static async record({
    event_type,
    user_id = null,
    plan = null,
    cause = null,
    source = null,
    metadata = {},
  }) {
    const db = getDb()
    const [row] = await db('analytics_events')
      .insert({ event_type, user_id, plan, cause, source, metadata })
      .returning('*')
    return row
  }

  /**
   * Count events of a given type in the [from, to] window (inclusive lower,
   * exclusive upper). `from`/`to` are Date objects or ISO strings; when
   * omitted, no bound is applied on that side.
   */
  static async countByType(event_type, { from, to } = {}) {
    const db = getDb()
    const query = db('analytics_events')
      .where('event_type', event_type)
      .count('id as count')
    if (from) query.where('created_at', '>=', from)
    if (to) query.where('created_at', '<', to)
    const [{ count }] = await query
    return parseInt(count, 10)
  }

  /**
   * Distinct users who produced at least one event of the given type in the
   * window. Used for activation (a user activates once, not per event).
   */
  static async countDistinctUsers(event_type, { from, to } = {}) {
    const db = getDb()
    const query = db('analytics_events')
      .where('event_type', event_type)
      .whereNotNull('user_id')
      .countDistinct('user_id as count')
    if (from) query.where('created_at', '>=', from)
    if (to) query.where('created_at', '<', to)
    const [{ count }] = await query
    return parseInt(count, 10)
  }

  /**
   * Churn counts grouped by cause in the window.
   * Returns e.g. { voluntary: 3, payment_failed: 1 }.
   */
  static async churnByCause({ from, to } = {}) {
    const db = getDb()
    const query = db('analytics_events')
      .where('event_type', 'churn')
      .select('cause')
      .count('id as count')
      .groupBy('cause')
    if (from) query.where('created_at', '>=', from)
    if (to) query.where('created_at', '<', to)
    const rows = await query
    return rows.reduce((acc, r) => {
      acc[r.cause || 'other'] = parseInt(r.count, 10)
      return acc
    }, {})
  }
}
