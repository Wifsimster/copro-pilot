import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requireStaff } from '../middleware/authorization.js'
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
// Comptabilité réglementaire (loi ALUR)
import comptabiliteReglementaireRoutes from './comptabilite-reglementaire.js'
// Comptes bancaires
import comptesBancairesRoutes from './comptes-bancaires.js'
import mouvementsBancairesRoutes from './mouvements-bancaires.js'
// Module 4 — Assemblées Générales
import assembleesRoutes from './assemblees.js'
import convocationsRoutes from './convocations.js'
// Module 5 — Travaux & Incidents
import incidentsRoutes from './incidents.js'
import interventionsRoutes from './interventions.js'
import carnetEntretienRoutes from './carnet-entretien.js'
// Module 6 — Documents
import documentsRoutes from './documents.js'
// Diagnostics techniques
import diagnosticsRoutes from './diagnostics.js'
// Conseil Syndical
import conseilSyndicalRoutes from './conseil-syndical.js'
// Assurances & Sinistres
import assurancesRoutes from './assurances.js'
import sinistresRoutes from './sinistres.js'
// Contentieux & Recouvrement
import relancesRoutes from './relances.js'
import proceduresRoutes from './procedures.js'
// Contrats & Prestataires
import prestatairesRoutes from './prestataires.js'
import contratsRoutes from './contrats.js'
// Employes du syndicat
import employesSyndicatRoutes from './employes-syndicat.js'
// Règlement de copropriété
import reglementsCoproprieteRoutes from './reglements-copropriete.js'
// Immatriculation / Registre national
import declarationsRegistreRoutes from './declarations-registre.js'
// Contrat de syndic & Mise en concurrence
import contratsSyndicRoutes from './contrats-syndic.js'
import propositionsSyndicRoutes from './propositions-syndic.js'
// Notifications
import notificationsRoutes from './notifications.js'
// Extranet copropriétaires
import extranetRoutes from './extranet.js'
// Exports (PDF & Excel)
import exportsRoutes from './exports.js'
// Stats
import statsRoutes from './stats.js'
// Analytics (funnel — staff only)
import analyticsRoutes from './analytics.js'
// Reprise de gestion (import balance)
import repriseGestionRoutes from './reprise-gestion.js'
// Comptabilité de trésorerie simplifiée
import comptaTresorerieRoutes from './compta-tresorerie.js'
// Régularisation des charges (clôture)
import regularisationsRoutes from './regularisations.js'
// Cycle annuel (workflow)
import cycleAnnuelRoutes from './cycle-annuel.js'
// Global search
import searchRoutes from './search.js'
// GDPR
import gdprRoutes from './gdpr.js'
// User management (syndic + admin)
import userManagementRoutes from './user-management.js'
// Timeline (domain events)
import timelineRoutes from './timeline.js'
// SSE (Server-Sent Events)
import sseRoutes from './sse.js'
// Stripe (subscriptions & billing)
import stripeRoutes from './stripe.js'
// Tickets (messagerie)
import ticketsRoutes from './tickets.js'
// AG Reports (annexes financières)
import agReportsRoutes from './ag-reports.js'
// Audit log (tamper-proof hash chain verification)
import auditRoutes from './audit.js'
// Vote électronique & procurations (AG)
import votesRoutes from './votes.js'
import procurationsRoutes from './procurations.js'
// Signatures électroniques (Yousign)
import signaturesRoutes from './signatures.js'
// Real User Monitoring of Core Web Vitals
import webVitalsRoutes from './web-vitals.js'

const router = Router()

// Management routes are reserved to syndic staff. Copropriétaires reach
// their own data through /extranet, /votes, /procurations, /gdpr and
// /notifications, which enforce per-owner checks.
const staffOnly = [requireAuth(), requireStaff]

// API routes — Module 1 & 2
router.use('/health', healthRoutes)
router.use('/coproprietes', staffOnly, coproprietesRoutes)
router.use('/coproprietaires', staffOnly, coproprietairesRoutes)
router.use('/lots', staffOnly, lotsRoutes)
router.use('/parties-communes', staffOnly, partiesCommunesRoutes)
router.use('/cles-repartition', staffOnly, clesRepartitionRoutes)
router.use('/locataires', staffOnly, locatairesRoutes)
router.use('/mutations', staffOnly, mutationsRoutes)

