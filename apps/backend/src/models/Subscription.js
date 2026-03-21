import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class SubscriptionModel {
  static async getByUserId(userId) {
    const db = getDb()
    return db('subscriptions').where('user_id', userId).first()
  }

  static async getByStripeCustomerId(stripeCustomerId) {
    const db = getDb()
    return db('subscriptions')
      .where('stripe_customer_id', stripeCustomerId)
      .first()
  }

  static async getByStripeSubscriptionId(stripeSubscriptionId) {
    const db = getDb()
    return db('subscriptions')
      .where('stripe_subscription_id', stripeSubscriptionId)
      .first()
  }

  static async create(data) {
    const db = getDb()
    const [result] = await db('subscriptions')
      .insert({
        user_id: data.user_id,
        stripe_customer_id: data.stripe_customer_id || null,
        stripe_subscription_id: data.stripe_subscription_id || null,
        plan: data.plan || 'gratuit',
        status: data.status || 'active',
        current_period_end: data.current_period_end || null,
      })
      .returning('*')
    return result
  }

  static async update(userId, data) {
    const db = getDb()
    const [result] = await db('subscriptions')
      .where('user_id', userId)
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning('*')
    return result
  }

  static async upsertByStripeCustomerId(stripeCustomerId, data) {
    const db = getDb()
    const existing = await db('subscriptions')
      .where('stripe_customer_id', stripeCustomerId)
      .first()

    if (existing) {
      const [result] = await db('subscriptions')
        .where('stripe_customer_id', stripeCustomerId)
        .update({ ...data, updated_at: db.fn.now() })
        .returning('*')
      return result
    }

    const [result] = await db('subscriptions')
      .insert({
        stripe_customer_id: stripeCustomerId,
        ...data,
      })
      .returning('*')
    return result
  }

  static async updateUserPlan(userId, plan) {
    const db = getDb()
    await db('user').where('id', userId).update({ plan })
  }

  static async getActiveWithOverage() {
    const db = getDb()
    return db('subscriptions')
      .whereIn('plan', ['pro', 'entreprise'])
      .where('status', 'active')
      .whereNotNull('stripe_subscription_id')
  }
}
