/**
 * Migration: Add performance indexes for search and frequent queries.
 *
 * Uses IF NOT EXISTS (via raw SQL) so the migration is idempotent and
 * safe to re-run even if some indexes already exist.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Standard B-tree indexes for foreign-key look-ups
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_incidents_copropriete_id
      ON incidents (copropriete_id)
  `)

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_documents_copropriete_id
      ON documents (copropriete_id)
  `)

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_paiements_coproprietaire_id
      ON paiements (coproprietaire_id)
  `)

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_paiements_appel_fonds_id
      ON paiements (appel_fonds_id)
  `)

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id
      ON notifications (user_id)
  `)

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_mouvements_bancaires_compte_id
      ON mouvements_bancaires (compte_id)
  `)

  // Composite index for appels_fonds filtered by copropriete + year
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_appels_fonds_copropriete_annee
      ON appels_fonds (copropriete_id, annee)
  `)

  // GIN trigram indexes for fast LIKE / ILIKE search on names.
  // Requires the pg_trgm extension — create it if it does not exist yet.
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
      ) THEN
        CREATE EXTENSION pg_trgm;
      END IF;
    END
    $$
  `)

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_coproprietaires_nom_trgm
      ON coproprietaires USING gin (nom gin_trgm_ops)
  `)

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_coproprietaires_prenom_trgm
      ON coproprietaires USING gin (prenom gin_trgm_ops)
  `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(
    'DROP INDEX IF EXISTS idx_coproprietaires_prenom_trgm'
  )
  await knex.raw(
    'DROP INDEX IF EXISTS idx_coproprietaires_nom_trgm'
  )
  await knex.raw(
    'DROP INDEX IF EXISTS idx_appels_fonds_copropriete_annee'
  )
  await knex.raw(
    'DROP INDEX IF EXISTS idx_mouvements_bancaires_compte_id'
  )
  await knex.raw(
    'DROP INDEX IF EXISTS idx_notifications_user_id'
  )
  await knex.raw(
    'DROP INDEX IF EXISTS idx_paiements_appel_fonds_id'
  )
  await knex.raw(
    'DROP INDEX IF EXISTS idx_paiements_coproprietaire_id'
  )
  await knex.raw(
    'DROP INDEX IF EXISTS idx_documents_copropriete_id'
  )
  await knex.raw(
    'DROP INDEX IF EXISTS idx_incidents_copropriete_id'
  )
}
