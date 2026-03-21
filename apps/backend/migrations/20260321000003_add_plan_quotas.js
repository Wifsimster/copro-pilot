/**
 * Add quota columns to subscriptions table for hybrid pricing model.
 * Each plan has copropriete and user limits with optional overage tracking.
 */
export async function up(knex) {
  await knex.schema.alterTable('subscriptions', table => {
    table.integer('copropriete_limit').nullable()
    table.integer('user_limit').nullable()
    table.integer('extra_coproprietes').defaultTo(0).notNullable()
    table.integer('extra_users').defaultTo(0).notNullable()
  })
}

export async function down(knex) {
  await knex.schema.alterTable('subscriptions', table => {
    table.dropColumn('copropriete_limit')
    table.dropColumn('user_limit')
    table.dropColumn('extra_coproprietes')
    table.dropColumn('extra_users')
  })
}
