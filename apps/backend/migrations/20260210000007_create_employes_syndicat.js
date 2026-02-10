export async function up(knex) {
  await knex.schema.createTable('employes_syndicat', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table.string('nom', 255).notNullable()
    table.string('prenom', 255).notNullable()
    table.string('poste', 100).notNullable()
    table
      .string('type_contrat')
      .notNullable()
      .defaultTo('cdi')
      .checkIn(['cdi', 'cdd', 'interim', 'saisonnier'])
    table.date('date_embauche').notNullable()
    table.date('date_fin').nullable()
    table.decimal('salaire_brut', 12, 2).nullable()
    table.boolean('logement_fonction').defaultTo(false)
    table
      .string('statut')
      .notNullable()
      .defaultTo('actif')
      .checkIn(['actif', 'inactif'])
    table.text('notes').nullable()
    table.timestamps(true, true)

    table.index('copropriete_id')
    table.index('statut')
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('employes_syndicat')
}
