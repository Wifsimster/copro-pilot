export async function up(knex) {
  await knex.schema.createTable('conseil_syndical', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table
      .integer('coproprietaire_id')
      .notNullable()
      .references('id')
      .inTable('coproprietaires')
      .onDelete('CASCADE')
    table
      .string('role')
      .notNullable()
      .defaultTo('membre')
      .checkIn(['president', 'membre', 'suppleant'])
    table.date('date_election').notNullable()
    table.date('date_fin_mandat').nullable()
    table
      .integer('ag_election_id')
      .nullable()
      .references('id')
      .inTable('assemblees_generales')
      .onDelete('SET NULL')
    table.text('notes').nullable()
    table.timestamps(true, true)

    table.unique(['copropriete_id', 'coproprietaire_id'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('conseil_syndical')
}
