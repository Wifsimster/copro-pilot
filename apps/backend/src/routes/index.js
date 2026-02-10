import { Router } from 'express'
import healthRoutes from './health.js'
import coproprietesRoutes from './coproprietes.js'
import coproprietairesRoutes from './coproprietaires.js'
import lotsRoutes from './lots.js'
import partiesCommunesRoutes from './parties-communes.js'
import clesRepartitionRoutes from './cles-repartition.js'
import locatairesRoutes from './locataires.js'
import mutationsRoutes from './mutations.js'
// Module 3 — Comptabilité & Charges
import budgetsRoutes from './budgets.js'
import appelsFondsRoutes from './appels-fonds.js'
import paiementsRoutes from './paiements.js'
import fondsTravauxRoutes from './fonds-travaux.js'
// Comptes bancaires
import comptesBancairesRoutes from './comptes-bancaires.js'
import mouvementsBancairesRoutes from './mouvements-bancaires.js'
// Module 4 — Assemblées Générales
import assembleesRoutes from './assemblees.js'
// Module 5 — Travaux & Incidents
import incidentsRoutes from './incidents.js'
import interventionsRoutes from './interventions.js'
import carnetEntretienRoutes from './carnet-entretien.js'
// Module 6 — Documents
import documentsRoutes from './documents.js'
// Diagnostics techniques
import diagnosticsRoutes from './diagnostics.js'
// Contrats & Prestataires
import prestatairesRoutes from './prestataires.js'
import contratsRoutes from './contrats.js'
// Stats
import statsRoutes from './stats.js'

const router = Router()

// API routes — Module 1 & 2
router.use('/health', healthRoutes)
router.use('/coproprietes', coproprietesRoutes)
router.use('/coproprietaires', coproprietairesRoutes)
router.use('/lots', lotsRoutes)
router.use('/parties-communes', partiesCommunesRoutes)
router.use('/cles-repartition', clesRepartitionRoutes)
router.use('/locataires', locatairesRoutes)
router.use('/mutations', mutationsRoutes)

// Module 3 — Comptabilité & Charges
router.use('/budgets', budgetsRoutes)
router.use('/appels-fonds', appelsFondsRoutes)
router.use('/paiements', paiementsRoutes)
router.use('/fonds-travaux', fondsTravauxRoutes)

// Comptes bancaires
router.use('/comptes-bancaires', comptesBancairesRoutes)
router.use('/mouvements-bancaires', mouvementsBancairesRoutes)

// Module 4 — Assemblées Générales
router.use('/assemblees', assembleesRoutes)

// Module 5 — Travaux & Incidents
router.use('/incidents', incidentsRoutes)
router.use('/interventions', interventionsRoutes)
router.use('/carnet-entretien', carnetEntretienRoutes)

// Module 6 — Documents
router.use('/documents', documentsRoutes)

// Diagnostics techniques
router.use('/diagnostics', diagnosticsRoutes)

// Contrats & Prestataires
router.use('/prestataires', prestatairesRoutes)
router.use('/contrats', contratsRoutes)

// Stats
router.use('/stats', statsRoutes)

// Root health check
router.get('/', (req, res) => {
    res.json({
        service: 'CoproPilot Backend',
        version: '0.1.0',
        status: 'running',
        timestamp: new Date().toISOString()
    })
})

export default router
