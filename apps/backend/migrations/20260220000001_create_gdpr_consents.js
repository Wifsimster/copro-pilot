/**
 * Migration: Create GDPR consent tracking table
 * Tracks user consent for various data processing purposes
 * as required by GDPR Articles 6-7.
 */
export function up(knex) {
  return knex.schema.createTable('gdpr_consents', table => {
    table.increments('id').primary()
    table
      .string('user_id', 36)
      .notNullable()
      .references('id')
      .inTable('user')
      .onDelete('CASCADE')
    table
      .enum('consent_type', [
        'terms_of_service',
        'privacy_policy',
        'data_processing',
        'marketing_email',
        'analytics_cookies',
      ])
      .notNullable()
    table.boolean('granted').notNullable().defaultTo(false)
    table.string('version', 20).notNullable().defaultTo('1.0')
    table.timestamps(true, true)

    table.index(['user_id'])
    table.index(['consent_type'])
    table.unique(['user_id', 'consent_type', 'version'])
  })
}

export function down(knex) {
  return knex.schema.dropTableIfExists('gdpr_consents')
}
