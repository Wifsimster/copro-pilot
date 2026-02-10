/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary()
    table.string('user_id').notNullable()
      .references('id').inTable('user').onDelete('CASCADE')
    table.integer('copropriete_id').unsigned().nullable()
      .references('id').inTable('coproprietes').onDelete('CASCADE')
    table.string('type').notNullable().defaultTo('general')
    table.string('titre').notNullable()
    table.text('message').nullable()
    table.boolean('lu').notNullable().defaultTo(false)
    table.string('lien').nullable()
    table.timestamps(true, true)
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('notifications')
}
