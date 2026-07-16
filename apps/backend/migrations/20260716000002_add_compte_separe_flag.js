/**
 * Mark whether a bank account is the syndicat's dedicated separate account
 * (compte bancaire séparé obligatoire — art. 18 loi 1965 / loi ALUR / Hoguet).
 * A dedicated separate account per copropriété is a prerequisite for selling
 * to professional syndics (loi Hoguet garantie financière). Defaults to true
 * so existing accounts are treated as compliant until reviewed.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('comptes_bancaires', table => {
    table.boolean('est_compte_separe').notNullable().defaultTo(true)
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('comptes_bancaires', table => {
    table.dropColumn('est_compte_separe')
  })
}
