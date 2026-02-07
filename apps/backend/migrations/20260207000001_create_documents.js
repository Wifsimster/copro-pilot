/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable('documents', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
            .references('id').inTable('coproprietes').onDelete('CASCADE')
        table.string('nom').notNullable()
        table.string('categorie').defaultTo('autre')
        table.string('fichier_nom').notNullable()
        table.string('fichier_path').notNullable()
        table.string('mime_type')
        table.integer('taille').unsigned()
        table.text('description')
        table.timestamps(true, true)
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists('documents')
}
