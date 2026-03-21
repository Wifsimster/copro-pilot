/**
 * Create subscriptions table and add plan column to user table
 * for Stripe subscription management.
 */
export async function up(knex) {
  await knex.schema.createTable('subscriptions', table => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid())
    table
      .string('user_id', 36)
      .notNullable()
      .unique()
      .references('id')
      .inTable('user')
      .onDelete('CASCADE')
    table.string('stripe_customer_id').unique()
    table.string('stripe_subscription_id').unique()
    table
      .enum('plan', ['gratuit', 'essentiel', 'pro', 'entreprise'])
      .notNullable()
      .defaultTo('gratuit')
    table
      .enum('status', [
        'active',
        'trialing',
        'past_due',
        'canceled',
        'incomplete',
      ])
      .notNullable()
      .defaultTo('active')
    table.timestamp('current_period_end')
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()

    table.index(['stripe_customer_id'])
    table.index(['stripe_subscription_id'])
  })

  await knex.schema.alterTable('user', table => {
    table.string('plan').defaultTo('gratuit').notNullable()
  })
}

export async function down(knex) {
  await knex.schema.alterTable('user', table => {
    table.dropColumn('plan')
  })
  await knex.schema.dropTableIfExists('subscriptions')
}
