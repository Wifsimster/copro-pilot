/**
 * Migration initiale — Schéma complet CoproPilot
 * Tables Better Auth (user, session, account, verification)
 * Tables métier : coproprietes, coproprietaires, lots, parties_communes,
 *   cles_repartition, lot_cles_repartition, locataires, mutations
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // ===========================================
    // BETTER-AUTH TABLES
    // ===========================================

    const userTableExists = await knex.schema.hasTable('user')
    if (!userTableExists) {
        await knex.schema.createTable('user', (table) => {
            table.string('id', 36).primary()
            table.string('name')
            table.string('email', 255).notNullable().unique()
            table.boolean('emailVerified').defaultTo(false).notNullable()
            table.text('image')
            table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable()
            table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable()

            table.boolean('isAdmin').defaultTo(false)
            table.string('azureId').unique()
            table.string('displayName')
            table.string('givenName')
            table.string('familyName')

            table.string('role').defaultTo('user').notNullable()
            table.boolean('banned').defaultTo(false).notNullable()
            table.string('banReason').nullable()
            table.timestamp('banExpires').nullable()

            table.index(['email'])
            table.index(['role'])
        })
    }

    const sessionTableExists = await knex.schema.hasTable('session')
    if (!sessionTableExists) {
        await knex.schema.createTable('session', (table) => {
            table.string('id', 36).primary()
            table.timestamp('expiresAt').notNullable()
            table.string('token', 255).notNullable().unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable()
            table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable()
            table.text('ipAddress')
            table.text('userAgent')
            table.string('userId', 36).notNullable()
            table.string('impersonatedBy', 36).nullable()

            table.foreign('userId').references('id').inTable('user').onDelete('CASCADE')
            table.index(['userId'])
            table.index(['token'])
        })
    }

    const accountTableExists = await knex.schema.hasTable('account')
    if (!accountTableExists) {
        await knex.schema.createTable('account', (table) => {
            table.string('id', 36).primary()
            table.string('accountId').notNullable()
            table.string('providerId').notNullable()
            table.string('userId', 36).notNullable()
            table.text('accessToken')
            table.text('refreshToken')
            table.timestamp('idTokenExpiresAt')
            table.timestamp('accessTokenExpiresAt')
            table.timestamp('refreshTokenExpiresAt')
            table.string('scope')
            table.string('password')
            table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable()
            table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable()

            table.foreign('userId').references('id').inTable('user').onDelete('CASCADE')
            table.index(['userId'])
            table.index(['providerId', 'accountId'])
        })
    }

    const verificationTableExists = await knex.schema.hasTable('verification')
    if (!verificationTableExists) {
        await knex.schema.createTable('verification', (table) => {
            table.string('id', 36).primary()
            table.string('identifier').notNullable()
            table.string('value').notNullable()
            table.timestamp('expiresAt').notNullable()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt').defaultTo(knex.fn.now())

            table.index(['identifier'])
        })
    }

    // ===========================================
    // MODULE 1 — GESTION DES COPROPRIÉTÉS
    // ===========================================

    await knex.schema.createTable('coproprietes', (table) => {
        table.increments('id').primary()
        table.string('nom', 255).notNullable()
        table.text('adresse').notNullable()
        table.string('code_postal', 10).notNullable()
        table.string('ville', 255).notNullable()
        table.date('date_creation').nullable()
        table.integer('nombre_lots').defaultTo(0)
        table.string('numero_immatriculation', 50).nullable() // Registre national des copropriétés
        table.string('reglement_copropriete_url', 500).nullable() // URL vers PDF
        table.text('notes').nullable()
        table.timestamps(true, true) // created_at, updated_at

        table.index(['nom'])
        table.index(['ville'])
    })

    // ===========================================
    // MODULE 2 — ANNUAIRE DES COPROPRIÉTAIRES
    // ===========================================

    await knex.schema.createTable('coproprietaires', (table) => {
        table.increments('id').primary()
        table.string('nom', 255).notNullable()
        table.string('prenom', 255).notNullable()
        table.string('email', 255).nullable()
        table.string('telephone', 20).nullable()
        table.text('adresse_correspondance').nullable()
        table.text('notes').nullable()
        table.timestamps(true, true)

        table.index(['nom', 'prenom'])
        table.index(['email'])
    })

    // ===========================================
    // LOTS
    // ===========================================

    await knex.schema.createTable('lots', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
        table.integer('coproprietaire_id').unsigned().nullable()
        table.string('numero', 50).notNullable()
        table.enum('type', ['appartement', 'cave', 'parking', 'commerce', 'bureau', 'autre']).notNullable().defaultTo('appartement')
        table.decimal('surface', 10, 2).nullable()
        table.integer('etage').nullable()
        table.integer('tantiemes').notNullable().defaultTo(0) // Quote-part en tantièmes
        table.text('description').nullable()
        table.timestamps(true, true)

        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.foreign('coproprietaire_id').references('id').inTable('coproprietaires').onDelete('SET NULL')

        table.index(['copropriete_id'])
        table.index(['coproprietaire_id'])
        table.unique(['copropriete_id', 'numero'])
    })

    // ===========================================
    // PARTIES COMMUNES
    // ===========================================

    await knex.schema.createTable('parties_communes', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
        table.string('nom', 255).notNullable()
        table.enum('categorie', ['generales', 'speciales']).notNullable().defaultTo('generales')
        table.text('description').nullable()
        table.timestamps(true, true)

        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.index(['copropriete_id'])
    })

    // ===========================================
    // CLÉS DE RÉPARTITION
    // ===========================================

    await knex.schema.createTable('cles_repartition', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
        table.string('nom', 255).notNullable() // ex: "Générale", "Ascenseur", "Chauffage"
        table.text('description').nullable()
        table.timestamps(true, true)

        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.index(['copropriete_id'])
        table.unique(['copropriete_id', 'nom'])
    })

    // Table de liaison : attribution des clés de répartition par lot
    await knex.schema.createTable('lot_cles_repartition', (table) => {
        table.increments('id').primary()
        table.integer('lot_id').unsigned().notNullable()
        table.integer('cle_repartition_id').unsigned().notNullable()
        table.integer('quote_part').notNullable().defaultTo(0) // Tantièmes pour cette clé
        table.timestamps(true, true)

        table.foreign('lot_id').references('id').inTable('lots').onDelete('CASCADE')
        table.foreign('cle_repartition_id').references('id').inTable('cles_repartition').onDelete('CASCADE')

        table.unique(['lot_id', 'cle_repartition_id'])
        table.index(['lot_id'])
        table.index(['cle_repartition_id'])
    })

    // ===========================================
    // LOCATAIRES
    // ===========================================

    await knex.schema.createTable('locataires', (table) => {
        table.increments('id').primary()
        table.integer('lot_id').unsigned().notNullable()
        table.string('nom', 255).notNullable()
        table.string('prenom', 255).notNullable()
        table.string('email', 255).nullable()
        table.string('telephone', 20).nullable()
        table.date('date_entree').nullable()
        table.date('date_sortie').nullable()
        table.timestamps(true, true)

        table.foreign('lot_id').references('id').inTable('lots').onDelete('CASCADE')
        table.index(['lot_id'])
        table.index(['nom', 'prenom'])
    })

    // ===========================================
    // MUTATIONS (historique changements de propriété)
    // ===========================================

    await knex.schema.createTable('mutations', (table) => {
        table.increments('id').primary()
        table.integer('lot_id').unsigned().notNullable()
        table.integer('ancien_proprietaire_id').unsigned().nullable()
        table.integer('nouveau_proprietaire_id').unsigned().nullable()
        table.date('date_mutation').notNullable()
        table.enum('type', ['vente', 'donation', 'succession', 'autre']).notNullable().defaultTo('vente')
        table.text('notes').nullable()
        table.timestamps(true, true)

        table.foreign('lot_id').references('id').inTable('lots').onDelete('CASCADE')
        table.foreign('ancien_proprietaire_id').references('id').inTable('coproprietaires').onDelete('SET NULL')
        table.foreign('nouveau_proprietaire_id').references('id').inTable('coproprietaires').onDelete('SET NULL')

        table.index(['lot_id'])
        table.index(['date_mutation'])
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists('mutations')
    await knex.schema.dropTableIfExists('locataires')
    await knex.schema.dropTableIfExists('lot_cles_repartition')
    await knex.schema.dropTableIfExists('cles_repartition')
    await knex.schema.dropTableIfExists('parties_communes')
    await knex.schema.dropTableIfExists('lots')
    await knex.schema.dropTableIfExists('coproprietaires')
    await knex.schema.dropTableIfExists('coproprietes')
    await knex.schema.dropTableIfExists('verification')
    await knex.schema.dropTableIfExists('account')
    await knex.schema.dropTableIfExists('session')
    await knex.schema.dropTableIfExists('user')
}
