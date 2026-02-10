export async function up(knex) {
  await knex.schema.createTable('relances', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table
      .integer('coproprietaire_id')
      .notNullable()
      .references('id')
      .inTable('coproprietaires')
      .onDelete('CASCADE')
    table
      .string('type')
      .notNullable()
      .defaultTo('amiable')
      .checkIn(['amiable', 'mise_en_demeure', 'contentieux'])
    table.date('date_relance').notNullable()
    table.decimal('montant_du', 12, 2).notNullable()
    table.string('mode_envoi').nullable()
    table
      .string('statut')
      .notNullable()
      .defaultTo('envoyee')
      .checkIn(['brouillon', 'envoyee', 'accusee_reception', 'sans_effet'])
    table.text('notes').nullable()
    table.timestamps(true, true)
    table.index('copropriete_id')
    table.index('coproprietaire_id')
    table.index('statut')
  })

  await knex.schema.createTable('procedures', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table
      .integer('coproprietaire_id')
      .notNullable()
      .references('id')
      .inTable('coproprietaires')
      .onDelete('CASCADE')
    table.string('avocat', 255).nullable()
    table.string('tribunal', 255).nullable()
    table.string('reference_dossier', 100).nullable()
    table.date('date_assignation').nullable()
    table.date('date_audience').nullable()
    table.date('date_jugement').nullable()
    table.decimal('montant_reclame', 12, 2).nullable()
    table.decimal('montant_obtenu', 12, 2).nullable()
    table.decimal('frais_procedure', 12, 2).nullable()
    table
      .string('statut')
      .notNullable()
      .defaultTo('en_cours')
      .checkIn([
        'en_preparation',
        'en_cours',
        'audience_fixee',
        'juge',
        'execute',
        'clos',
      ])
    table.text('decision').nullable()
    table.text('notes').nullable()
    table.timestamps(true, true)
    table.index('copropriete_id')
    table.index('coproprietaire_id')
    table.index('statut')
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('procedures')
  await knex.schema.dropTableIfExists('relances')
}
