/**
 * Migration: Create cycle_annuel table
 * Tracks mandatory annual compliance tasks per copropriete.
 */
export function up(knex) {
  return knex.schema.createTable('cycle_annuel', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table.integer('annee').notNullable()
    table.string('tache_code', 50).notNullable()
    table.string('tache_label', 255).notNullable()
    table
      .enum('statut', ['pending', 'in_progress', 'completed', 'overdue'])
      .notNullable()
      .defaultTo('pending')
    table.date('date_echeance').nullable()
    table.date('date_completion').nullable()
    table.text('notes').nullable()
    table.timestamps(true, true)

    table.unique(['copropriete_id', 'annee', 'tache_code'])
  })
}

export function down(knex) {
  return knex.schema.dropTableIfExists('cycle_annuel')
}
