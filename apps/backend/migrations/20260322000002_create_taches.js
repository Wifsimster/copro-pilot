/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable('taches', (table) => {
        table.increments('id').primary()
        table.string('user_id', 255).nullable()
            .references('id').inTable('user').onDelete('SET NULL')
        table.integer('copropriete_id').unsigned().nullable()
            .references('id').inTable('coproprietes').onDelete('CASCADE')
        table.string('titre', 500).notNullable()
        table.text('description').nullable()
        table.date('date_echeance').nullable()
        table.date('rappel_date').nullable()
        table.string('entite_type', 50).nullable()
        table.integer('entite_id').nullable()
        table.string('statut').defaultTo('a_faire')
        table.string('priorite').defaultTo('normale')
        table.boolean('auto_generated').defaultTo(false)
        table.timestamps(true, true)

        table.index('user_id')
        table.index('copropriete_id')
        table.index('statut')
        table.index('date_echeance')
        table.index(['entite_type', 'entite_id'])
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists('taches')
}
