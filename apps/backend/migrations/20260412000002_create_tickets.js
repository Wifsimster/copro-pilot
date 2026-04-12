/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('tickets', (table) => {
    table.increments('id').primary()
    table.integer('copropriete_id').unsigned().nullable()
      .references('id').inTable('coproprietes').onDelete('CASCADE')
    table.string('auteur_id').notNullable()
      .references('id').inTable('user').onDelete('CASCADE')
    table.string('sujet', 255).notNullable()
    table.string('categorie', 50).notNullable().defaultTo('general')
    table.string('statut', 20).notNullable().defaultTo('ouvert')
    table.string('priorite', 20).notNullable().defaultTo('normale')
    table.timestamps(true, true)
  })

  await knex.raw(`
    ALTER TABLE tickets
      ADD CONSTRAINT tickets_categorie_check
      CHECK (categorie IN ('general', 'maintenance', 'financier', 'juridique', 'autre'))
  `)

  await knex.raw(`
    ALTER TABLE tickets
      ADD CONSTRAINT tickets_statut_check
      CHECK (statut IN ('ouvert', 'en_cours', 'resolu', 'ferme'))
  `)

  await knex.raw(`
    ALTER TABLE tickets
      ADD CONSTRAINT tickets_priorite_check
      CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente'))
  `)

  await knex.schema.createTable('ticket_messages', (table) => {
    table.increments('id').primary()
    table.integer('ticket_id').unsigned().notNullable()
      .references('id').inTable('tickets').onDelete('CASCADE')
    table.string('auteur_id').notNullable()
      .references('id').inTable('user').onDelete('CASCADE')
    table.text('contenu').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('ticket_messages')
  await knex.schema.dropTableIfExists('tickets')
}
