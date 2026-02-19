/**
 * Migration: Add soft-delete columns for GDPR erasure support
 * Allows marking records as deleted without permanent removal,
 * preserving referential integrity for financial records.
 */
export async function up(knex) {
  await knex.schema.alterTable('user', table => {
    table.timestamp('deletedAt').nullable()
  })

  await knex.schema.alterTable('coproprietaires', table => {
    table.timestamp('deleted_at').nullable()
  })
}

export async function down(knex) {
  await knex.schema.alterTable('user', table => {
    table.dropColumn('deletedAt')
  })

  await knex.schema.alterTable('coproprietaires', table => {
    table.dropColumn('deleted_at')
  })
}
