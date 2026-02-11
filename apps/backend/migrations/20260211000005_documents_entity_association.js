/**
 * Migration: Add entity association to documents
 * Allows linking documents to specific entities (AG, intervention, budget, etc.)
 */
export async function up(knex) {
    await knex.schema.alterTable('documents', (table) => {
        table.string('entite_type', 50).nullable() // 'ag', 'intervention', 'budget', 'contrat', 'sinistre', etc.
        table.integer('entite_id').unsigned().nullable()
        table.index(['entite_type', 'entite_id'])
        table.index(['copropriete_id', 'categorie'])
    })
}

export async function down(knex) {
    await knex.schema.alterTable('documents', (table) => {
        table.dropIndex(['copropriete_id', 'categorie'])
        table.dropIndex(['entite_type', 'entite_id'])
        table.dropColumn('entite_id')
        table.dropColumn('entite_type')
    })
}
