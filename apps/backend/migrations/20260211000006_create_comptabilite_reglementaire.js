/**
 * Migration: Comptabilité réglementaire (loi ALUR / décret 14 mars 2005)
 * - Exercices comptables
 * - Plan comptable normalisé copropriété
 * - Écritures comptables (journal)
 */
export async function up(knex) {
    // Exercices comptables
    await knex.schema.createTable('exercices_comptables', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
        table.integer('annee').notNullable()
        table.date('date_debut').notNullable()
        table.date('date_fin').notNullable()
        table.enum('statut', ['ouvert', 'cloture']).notNullable().defaultTo('ouvert')
        table.date('date_cloture').nullable()
        table.text('notes').nullable()
        table.timestamps(true, true)

        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.unique(['copropriete_id', 'annee'])
        table.index(['copropriete_id', 'statut'])
    })

    // Plan comptable normalisé copropriété
    await knex.schema.createTable('plan_comptable', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
        table.string('code', 10).notNullable() // ex: 401, 512, 601...
        table.string('libelle', 255).notNullable()
        table.integer('classe').notNullable() // 1-7
        table.enum('type', ['actif', 'passif', 'charge', 'produit']).notNullable()
        table.boolean('actif').notNullable().defaultTo(true)
        table.timestamps(true, true)

        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.unique(['copropriete_id', 'code'])
        table.index(['copropriete_id', 'classe'])
    })

    // Écritures comptables (journal)
    await knex.schema.createTable('ecritures_comptables', (table) => {
        table.increments('id').primary()
        table.integer('exercice_id').unsigned().notNullable()
        table.integer('copropriete_id').unsigned().notNullable()
        table.date('date_ecriture').notNullable()
        table.string('libelle', 500).notNullable()
        table.string('compte_code', 10).notNullable()
        table.decimal('debit', 12, 2).notNullable().defaultTo(0)
        table.decimal('credit', 12, 2).notNullable().defaultTo(0)
        table.string('piece_ref', 100).nullable() // référence pièce justificative
        table.string('entite_type', 50).nullable() // appel_fonds, paiement, mouvement_bancaire
        table.integer('entite_id').unsigned().nullable()
        table.integer('coproprietaire_id').unsigned().nullable()
        table.text('notes').nullable()
        table.timestamps(true, true)

        table.foreign('exercice_id').references('id').inTable('exercices_comptables').onDelete('CASCADE')
        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.foreign('coproprietaire_id').references('id').inTable('coproprietaires').onDelete('SET NULL')
        table.index(['exercice_id', 'date_ecriture'])
        table.index(['copropriete_id', 'compte_code'])
        table.index(['entite_type', 'entite_id'])
        table.index(['coproprietaire_id'])
    })
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('ecritures_comptables')
    await knex.schema.dropTableIfExists('plan_comptable')
    await knex.schema.dropTableIfExists('exercices_comptables')
}
