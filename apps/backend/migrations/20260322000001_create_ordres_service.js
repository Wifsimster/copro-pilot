/**
 * Migration — Ordres de Service
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable('ordres_service', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
        table.integer('incident_id').unsigned().nullable()
        table.integer('prestataire_id').unsigned().nullable()
        table.integer('intervention_id').unsigned().nullable()
        table.string('numero', 50).notNullable()
        table.string('objet', 500).notNullable()
        table.text('description').nullable()
        table
          .enum('urgence', ['normale', 'urgente', 'tres_urgente'])
          .notNullable()
          .defaultTo('normale')
        table
          .enum('statut', [
            'brouillon',
            'emis',
            'devis_recu',
            'accepte',
            'termine',
            'annule',
          ])
          .notNullable()
          .defaultTo('brouillon')
        table.decimal('montant_estime', 12, 2).nullable()
        table.decimal('montant_devis', 12, 2).nullable()
        table.decimal('montant_facture', 12, 2).nullable()
        table.date('date_emission').nullable()
        table.date('date_limite_reponse').nullable()
        table.date('date_acceptation').nullable()
        table.date('date_cloture').nullable()
        table.text('notes').nullable()
        table.timestamps(true, true)

        table
          .foreign('copropriete_id')
          .references('id')
          .inTable('coproprietes')
          .onDelete('CASCADE')
        table
          .foreign('incident_id')
          .references('id')
          .inTable('incidents')
          .onDelete('SET NULL')
        table
          .foreign('prestataire_id')
          .references('id')
          .inTable('prestataires')
          .onDelete('SET NULL')
        table
          .foreign('intervention_id')
          .references('id')
          .inTable('interventions')
          .onDelete('SET NULL')
        table.index(['copropriete_id'])
        table.index(['incident_id'])
        table.index(['statut'])
    })

    // Add prestataire_id and ordre_service_id to interventions
    await knex.schema.alterTable('interventions', (table) => {
        table.integer('prestataire_id').unsigned().nullable()
        table.integer('ordre_service_id').unsigned().nullable()

        table
          .foreign('prestataire_id')
          .references('id')
          .inTable('prestataires')
          .onDelete('SET NULL')
        table
          .foreign('ordre_service_id')
          .references('id')
          .inTable('ordres_service')
          .onDelete('SET NULL')
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.alterTable('interventions', (table) => {
        table.dropForeign('prestataire_id')
        table.dropForeign('ordre_service_id')
        table.dropColumn('prestataire_id')
        table.dropColumn('ordre_service_id')
    })
    await knex.schema.dropTableIfExists('ordres_service')
}
