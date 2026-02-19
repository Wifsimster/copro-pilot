/**
 * Migration: Create audit log table
 * Tracks all data modifications for GDPR accountability (Art. 5(2)).
 */
export function up(knex) {
  return knex.schema.createTable('audit_log', table => {
    table.bigIncrements('id').primary()
    table.string('user_id', 36).nullable()
    table
      .enum('action', [
        'create',
        'read',
        'update',
        'delete',
        'login',
        'logout',
        'login_failed',
        'export_data',
        'erasure_request',
        'consent_granted',
        'consent_revoked',
      ])
      .notNullable()
    table.string('entity_type', 50).notNullable()
    table.string('entity_id', 50).nullable()
    table.text('description').nullable()
    table.jsonb('changes').nullable()
    table.string('ip_hash', 64).nullable()
    table
      .timestamp('created_at')
      .defaultTo(knex.fn.now())
      .notNullable()

    table.index(['user_id'])
    table.index(['entity_type', 'entity_id'])
    table.index(['action'])
    table.index(['created_at'])
  })
}

export function down(knex) {
  return knex.schema.dropTableIfExists('audit_log')
}
