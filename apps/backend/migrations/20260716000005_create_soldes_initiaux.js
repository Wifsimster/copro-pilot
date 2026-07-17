/**
 * Soldes initiaux des copropriétaires — the per-owner opening balances set at
 * reprise de gestion (art. 18-2). Complements the account-level à-nouveaux with
 * each copropriétaire's individual solde (créance/dette) at passation.
 * `montant` is signed: positive = the copropriétaire owes the syndicat
 * (débiteur / impayé), negative = the syndicat owes them (créditeur).
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('soldes_initiaux', table => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table
      .integer('coproprietaire_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietaires')
      .onDelete('CASCADE')
    table.integer('annee').notNullable()
    table.decimal('montant', 12, 2).notNullable().defaultTo(0)
    table.timestamps(true, true)

    table.unique(['copropriete_id', 'coproprietaire_id', 'annee'])
    table.index(['copropriete_id', 'annee'])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('soldes_initiaux')
}
