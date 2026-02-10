import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class DeclarationRegistreModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('declarations_registre')
            .where('copropriete_id', coproprieteId)
            .orderBy('annee', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('declarations_registre').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('declarations_registre')
            .insert({
                copropriete_id: data.copropriete_id,
                annee: data.annee,
                date_declaration: data.date_declaration || null,
                donnees_declarees: data.donnees_declarees ? JSON.stringify(data.donnees_declarees) : null,
                statut: data.statut || 'brouillon',
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const updateData = { ...data, updated_at: db.fn.now() }
        if (updateData.donnees_declarees && typeof updateData.donnees_declarees === 'object') {
            updateData.donnees_declarees = JSON.stringify(updateData.donnees_declarees)
        }
        const [result] = await db('declarations_registre')
            .where('id', id)
            .update(updateData)
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('declarations_registre').where('id', id).del()
    }

    static async preparerDonnees(coproprieteId, annee) {
        const db = getDb()

        const [
            copropriete,
            lotsStats,
            lotsByType,
            coproprietairesCount,
            budget,
            appelsFonds,
            fondsTravaux,
            employes,
            contratSyndic,
            derniereAG,
            impayesTotal,
            proceduresActives,
            diagnostics,
        ] = await Promise.all([
            // Copropriete info
            db('coproprietes').where('id', coproprieteId).first(),

            // Lots stats
            db('lots')
                .where('copropriete_id', coproprieteId)
                .select(
                    db.raw('count(*) as total'),
                    db.raw('sum(tantiemes) as total_tantiemes')
                )
                .first(),

            // Lots by type
            db('lots')
                .where('copropriete_id', coproprieteId)
                .select('type')
                .count('* as count')
                .groupBy('type'),

            // Distinct coproprietaires
            db('lots')
                .where('copropriete_id', coproprieteId)
                .whereNotNull('coproprietaire_id')
                .countDistinct('coproprietaire_id as count')
                .first(),

            // Budget for the year
            db('budgets_previsionnels')
                .where('copropriete_id', coproprieteId)
                .where('annee', annee)
                .first(),

            // Appels de fonds for the year
            db('appels_fonds')
                .where('copropriete_id', coproprieteId)
                .where('annee', annee)
                .select(
                    db.raw('count(*) as nombre'),
                    db.raw('sum(montant_total) as montant_total')
                )
                .first(),

            // Fonds travaux for the year
            db('fonds_travaux')
                .where('copropriete_id', coproprieteId)
                .where('annee', annee)
                .first(),

            // Employes actifs
            db('employes_syndicat')
                .where('copropriete_id', coproprieteId)
                .where('statut', 'actif'),

            // Active syndic contract
            db('contrats_syndic')
                .where('copropriete_id', coproprieteId)
                .where('statut', 'en_cours')
                .first(),

            // Last completed AG
            db('assemblees_generales')
                .where('copropriete_id', coproprieteId)
                .where('statut', 'terminee')
                .orderBy('date', 'desc')
                .first(),

            // Impayes (emitted appels not paid)
            db('appels_fonds')
                .where('copropriete_id', coproprieteId)
                .where('statut', 'emis')
                .sum('montant_total as total')
                .first(),

            // Active legal procedures
            db('procedures')
                .where('copropriete_id', coproprieteId)
                .whereIn('statut', ['en_preparation', 'en_cours', 'audience_fixee'])
                .select(
                    db.raw('count(*) as nombre'),
                    db.raw('sum(montant_reclame) as montant_total')
                )
                .first(),

            // Diagnostics
            db('diagnostics')
                .where('copropriete_id', coproprieteId)
                .select('type', 'statut', 'date_realisation', 'date_validite')
                .orderBy('type', 'asc'),
        ])

        if (!copropriete) return null

        return {
            identification: {
                nom: copropriete.nom,
                adresse: copropriete.adresse,
                code_postal: copropriete.code_postal,
                ville: copropriete.ville,
                numero_immatriculation: copropriete.numero_immatriculation,
                date_creation: copropriete.date_creation,
                nombre_batiments: copropriete.nombre_batiments || 0,
                nombre_ascenseurs: copropriete.nombre_ascenseurs || 0,
                periode_construction: copropriete.periode_construction,
                type_chauffage: copropriete.type_chauffage,
                energie_chauffage: copropriete.energie_chauffage,
            },
            gouvernance: contratSyndic
                ? {
                    syndic_nom: contratSyndic.syndic_nom,
                    contrat_date_debut: contratSyndic.date_debut,
                    contrat_date_fin: contratSyndic.date_fin,
                    remuneration_forfait: contratSyndic.remuneration_forfait ? Number(contratSyndic.remuneration_forfait) : null,
                    contrat_statut: contratSyndic.statut,
                }
                : null,
            lots: {
                total: Number(lotsStats?.total || 0),
                total_tantiemes: Number(lotsStats?.total_tantiemes || 0),
                par_type: lotsByType.map(l => ({ type: l.type, count: Number(l.count) })),
                nombre_coproprietaires: Number(coproprietairesCount?.count || 0),
            },
            finances: {
                budget_annee: annee,
                budget_montant: budget ? Number(budget.montant_total || 0) : null,
                budget_statut: budget?.statut || null,
                appels_fonds_nombre: Number(appelsFonds?.nombre || 0),
                appels_fonds_montant: Number(appelsFonds?.montant_total || 0),
                fonds_travaux_cotisation: fondsTravaux ? Number(fondsTravaux.cotisation_annuelle || 0) : null,
                fonds_travaux_solde: fondsTravaux ? Number(fondsTravaux.solde || 0) : null,
                total_impayes: Number(impayesTotal?.total || 0),
            },
            assemblee_generale: derniereAG
                ? {
                    derniere_ag_date: derniereAG.date,
                    derniere_ag_type: derniereAG.type,
                }
                : null,
            procedures: {
                nombre_actives: Number(proceduresActives?.nombre || 0),
                montant_total_reclame: Number(proceduresActives?.montant_total || 0),
            },
            diagnostics: diagnostics.map(d => ({
                type: d.type,
                statut: d.statut,
                date_realisation: d.date_realisation,
                date_validite: d.date_validite,
            })),
            personnel: {
                nombre_employes: employes.length,
                employes: employes.map(e => ({
                    nom: e.nom,
                    prenom: e.prenom,
                    poste: e.poste,
                    type_contrat: e.type_contrat,
                })),
            },
        }
    }
}
