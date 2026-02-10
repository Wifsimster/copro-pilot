/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.createTable('comptes_bancaires', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table.string('banque', 255).notNullable()
    table.string('iban', 34).notNullable()
    table.string('bic', 11).nullable()
    table
      .enum('type', ['courant', 'fonds_travaux', 'emprunt'])
      .notNullable()
      .defaultTo('courant')
    table.string('libelle', 255).nullable()
    table.decimal('solde', 12, 2).defaultTo(0)
    table.date('date_ouverture').nullable()
    table.boolean('actif').defaultTo(true)
    table.text('notes').nullable()
    table.timestamps(true, true)

    table.index('copropriete_id')
  })

  await knex.schema.createTable('mouvements_bancaires', (table) => {
    table.increments('id').primary()
    table
      .integer('compte_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('comptes_bancaires')
      .onDelete('CASCADE')
    table.date('date').notNullable()
    table.string('libelle', 500).notNullable()
    table.decimal('montant', 12, 2).notNullable()
    table
      .enum('type', ['credit', 'debit'])
      .notNullable()
    table.string('categorie', 100).nullable()
    table.string('reference', 255).nullable()
    table
      .integer('paiement_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('paiements')
      .onDelete('SET NULL')
    table.boolean('rapproche').defaultTo(false)
    table.text('notes').nullable()
    table.timestamps(true, true)

    table.index('compte_id')
    table.index('date')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTableIfExists('mouvements_bancaires')
  await knex.schema.dropTableIfExists('comptes_bancaires')
}