// Module 3 — Comptabilité & Charges
router.use('/budgets', staffOnly, budgetsRoutes)
router.use('/appels-fonds', staffOnly, appelsFondsRoutes)
router.use('/paiements', staffOnly, paiementsRoutes)
router.use('/fonds-travaux', staffOnly, fondsTravauxRoutes)

// Comptabilité réglementaire (loi ALUR)
router.use('/comptabilite', staffOnly, comptabiliteReglementaireRoutes)

// Comptes bancaires
router.use('/comptes-bancaires', staffOnly, comptesBancairesRoutes)
router.use('/mouvements-bancaires', staffOnly, mouvementsBancairesRoutes)

// Module 4 — Assemblées Générales
router.use('/assemblees', staffOnly, assembleesRoutes)
router.use('/convocations', staffOnly, convocationsRoutes)

// Module 5 — Travaux & Incidents
router.use('/incidents', staffOnly, incidentsRoutes)
router.use('/interventions', staffOnly, interventionsRoutes)
router.use('/carnet-entretien', staffOnly, carnetEntretienRoutes)

// Module 6 — Documents
router.use('/documents', staffOnly, documentsRoutes)

// Diagnostics techniques
router.use('/diagnostics', staffOnly, diagnosticsRoutes)

// Conseil Syndical
router.use('/conseil-syndical', staffOnly, conseilSyndicalRoutes)

// Assurances & Sinistres
router.use('/assurances', staffOnly, assurancesRoutes)
router.use('/sinistres', staffOnly, sinistresRoutes)

// Contentieux & Recouvrement
router.use('/relances', staffOnly, relancesRoutes)
router.use('/procedures', staffOnly, proceduresRoutes)

// Contrats & Prestataires
router.use('/prestataires', staffOnly, prestatairesRoutes)
router.use('/contrats', staffOnly, contratsRoutes)

// Employes du syndicat
router.use('/employes-syndicat', staffOnly, employesSyndicatRoutes)

// Règlement de copropriété
router.use('/reglements-copropriete', staffOnly, reglementsCoproprieteRoutes)

// Immatriculation / Registre national
router.use('/declarations-registre', staffOnly, declarationsRegistreRoutes)

// Contrat de syndic & Mise en concurrence
router.use('/contrats-syndic', staffOnly, contratsSyndicRoutes)
router.use('/propositions-syndic', staffOnly, propositionsSyndicRoutes)

// Notifications
router.use('/notifications', notificationsRoutes)

// Extranet copropriétaires
router.use('/extranet', extranetRoutes)

// Exports (PDF & Excel)
router.use('/exports', staffOnly, exportsRoutes)

// Stats
router.use('/stats', staffOnly, statsRoutes)

// Analytics (funnel — staff only)
router.use('/analytics', staffOnly, analyticsRoutes)

// Reprise de gestion (import balance)
router.use('/reprise-gestion', staffOnly, repriseGestionRoutes)

// Comptabilité de trésorerie simplifiée
router.use('/compta-tresorerie', staffOnly, comptaTresorerieRoutes)

// Régularisation des charges (clôture)
router.use('/regularisations', staffOnly, regularisationsRoutes)

// Cycle annuel (workflow)
router.use('/cycle-annuel', staffOnly, cycleAnnuelRoutes)

// Global search
router.use('/search', searchRoutes)

// GDPR
router.use('/gdpr', gdprRoutes)

// User management
router.use('/user-management', userManagementRoutes)

// Timeline (domain events)
router.use('/timeline', staffOnly, timelineRoutes)

// SSE (Server-Sent Events)
router.use('/sse', sseRoutes)

// Stripe (subscriptions & billing)
router.use('/stripe', stripeRoutes)

// Tickets (messagerie)
router.use('/tickets', staffOnly, ticketsRoutes)

// AG Reports (annexes financières décret 2005-240)
router.use('/ag-reports', staffOnly, agReportsRoutes)

// Audit log (tamper-proof hash chain verification)
router.use('/audit', auditRoutes)

// Vote électronique & procurations (AG)
router.use('/votes', votesRoutes)
router.use('/procurations', procurationsRoutes)

// Signatures électroniques (Yousign)
router.use('/signatures', signaturesRoutes)

// Real User Monitoring of Core Web Vitals (anonymous, no CSRF)
router.use('/web-vitals', webVitalsRoutes)

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
