/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('domain_events', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'))
    table.string('event_type', 100).notNullable()
    table.string('entity_type', 50).notNullable()
    table.integer('entity_id').notNullable()
    table
      .integer('copropriete_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('SET NULL')
    table.string('actor_id', 255).nullable()
    table.jsonb('payload').notNullable().defaultTo('{}')
    table.jsonb('metadata').notNullable().defaultTo('{}')
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('processed_at', { useTz: true }).nullable()

    // Indexes
    table.index(
      ['entity_type', 'entity_id'],
      'idx_domain_events_entity'
    )
    table.index(
      ['copropriete_id'],
      'idx_domain_events_copropriete'
    )
    table.index(['event_type'], 'idx_domain_events_event_type')
    table.index(['created_at'], 'idx_domain_events_created_at')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('domain_events')
}
