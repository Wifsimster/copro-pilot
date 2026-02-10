/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.createTable('prestataires', (table) => {
    table.increments('id').primary()
    table.string('nom', 255).notNullable()
    table.string('siret', 14).nullable()
    table.string('specialite', 255).nullable()
    table.string('contact_nom', 255).nullable()
    table.string('contact_email', 255).nullable()
    table.string('contact_telephone', 20).nullable()
    table.text('adresse').nullable()
    table.text('notes').nullable()
    table.timestamps(true, true)
  })

  await knex.schema.createTable('contrats', (table) => {
    table.increments('id').primary()
    table
      .integer('copropriete_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('coproprietes')
      .onDelete('CASCADE')
    table
      .integer('prestataire_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('prestataires')
      .onDelete('CASCADE')
    table.string('objet', 500).notNullable()
    table.string('type', 100).nullable()
    table.date('date_debut').notNullable()
    table.date('date_fin').nullable()
    table.decimal('montant_annuel', 12, 2).nullable()
    table
      .enum('frequence_paiement', ['mensuel', 'trimestriel', 'semestriel', 'annuel'])
      .defaultTo('annuel')
    table.text('conditions_resiliation').nullable()
    table.integer('preavis_mois').nullable()
    table.boolean('reconduction_tacite').defaultTo(true)
    table
      .enum('statut', ['actif', 'expire', 'resilie', 'en_attente'])
      .defaultTo('actif')
    table.text('notes').nullable()
    table.timestamps(true, true)

    table.index('copropriete_id')
    table.index('prestataire_id')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTableIfExists('contrats')
  await knex.schema.dropTableIfExists('prestataires')
}
