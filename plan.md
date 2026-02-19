# Plan: Workflow Optimization for Copropriété Lifecycle Management

## Analysis

CoproPilot has all the modules needed for copropriété management, but they operate in **silos** — each module is CRUD-only with no cross-module automation. The annual copropriété lifecycle requires many manual steps that could be automated. Key gaps:

- `node-cron` is installed but **unused** — no scheduled tasks exist
- No event-driven workflows (creating an incident doesn't notify anyone)
- No automatic relances for unpaid charges
- No expiration alerts (contracts, insurance, diagnostics)
- No AG preparation workflow automation
- No budget → appels de fonds automatic generation
- No annual compliance checklist tracking

## Implementation Plan

### Step 1: Backend — Workflow Scheduler Service

Create `apps/backend/src/services/WorkflowSchedulerService.js` — a cron-based scheduler that activates the node-cron dependency already installed. Daily jobs:

| Job | Schedule | Logic |
|-----|----------|-------|
| **Unpaid charges reminders** | Daily 8:00 | Query coproprietaires with `solde > 0` for >30 days → create notification |
| **Contract expiration alerts** | Daily 8:00 | Contracts expiring within 90/60/30 days → create notification |
| **Insurance expiration alerts** | Daily 8:00 | Assurances expiring within 90/60/30 days → create notification |
| **Diagnostic expiration alerts** | Daily 8:00 | Diagnostics expiring within 90/30 days → create notification |
| **AG preparation reminders** | Daily 8:00 | AGs within 30 days without convocations → alert; Convocations not sent with <21 days left → urgent alert |
| **Syndic contract renewal** | Daily 8:00 | Contrats syndic expiring within 6/3 months → alert to prepare competitive bidding |

### Step 2: Backend — Event-Driven Workflow Service

Create `apps/backend/src/services/WorkflowEventService.js` — hooks into existing controllers to trigger cross-module actions:

| Trigger Event | Automated Actions |
|---------------|-------------------|
| **Incident created** | → Create notification for all syndic users of that copropriété |
| **Paiement recorded** | → Create notification for the copropriétaire confirming receipt; → Auto-check if all charges are now paid |
| **AG status → terminee** | → Create notifications for all copropriétaires; → Log in carnet d'entretien if works were voted |
| **Budget voted (AG resolution)** | → Generate 4 quarterly appels de fonds with per-copropriétaire line items |
| **Relance escalation** | → When relance amiable goes unpaid for 30 days, auto-suggest mise_en_demeure |
| **Intervention completed** | → Auto-create carnet d'entretien entry; → Create notification |
| **Sinistre created** | → Link to incident if applicable; → Create notification |

### Step 3: Backend — Annual Cycle Tracking Service

Create `apps/backend/src/services/CycleAnnuelService.js` + migration for tracking table. Tracks mandatory annual tasks per copropriété:

**Annual compliance checklist items:**
1. Budget prévisionnel voté en AG
2. Appels de fonds trimestriels émis (T1, T2, T3, T4)
3. AG ordinaire tenue
4. Comptes approuvés en AG
5. Exercice comptable clôturé
6. Déclaration registre effectuée
7. Contrat syndic en cours de validité
8. Assurance multirisque à jour
9. Diagnostics obligatoires à jour (DPE, amiante, plomb)
10. Fonds travaux cotisations appelées (loi ALUR)

Each item has status: `pending`, `in_progress`, `completed`, `overdue`.

### Step 4: Backend — Route, Controller & Model for Annual Cycle

- Migration: `create_cycle_annuel` table (copropriete_id, annee, tache_code, statut, date_echeance, date_completion, notes)
- Model: `CycleAnnuel.js`
- Service: integrated with `CycleAnnuelService.js`
- Controller: `CycleAnnuelController.js`
- Route: `cycle-annuel.js` → registered in `routes/index.js`

### Step 5: Backend — Budget to Appels de Fonds Auto-Generation

Add a method in `AppelFondsService.js` to generate 4 quarterly appels from a voted budget:
- Split budget total by 4 quarters
- For each quarter, create appels_fonds_lignes using lot tantièmes distribution
- Associate with the relevant clé de répartition

### Step 6: Frontend — Annual Cycle Dashboard Component

Create `apps/frontend/src/components/coproprietes/CycleAnnuelCard.tsx`:
- Visual progress bar showing % of annual tasks completed
- Checklist with color-coded status (green/yellow/red)
- Displayed on `CoproprieteDetailPage`

### Step 7: Frontend — Types, API, Hook for Annual Cycle

- Types in `types/index.ts`: `CycleAnnuel`, `TacheAnnuelle`
- API in `api/cycle-annuel.ts`
- Hook in `hooks/useCycleAnnuel.ts`

### Step 8: Frontend — Workflow Notifications Enhancement

Update the dashboard to show workflow-generated notifications with action links:
- "Contrat X expire dans 30 jours" → link to contrat page
- "3 copropriétaires impayés" → link to charges page
- "AG dans 25 jours, convocations non envoyées" → link to AG detail

### Step 9: Backend — Initialize Scheduler on Server Start

Wire `WorkflowSchedulerService` into `apps/backend/src/index.js` to start cron jobs on server boot, with graceful shutdown to stop them.

### Step 10: Tests

- Add unit tests for `WorkflowSchedulerService` (mock cron, verify notification creation)
- Add unit tests for `WorkflowEventService` (verify cross-module triggers)
- Add unit tests for `CycleAnnuelService`
- Run existing smoke tests to verify no regression

## File Changes Summary

### New files:
- `apps/backend/migrations/YYYYMMDD_create_cycle_annuel.js`
- `apps/backend/src/models/CycleAnnuel.js`
- `apps/backend/src/services/CycleAnnuelService.js`
- `apps/backend/src/services/WorkflowSchedulerService.js`
- `apps/backend/src/services/WorkflowEventService.js`
- `apps/backend/src/controllers/CycleAnnuelController.js`
- `apps/backend/src/routes/cycle-annuel.js`
- `apps/frontend/src/api/cycle-annuel.ts`
- `apps/frontend/src/hooks/useCycleAnnuel.ts`
- `apps/frontend/src/components/coproprietes/CycleAnnuelCard.tsx`
- `apps/frontend/src/components/coproprietes/CycleAnnuelChecklist.tsx`

### Modified files:
- `apps/backend/src/routes/index.js` — register cycle-annuel route
- `apps/backend/src/index.js` — initialize scheduler
- `apps/backend/src/services/AppelFondsService.js` — add auto-generation from budget
- `apps/backend/src/controllers/IncidentController.js` — add event trigger
- `apps/backend/src/controllers/PaiementController.js` — add event trigger
- `apps/backend/src/controllers/InterventionController.js` — add event trigger
- `apps/backend/src/controllers/AssembleeGeneraleController.js` — add event trigger
- `apps/frontend/src/types/index.ts` — add CycleAnnuel types
- `apps/frontend/src/pages/CoproprieteDetailPage.tsx` — add CycleAnnuelCard
- `apps/frontend/src/pages/DashboardPage.tsx` — add compliance summary widget
