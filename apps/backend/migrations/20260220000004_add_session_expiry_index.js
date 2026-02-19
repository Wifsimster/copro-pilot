/**
 * Migration: Add index on session.expiresAt for data retention cleanup
 */
export function up(knex) {
  return knex.schema.alterTable('session', table => {
    table.index(['expiresAt'])
  })
}

export function down(knex) {
  return knex.schema.alterTable('session', table => {
    table.dropIndex(['expiresAt'])
  })
}
