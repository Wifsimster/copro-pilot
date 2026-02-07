import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

const router = Router()

router.get('/dashboard', requireAuth(), async (req, res) => {
    try {
        const db = knexDatabase.getKnex()

        const [coproprietes, coproprietaires, incidentsOuverts, prochainAG, lots, locataires, budgets, impayesResult, fondsTravaux] = await Promise.all([
            db('coproprietes').count('id as count').first(),
            db('coproprietaires').count('id as count').first(),
            db('incidents').whereIn('statut', ['ouvert', 'en_cours']).count('id as count').first(),
            db('assemblees_generales')
                .where('date', '>=', db.fn.now())
                .whereIn('statut', ['planifiee', 'convoquee'])
                .count('id as count')
                .first(),
            db('lots').count('id as count').first(),
            db('locataires').count('id as count').first(),
            db('budgets_previsionnels').count('id as count').first(),
            db('appels_fonds')
                .where('statut', 'emis')
                .sum('montant_total as total')
                .first(),
            db('fonds_travaux')
                .sum('solde as total')
                .first(),
        ])

        const recentIncidents = await db('incidents')
            .select('incidents.id', 'incidents.copropriete_id', 'incidents.titre', 'incidents.urgence', 'incidents.statut', 'incidents.date_signalement', 'coproprietes.nom as copropriete_nom')
            .leftJoin('coproprietes', 'incidents.copropriete_id', 'coproprietes.id')
            .whereIn('incidents.statut', ['ouvert', 'en_cours'])
            .orderBy('incidents.date_signalement', 'desc')
            .limit(5)

        const prochainAGs = await db('assemblees_generales')
            .select('assemblees_generales.id', 'assemblees_generales.date', 'assemblees_generales.heure', 'assemblees_generales.type', 'assemblees_generales.statut', 'coproprietes.nom as copropriete_nom')
            .leftJoin('coproprietes', 'assemblees_generales.copropriete_id', 'coproprietes.id')
            .where('assemblees_generales.date', '>=', db.fn.now())
            .whereIn('assemblees_generales.statut', ['planifiee', 'convoquee'])
            .orderBy('assemblees_generales.date', 'asc')
            .limit(5)

        res.json({
            data: {
                counts: {
                    coproprietes: Number(coproprietes.count),
                    coproprietaires: Number(coproprietaires.count),
                    incidents_ouverts: Number(incidentsOuverts.count),
                    prochaines_ag: Number(prochainAG.count),
                    lots: Number(lots.count),
                    locataires: Number(locataires.count),
                    budgets: Number(budgets.count),
                    impayes: Number(impayesResult?.total || 0),
                    fonds_travaux: Number(fondsTravaux?.total || 0),
                },
                recent_incidents: recentIncidents,
                prochaines_ag: prochainAGs,
            },
        })
    } catch (error) {
        logger.error(`[Stats] Error fetching dashboard stats: ${error.message}`)
        res.status(500).json({ error: 'Impossible de récupérer les statistiques' })
    }
})

export default router
