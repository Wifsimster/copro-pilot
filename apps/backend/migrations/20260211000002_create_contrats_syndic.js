/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Contrats de syndic
  await knex.schema.createTable('contrats_syndic', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table.string('syndic_nom').notNullable()
    table.date('date_debut').notNullable()
    table.date('date_fin').notNullable()
    table.decimal('remuneration_forfait', 12, 2).nullable()
    table.text('prestations_incluses').nullable()
    table.text('prestations_particulieres').nullable()
    table.text('conditions_execution').nullable()
    table
      .string('statut')
      .notNullable()
      .defaultTo('en_cours')
      .checkIn(['en_cours', 'expire', 'resilie', 'en_attente'])
    table.integer('ag_designation_id').unsigned().nullable()
    table.text('notes').nullable()
    table.timestamps(true, true)
  })

  // Propositions de contrat pour mise en concurrence
  await knex.schema.createTable('propositions_syndic', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table.string('syndic_nom').notNullable()
    table.date('date_reception').notNullable()
    table.decimal('montant_propose', 12, 2).nullable()
    table.text('prestations_proposees').nullable()
    table.string('document_url').nullable()
    table.boolean('retenue').notNullable().defaultTo(false)
    table.text('notes').nullable()
    table.timestamps(true, true)
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('propositions_syndic')
  await knex.schema.dropTableIfExists('contrats_syndic')
}
