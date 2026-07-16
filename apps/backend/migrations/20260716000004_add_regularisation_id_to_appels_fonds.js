/**
 * Link an appel de fonds back to the régularisation that generated it, so a
 * régularisation call is identifiable (and not confused with a provisional
 * quarterly call) and generated at most once per régularisation.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('appels_fonds', table => {
    table
      .integer('regularisation_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('regularisations')
      .onDelete('SET NULL')
    table.index(['regularisation_id'])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('appels_fonds', table => {
    table.dropColumn('regularisation_id')
  })
}
