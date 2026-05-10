/**
 * Add billing cadence (monthly/yearly) to the subscriptions table.
 * Existing rows default to 'monthly' to preserve current billing behaviour.
 */
export async function up(knex) {
  await knex.schema.alterTable('subscriptions', table => {
    table
      .enum('cadence', ['monthly', 'yearly'])
      .notNullable()
      .defaultTo('monthly')
  })
}

export async function down(knex) {
  await knex.schema.alterTable('subscriptions', table => {
    table.dropColumn('cadence')
  })
}
