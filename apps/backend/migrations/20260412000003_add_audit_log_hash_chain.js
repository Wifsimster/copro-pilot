/**
 * Migration: add tamper-proof hash chain columns to audit_log.
 *
 * Each audit_log row carries:
 *   - prev_hash: the hash of the previous row in the chain
 *   - hash:      SHA-256 of this row's canonical content
 *
 * Together they form an append-only Merkle-like chain that
 * lets us detect any insertion, deletion or mutation of past
 * audit entries.
 *
 * Also introduces an `archived` boolean column so purge
 * operations can soft-archive old rows instead of physically
 * deleting them (which would break the chain).
 *
 * Uses raw SQL with `IF NOT EXISTS` so the migration is
 * idempotent and safe to re-run.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
    ALTER TABLE audit_log
      ADD COLUMN IF NOT EXISTS prev_hash varchar(64)
  `)

  await knex.raw(`
    ALTER TABLE audit_log
      ADD COLUMN IF NOT EXISTS hash varchar(64)
  `)

  await knex.raw(`
    ALTER TABLE audit_log
      ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false
  `)

  await knex.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_log_hash
      ON audit_log (hash)
  `)

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_audit_log_archived
      ON audit_log (archived)
  `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw('DROP INDEX IF EXISTS idx_audit_log_archived')
  await knex.raw('DROP INDEX IF EXISTS idx_audit_log_hash')
  await knex.raw(
    'ALTER TABLE audit_log DROP COLUMN IF EXISTS archived'
  )
  await knex.raw(
    'ALTER TABLE audit_log DROP COLUMN IF EXISTS hash'
  )
  await knex.raw(
    'ALTER TABLE audit_log DROP COLUMN IF EXISTS prev_hash'
  )
}
