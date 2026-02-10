/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.alterTable('coproprietes', (table) => {
    table.integer('nombre_batiments').nullable().defaultTo(0)
    table.integer('nombre_ascenseurs').nullable().defaultTo(0)
    table.string('periode_construction', 50).nullable()
    table.enum('type_chauffage', ['individuel', 'collectif', 'mixte']).nullable()
    table.enum('energie_chauffage', ['gaz', 'electricite', 'fioul', 'bois', 'pompe_chaleur', 'reseau_chaleur', 'autre']).nullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.alterTable('coproprietes', (table) => {
    table.dropColumn('nombre_batiments')
    table.dropColumn('nombre_ascenseurs')
    table.dropColumn('periode_construction')
    table.dropColumn('type_chauffage')
    table.dropColumn('energie_chauffage')
  })
}
