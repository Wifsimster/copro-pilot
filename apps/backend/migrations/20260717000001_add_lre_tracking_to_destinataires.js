/**
 * Migration: LRE tracking on convocation recipients
 *
 * Persist the proof-of-dispatch a real LRE provider (AR24, eIDAS) returns so
 * "AG conforme" can be defended: provider, tracking id, proof URL and the
 * provider-reported status per recipient. Nullable throughout — the columns
 * stay empty while the noop provider is wired and fill in the day a real
 * provider (LRE_PROVIDER) is configured.
 */
export async function up(knex) {
    await knex.schema.alterTable('destinataires_convocation', table => {
        table.string('lre_provider', 32).nullable()
        table.string('lre_tracking_id', 255).nullable()
        table.text('lre_proof_url').nullable()
        table.string('lre_statut', 64).nullable()
    })
}

export async function down(knex) {
    await knex.schema.alterTable('destinataires_convocation', table => {
        table.dropColumn('lre_provider')
        table.dropColumn('lre_tracking_id')
        table.dropColumn('lre_proof_url')
        table.dropColumn('lre_statut')
    })
}
