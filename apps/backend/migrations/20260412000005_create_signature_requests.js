/**
 * Migration: create signature_requests and signature_signatories tables.
 *
 * Provides the database foundation for document e-signing via
 * external providers (Yousign by default). A signature_request
 * is attached to a document and (optionally) to an assemblée
 * générale. It tracks the external provider request id and the
 * aggregate signing status.
 *
 * signature_signatories stores the individual signers, each
 * linked back to a coproprietaire when applicable, with their
 * own status and the provider-issued signing URL.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('signature_requests', table => {
    table.increments('id').primary()
    table
      .integer('document_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('documents')
      .onDelete('CASCADE')
    table
      .integer('ag_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('assemblees_generales')
      .onDelete('SET NULL')
    table.string('provider', 50).defaultTo('yousign')
    table.string('provider_request_id', 255).nullable()
    table.string('statut', 30).defaultTo('created')
    table
      .text('requested_by')
      .nullable()
      .references('id')
      .inTable('user')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('expires_at').nullable()
  })

  await knex.raw(`
    ALTER TABLE signature_requests
      ADD CONSTRAINT signature_requests_statut_check
      CHECK (statut IN ('created', 'pending', 'signed', 'expired', 'canceled'))
  `)

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_signature_requests_document_id
      ON signature_requests (document_id)
  `)

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_signature_requests_ag_id
      ON signature_requests (ag_id)
  `)

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_signature_requests_provider_request_id
      ON signature_requests (provider_request_id)
  `)

  await knex.schema.createTable('signature_signatories', table => {
    table.increments('id').primary()
    table
      .integer('signature_request_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('signature_requests')
      .onDelete('CASCADE')
    table
      .integer('coproprietaire_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('coproprietaires')
      .onDelete('SET NULL')
    table.string('email', 255).notNullable()
    table.string('nom', 255).notNullable()
    table.string('prenom', 255).notNullable()
    table.string('statut', 30).defaultTo('pending')
    table.timestamp('signed_at').nullable()
    table.text('signature_url').nullable()
    table.unique(['signature_request_id', 'email'])
  })

  await knex.raw(`
    ALTER TABLE signature_signatories
      ADD CONSTRAINT signature_signatories_statut_check
      CHECK (statut IN ('pending', 'signed', 'refused', 'expired'))
  `)

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_signature_signatories_request_id
      ON signature_signatories (signature_request_id)
  `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('signature_signatories')
  await knex.schema.dropTableIfExists('signature_requests')
}
