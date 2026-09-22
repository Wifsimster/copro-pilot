/**
 * A mandant may give a new procuration after revoking the previous one:
 * uniqueness per (ag_id, mandant_id) only applies to active procurations.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('procurations', table => {
    table.dropUnique(['ag_id', 'mandant_id'])
  })
  await knex.raw(`
    CREATE UNIQUE INDEX procurations_ag_mandant_active_unique
      ON procurations (ag_id, mandant_id)
      WHERE statut = 'active'
  `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw('DROP INDEX IF EXISTS procurations_ag_mandant_active_unique')
  await knex.schema.alterTable('procurations', table => {
    table.unique(['ag_id', 'mandant_id'])
  })
}
