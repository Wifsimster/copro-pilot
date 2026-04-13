/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('votes_electroniques', table => {
    table.increments('id').primary()
    table
      .integer('resolution_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('resolutions')
      .onDelete('CASCADE')
    table
      .integer('coproprietaire_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietaires')
    table.string('vote', 20).notNullable()
    table.integer('poids_voix').notNullable()
    table.string('mode', 20).notNullable()
    table.timestamp('date_vote').notNullable().defaultTo(knex.fn.now())
    table.string('ip_address', 45).nullable()
    table.string('hash', 64).nullable()

    table.unique(['resolution_id', 'coproprietaire_id'])
    table.index(['resolution_id'])
    table.index(['coproprietaire_id'])
  })

  await knex.raw(`
    ALTER TABLE votes_electroniques
      ADD CONSTRAINT votes_electroniques_vote_check
      CHECK (vote IN ('pour', 'contre', 'abstention'))
  `)

  await knex.raw(`
    ALTER TABLE votes_electroniques
      ADD CONSTRAINT votes_electroniques_mode_check
      CHECK (mode IN ('presentiel', 'correspondance', 'en_ligne'))
  `)

  await knex.schema.createTable('procurations', table => {
    table.increments('id').primary()
    table
      .integer('ag_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('assemblees_generales')
      .onDelete('CASCADE')
    table
      .integer('mandant_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietaires')
    table
      .integer('mandataire_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietaires')
    table.timestamp('date_signature').notNullable()
    table.string('statut', 20).notNullable().defaultTo('active')
    table.text('signature_data').nullable()
    table.timestamps(true, true)

    table.unique(['ag_id', 'mandant_id'])
    table.index(['ag_id'])
    table.index(['mandataire_id'])
  })

  await knex.raw(`
    ALTER TABLE procurations
      ADD CONSTRAINT procurations_statut_check
      CHECK (statut IN ('active', 'revoquee', 'utilisee', 'expiree'))
  `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('procurations')
  await knex.schema.dropTableIfExists('votes_electroniques')
}
