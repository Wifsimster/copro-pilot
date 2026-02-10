export async function up(knex) {
  await knex.schema.createTable('reglements_copropriete', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table.date('date_etablissement').notNullable()
    table.date('date_derniere_modification').nullable()
    table.string('notaire', 255).nullable()
    table
      .string('destination_immeuble')
      .notNullable()
      .defaultTo('habitation')
      .checkIn(['habitation', 'commerce', 'mixte'])
    table.text('restrictions_usage').nullable()
    table.text('conditions_travaux').nullable()
    table.text('composition_conseil_syndical').nullable()
    table.text('modalites_convocation_ag').nullable()
    table.string('document_url', 500).nullable()
    table.text('notes').nullable()
    table.timestamps(true, true)
    table.index('copropriete_id')
  })

  await knex.schema.createTable('articles_reglement', (table) => {
    table.increments('id').primary()
    table
      .integer('reglement_id')
      .notNullable()
      .references('id')
      .inTable('reglements_copropriete')
      .onDelete('CASCADE')
    table.string('numero', 50).notNullable()
    table.string('titre', 500).notNullable()
    table.text('contenu').nullable()
    table
      .string('categorie')
      .notNullable()
      .defaultTo('autre')
      .checkIn([
        'parties_privatives',
        'parties_communes',
        'charges',
        'usage',
        'travaux',
        'conseil_syndical',
        'ag',
        'autre',
      ])
    table.integer('ordre').notNullable().defaultTo(0)
    table.text('notes').nullable()
    table.timestamps(true, true)
    table.index('reglement_id')
    table.index('categorie')
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('articles_reglement')
  await knex.schema.dropTableIfExists('reglements_copropriete')
}
