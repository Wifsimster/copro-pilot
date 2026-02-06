/**
 * Migration — Modules 3, 4, 5
 * Module 3 : Comptabilité & Charges (budgets, appels de fonds, paiements, impayés, fonds de travaux)
 * Module 4 : Assemblées Générales (ag, resolutions, votes, presences, procurations)
 * Module 5 : Travaux & Incidents (incidents, interventions, carnet_entretien)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // ===========================================
    // MODULE 3 — COMPTABILITÉ & CHARGES
    // ===========================================

    await knex.schema.createTable('budgets_previsionnels', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
        table.integer('annee').notNullable()
        table.decimal('montant_total', 12, 2).notNullable().defaultTo(0)
        table.enum('statut', ['brouillon', 'vote', 'approuve']).notNullable().defaultTo('brouillon')
        table.date('date_vote').nullable()
        table.text('notes').nullable()
        table.timestamps(true, true)

        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.unique(['copropriete_id', 'annee'])
        table.index(['copropriete_id'])
    })

    await knex.schema.createTable('postes_depenses', (table) => {
        table.increments('id').primary()
        table.integer('budget_id').unsigned().notNullable()
        table.string('nom', 255).notNullable()
        table.string('categorie', 100).nullable() // entretien, assurance, personnel, etc.
        table.decimal('montant_prevu', 12, 2).notNullable().defaultTo(0)
        table.decimal('montant_reel', 12, 2).nullable()
        table.integer('cle_repartition_id').unsigned().nullable()
        table.timestamps(true, true)

        table.foreign('budget_id').references('id').inTable('budgets_previsionnels').onDelete('CASCADE')
        table.foreign('cle_repartition_id').references('id').inTable('cles_repartition').onDelete('SET NULL')
        table.index(['budget_id'])
    })

    await knex.schema.createTable('appels_fonds', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
        table.integer('budget_id').unsigned().nullable()
        table.integer('trimestre').notNullable() // 1-4
        table.integer('annee').notNullable()
        table.decimal('montant_total', 12, 2).notNullable()
        table.date('date_emission').notNullable()
        table.date('date_echeance').notNullable()
        table.enum('statut', ['brouillon', 'emis', 'cloture']).notNullable().defaultTo('brouillon')
        table.timestamps(true, true)

        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.foreign('budget_id').references('id').inTable('budgets_previsionnels').onDelete('SET NULL')
        table.index(['copropriete_id'])
        table.index(['annee', 'trimestre'])
    })

    await knex.schema.createTable('appels_fonds_lignes', (table) => {
        table.increments('id').primary()
        table.integer('appel_fonds_id').unsigned().notNullable()
        table.integer('lot_id').unsigned().notNullable()
        table.integer('coproprietaire_id').unsigned().nullable()
        table.decimal('montant', 12, 2).notNullable()
        table.timestamps(true, true)

        table.foreign('appel_fonds_id').references('id').inTable('appels_fonds').onDelete('CASCADE')
        table.foreign('lot_id').references('id').inTable('lots').onDelete('CASCADE')
        table.foreign('coproprietaire_id').references('id').inTable('coproprietaires').onDelete('SET NULL')
        table.index(['appel_fonds_id'])
        table.index(['coproprietaire_id'])
    })

    await knex.schema.createTable('paiements', (table) => {
        table.increments('id').primary()
        table.integer('coproprietaire_id').unsigned().notNullable()
        table.integer('appel_fonds_id').unsigned().nullable()
        table.decimal('montant', 12, 2).notNullable()
        table.date('date_paiement').notNullable()
        table.enum('mode', ['virement', 'cheque', 'prelevement', 'especes', 'autre']).notNullable().defaultTo('virement')
        table.string('reference', 100).nullable()
        table.text('notes').nullable()
        table.timestamps(true, true)

        table.foreign('coproprietaire_id').references('id').inTable('coproprietaires').onDelete('CASCADE')
        table.foreign('appel_fonds_id').references('id').inTable('appels_fonds').onDelete('SET NULL')
        table.index(['coproprietaire_id'])
        table.index(['appel_fonds_id'])
        table.index(['date_paiement'])
    })

    await knex.schema.createTable('fonds_travaux', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
        table.integer('annee').notNullable()
        table.decimal('cotisation_annuelle', 12, 2).notNullable().defaultTo(0) // 5% budget ou 2.5% PPT
        table.decimal('solde', 12, 2).notNullable().defaultTo(0)
        table.timestamps(true, true)

        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.unique(['copropriete_id', 'annee'])
    })

    // ===========================================
    // MODULE 4 — ASSEMBLÉES GÉNÉRALES
    // ===========================================

    await knex.schema.createTable('assemblees_generales', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
        table.date('date').notNullable()
        table.time('heure').nullable()
        table.string('lieu', 500).nullable()
        table.enum('type', ['ordinaire', 'extraordinaire']).notNullable().defaultTo('ordinaire')
        table.enum('statut', ['planifiee', 'convoquee', 'en_cours', 'terminee', 'annulee']).notNullable().defaultTo('planifiee')
        table.date('date_convocation').nullable()
        table.text('ordre_du_jour').nullable()
        table.text('pv_url').nullable()
        table.text('notes').nullable()
        table.timestamps(true, true)

        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.index(['copropriete_id'])
        table.index(['date'])
        table.index(['statut'])
    })

    await knex.schema.createTable('resolutions', (table) => {
        table.increments('id').primary()
        table.integer('ag_id').unsigned().notNullable()
        table.integer('numero').notNullable()
        table.string('titre', 500).notNullable()
        table.text('description').nullable()
        table.enum('majorite', ['article_24', 'article_25', 'article_26', 'unanimite']).notNullable().defaultTo('article_24')
        table.enum('resultat', ['adoptee', 'rejetee', 'ajournee']).nullable()
        table.integer('voix_pour').defaultTo(0)
        table.integer('voix_contre').defaultTo(0)
        table.integer('abstentions').defaultTo(0)
        table.timestamps(true, true)

        table.foreign('ag_id').references('id').inTable('assemblees_generales').onDelete('CASCADE')
        table.index(['ag_id'])
        table.unique(['ag_id', 'numero'])
    })

    await knex.schema.createTable('presences_ag', (table) => {
        table.increments('id').primary()
        table.integer('ag_id').unsigned().notNullable()
        table.integer('coproprietaire_id').unsigned().notNullable()
        table.enum('statut', ['present', 'absent', 'represente']).notNullable().defaultTo('absent')
        table.integer('represente_par_id').unsigned().nullable() // autre copropriétaire
        table.integer('tantiemes').notNullable().defaultTo(0) // tantièmes représentés
        table.timestamps(true, true)

        table.foreign('ag_id').references('id').inTable('assemblees_generales').onDelete('CASCADE')
        table.foreign('coproprietaire_id').references('id').inTable('coproprietaires').onDelete('CASCADE')
        table.foreign('represente_par_id').references('id').inTable('coproprietaires').onDelete('SET NULL')
        table.unique(['ag_id', 'coproprietaire_id'])
        table.index(['ag_id'])
    })

    // ===========================================
    // MODULE 5 — TRAVAUX & INCIDENTS
    // ===========================================

    await knex.schema.createTable('incidents', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
        table.integer('lot_id').unsigned().nullable()
        table.integer('signale_par_id').unsigned().nullable() // copropriétaire
        table.string('titre', 500).notNullable()
        table.text('description').nullable()
        table.string('categorie', 100).nullable() // plomberie, electricite, ascenseur, toiture, etc.
        table.enum('urgence', ['faible', 'moyenne', 'haute', 'critique']).notNullable().defaultTo('moyenne')
        table.enum('statut', ['ouvert', 'en_cours', 'resolu', 'ferme']).notNullable().defaultTo('ouvert')
        table.date('date_signalement').notNullable()
        table.date('date_resolution').nullable()
        table.text('notes').nullable()
        table.timestamps(true, true)

        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.foreign('lot_id').references('id').inTable('lots').onDelete('SET NULL')
        table.foreign('signale_par_id').references('id').inTable('coproprietaires').onDelete('SET NULL')
        table.index(['copropriete_id'])
        table.index(['statut'])
        table.index(['urgence'])
    })

    await knex.schema.createTable('interventions', (table) => {
        table.increments('id').primary()
        table.integer('incident_id').unsigned().nullable()
        table.integer('copropriete_id').unsigned().notNullable()
        table.string('prestataire', 255).nullable()
        table.text('description').nullable()
        table.decimal('montant_devis', 12, 2).nullable()
        table.decimal('montant_facture', 12, 2).nullable()
        table.date('date_prevue').nullable()
        table.date('date_realisation').nullable()
        table.enum('statut', ['en_attente', 'planifiee', 'en_cours', 'terminee', 'annulee']).notNullable().defaultTo('en_attente')
        table.text('notes').nullable()
        table.timestamps(true, true)

        table.foreign('incident_id').references('id').inTable('incidents').onDelete('SET NULL')
        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.index(['copropriete_id'])
        table.index(['incident_id'])
        table.index(['statut'])
    })

    await knex.schema.createTable('carnet_entretien', (table) => {
        table.increments('id').primary()
        table.integer('copropriete_id').unsigned().notNullable()
        table.string('titre', 500).notNullable()
        table.text('description').nullable()
        table.string('prestataire', 255).nullable()
        table.decimal('montant', 12, 2).nullable()
        table.date('date_realisation').notNullable()
        table.string('categorie', 100).nullable()
        table.integer('intervention_id').unsigned().nullable()
        table.timestamps(true, true)

        table.foreign('copropriete_id').references('id').inTable('coproprietes').onDelete('CASCADE')
        table.foreign('intervention_id').references('id').inTable('interventions').onDelete('SET NULL')
        table.index(['copropriete_id'])
        table.index(['date_realisation'])
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists('carnet_entretien')
    await knex.schema.dropTableIfExists('interventions')
    await knex.schema.dropTableIfExists('incidents')
    await knex.schema.dropTableIfExists('presences_ag')
    await knex.schema.dropTableIfExists('resolutions')
    await knex.schema.dropTableIfExists('assemblees_generales')
    await knex.schema.dropTableIfExists('fonds_travaux')
    await knex.schema.dropTableIfExists('paiements')
    await knex.schema.dropTableIfExists('appels_fonds_lignes')
    await knex.schema.dropTableIfExists('appels_fonds')
    await knex.schema.dropTableIfExists('postes_depenses')
    await knex.schema.dropTableIfExists('budgets_previsionnels')
}
