export async function up(knex) {
  await knex.schema.alterTable('user', table => {
    table.boolean('mustChangePassword').defaultTo(false)
  })
}

export async function down(knex) {
  await knex.schema.alterTable('user', table => {
    table.dropColumn('mustChangePassword')
  })
}
