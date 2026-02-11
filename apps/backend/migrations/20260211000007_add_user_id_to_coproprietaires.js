/**
 * Migration: Link copropriétaires to user accounts for extranet access
 */
export async function up(knex) {
    await knex.schema.alterTable('coproprietaires', (table) => {
        table.string('user_id', 36).nullable()
        table.foreign('user_id').references('id').inTable('user').onDelete('SET NULL')
        table.index(['user_id'])
    })
}

export async function down(knex) {
    await knex.schema.alterTable('coproprietaires', (table) => {
        table.dropIndex(['user_id'])
        table.dropForeign(['user_id'])
        table.dropColumn('user_id')
    })
}
