/**
 * Migration: Convocations AG & Destinataires
 * Workflow de convocation pour les assemblées générales
 */
export async function up(knex) {
    await knex.schema.createTable('convocations_ag', (table) => {
        table.increments('id').primary()
        table.integer('ag_id').unsigned().notNullable()
        table.date('date_envoi').nullable()
        table.enum('mode_envoi', ['email', 'courrier_recommande', 'les_deux']).notNullable().defaultTo('email')
        table.enum('statut', ['brouillon', 'validee', 'envoyee', 'cloturee']).notNullable().defaultTo('brouillon')
        table.text('contenu').nullable()
        table.text('documents_annexes').nullable() // JSON array of document references
        table.text('notes').nullable()
        table.timestamps(true, true)

        table.foreign('ag_id').references('id').inTable('assemblees_generales').onDelete('CASCADE')
        table.index(['ag_id'])
        table.index(['statut'])
    })

    await knex.schema.createTable('destinataires_convocation', (table) => {
        table.increments('id').primary()
        table.integer('convocation_id').unsigned().notNullable()
        table.integer('coproprietaire_id').unsigned().notNullable()
        table.enum('statut', ['en_attente', 'envoyee', 'recue', 'ar_signe']).notNullable().defaultTo('en_attente')
        table.date('date_envoi').nullable()
        table.date('date_reception').nullable()
        table.date('date_ar').nullable() // date accusé de réception signé
        table.enum('mode_envoi', ['email', 'courrier_recommande']).nullable()
        table.string('email_envoye_a', 255).nullable() // snapshot of email at send time
        table.text('notes').nullable()
        table.timestamps(true, true)

        table.foreign('convocation_id').references('id').inTable('convocations_ag').onDelete('CASCADE')
        table.foreign('coproprietaire_id').references('id').inTable('coproprietaires').onDelete('CASCADE')
        table.unique(['convocation_id', 'coproprietaire_id'])
        table.index(['convocation_id'])
        table.index(['coproprietaire_id'])
    })
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('destinataires_convocation')
    await knex.schema.dropTableIfExists('convocations_ag')
}
