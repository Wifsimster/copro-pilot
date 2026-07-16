/**
 * Analytics events for the acquisition funnel (signup → activation →
 * conversion → churn). Kept separate from `domain_events` because that table
 * keys on an integer entity_id, whereas funnel events are keyed on the user
 * (string UUID) and carry a churn `cause`.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('analytics_events', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    // 'signup' | 'activation' | 'conversion' | 'churn'
    table.string('event_type', 40).notNullable()
    table.string('user_id', 255).nullable()
    // Plan involved (conversion/churn) — nullable for signup/activation.
    table.string('plan', 40).nullable()
    // Churn cause: 'voluntary' | 'payment_failed' | 'trial_ended' | 'other'.
    table.string('cause', 40).nullable()
    // Acquisition source for signups (landing, content…), when known.
    table.string('source', 60).nullable()
    table.jsonb('metadata').notNullable().defaultTo('{}')
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())

    table.index(['event_type'], 'idx_analytics_events_type')
    table.index(['created_at'], 'idx_analytics_events_created_at')
    table.index(['user_id'], 'idx_analytics_events_user')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('analytics_events')
}
