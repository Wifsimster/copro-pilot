/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.createTable('diagnostics', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table
      .enum('type', [
        'dpe',
        'amiante',
        'plomb',
        'dtg',
        'ppt',
        'gaz',
        'electricite',
        'autre',
      ])
      .notNullable()
    table.string('prestataire', 255).nullable()
    table.date('date_realisation').notNullable()
    table.date('date_validite').nullable()
    table.string('document_url', 500).nullable()
    table.text('observations').nullable()
    table
      .enum('statut', ['valide', 'expire', 'a_renouveler'])
      .notNullable()
      .defaultTo('valide')
    table.timestamps(true, true)

    table.index('copropriete_id')
    table.index('type')
    table.index('statut')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTableIfExists('diagnostics')
}
