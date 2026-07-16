/**
 * Régularisation des charges — persisted annual-close act.
 * A régularisation reconciles the year's called provisions against the real
 * expenses and stores the per-lot solde (créditeur/débiteur), so the clôture
 * is auditable and retrievable.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('regularisations', table => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table.integer('annee').notNullable()
    table.decimal('total_charges_reelles', 12, 2).notNullable()
    table.decimal('total_provisions', 12, 2).notNullable()
    table.decimal('solde_global', 12, 2).notNullable()
    table.decimal('total_remboursements', 12, 2).notNullable().defaultTo(0)
    table.decimal('total_complements', 12, 2).notNullable().defaultTo(0)
    table
      .enum('statut', ['brouillon', 'validee'])
      .notNullable()
      .defaultTo('brouillon')
    table.timestamps(true, true)

    table.index(['copropriete_id'])
    table.unique(['copropriete_id', 'annee'])
  })

  await knex.schema.createTable('regularisation_lignes', table => {
    table.increments('id').primary()
    table
      .integer('regularisation_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('regularisations')
      .onDelete('CASCADE')
    table
      .integer('lot_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('lots')
      .onDelete('CASCADE')
    table.integer('tantiemes').notNullable()
    table.decimal('quote_part', 12, 2).notNullable()
    table.decimal('provisions', 12, 2).notNullable()
    table.decimal('solde', 12, 2).notNullable()
    table.enum('sens', ['crediteur', 'debiteur', 'equilibre']).notNullable()

    table.index(['regularisation_id'])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('regularisation_lignes')
  await knex.schema.dropTableIfExists('regularisations')
}
