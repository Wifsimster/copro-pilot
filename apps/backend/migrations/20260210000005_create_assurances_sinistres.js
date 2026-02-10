export async function up(knex) {
  await knex.schema.createTable('assurances', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table.string('compagnie', 255).notNullable()
    table.string('numero_police', 100).nullable()
    table
      .string('type')
      .notNullable()
      .defaultTo('multirisque_immeuble')
      .checkIn(['multirisque_immeuble', 'responsabilite_civile', 'dommages_ouvrage', 'protection_juridique', 'autre'])
    table.date('date_debut').notNullable()
    table.date('date_fin').nullable()
    table.decimal('prime_annuelle', 12, 2).nullable()
    table.decimal('franchise', 12, 2).nullable()
    table
      .string('statut')
      .notNullable()
      .defaultTo('actif')
      .checkIn(['actif', 'expire', 'resilie'])
    table.text('notes').nullable()
    table.timestamps(true, true)

    table.index('copropriete_id')
    table.index('statut')
  })

  await knex.schema.createTable('sinistres', (table) => {
    table.increments('id').primary()
    table
      .integer('assurance_id')
      .nullable()
      .references('id')
      .inTable('assurances')
      .onDelete('SET NULL')
    table
      .integer('incident_id')
      .nullable()
      .references('id')
      .inTable('incidents')
      .onDelete('SET NULL')
    table
      .integer('copropriete_id')
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table.string('numero_sinistre', 100).nullable()
    table.date('date_sinistre').notNullable()
    table.date('date_declaration').nullable()
    table.text('description').nullable()
    table.decimal('montant_estime', 12, 2).nullable()
    table.decimal('montant_indemnise', 12, 2).nullable()
    table
      .string('statut')
      .notNullable()
      .defaultTo('declare')
      .checkIn(['declare', 'en_instruction', 'accepte', 'refuse', 'clos'])
    table.text('notes').nullable()
    table.timestamps(true, true)

    table.index('copropriete_id')
    table.index('assurance_id')
    table.index('statut')
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('sinistres')
  await knex.schema.dropTableIfExists('assurances')
}
