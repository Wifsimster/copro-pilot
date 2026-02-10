/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Add date fields to coproprietes
  await knex.schema.alterTable('coproprietes', (table) => {
    table.date('date_immatriculation').nullable()
    table.date('date_derniere_maj_registre').nullable()
  })

  // Create declarations_registre table
  await knex.schema.createTable('declarations_registre', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table.integer('annee').notNullable()
    table.date('date_declaration').nullable()
    table.jsonb('donnees_declarees').nullable()
    table
      .string('statut')
      .notNullable()
      .defaultTo('brouillon')
      .checkIn(['brouillon', 'soumis', 'valide'])
    table.text('notes').nullable()
    table.timestamps(true, true)

    table.unique(['copropriete_id', 'annee'])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('declarations_registre')

  await knex.schema.alterTable('coproprietes', (table) => {
    table.dropColumn('date_immatriculation')
    table.dropColumn('date_derniere_maj_registre')
  })
}
