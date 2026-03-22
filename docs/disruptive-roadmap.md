# Roadmap disruptif CoproPilot — Analyse Fast Meeting

> Date : 2026-03-21
> Participants : Sprint Zero Sarah (PO), Pixel-Perfect Hugo (Frontend), Whiteboard Damien (Architecte), Dashboard Estelle (BI Finance)
> Methode : Fast Meeting avec 4 personas en parallele, synthese facilitateur

---

## Vision

Passer de **"CRUD moderne pour syndics"** a **"plateforme workflow-driven avec intelligence financiere"**.

CoproPilot a deja 58 routes API, 30 pages, 80+ types TypeScript. La couverture fonctionnelle depasse POWIMO sur plusieurs axes (extranet, contentieux, convocations legales, diagnostics). Le probleme n'est pas le manque de features — c'est que chaque module est un tableau CRUD avec des form dialogs. Il manque :
1. Des workflows structures qui guident le syndic
2. De la vitesse d'interaction (trop de clics, trop de navigations)
3. De l'intelligence sur les donnees existantes

---

## Pilier 1 — Fondations architecturales event-driven

### 1.1 Domain Event Log + EventBus in-process

**Probleme actuel :** Le `WorkflowEventService` est appele manuellement depuis les controllers. Pas de bus d'evenements, pas de chaine de reactions, pas d'historique metier.

**Solution :**

Migration `domain_events` :
```
id | aggregate_type | aggregate_id | event_type | payload (jsonb) | copropriete_id | user_id | created_at
```

`EventBus.js` : wrapper autour de Node `EventEmitter` avec :
- `emit(eventType, payload)` — persiste dans `domain_events` + dispatch aux handlers
- `on(eventType, handler)` — enregistre un handler
- Execution synchrone apres commit de la transaction Knex

**Impact :** Chaque service qui mute un etat emet un evenement. Nouveaux side effects = nouveau handler, zero modification du code existant. Audit trail gratuit. Timeline par entite gratuite (query sur `domain_events WHERE aggregate_type + aggregate_id`).

**Effort :** 1 migration + 1 service EventBus + refactoring de 5 services critiques (Incident, Intervention, AG, Paiement, Sinistre).

### 1.2 Workflow Engine (state machine declarative)

**Probleme actuel :** Les transitions de statut sont des `UPDATE SET status = ?` sans validation, sans guards, sans effets. Le `IncidentService.update()` accepte n'importe quel statut.

**Solution :**

`WorkflowEngine.js` avec configuration declarative :
```js
{
  entity: 'incident',
  states: ['ouvert', 'en_cours', 'resolu', 'ferme'],
  transitions: [
    { from: 'ouvert', to: 'en_cours', action: 'assign', guards: ['hasPrestataire'], effects: ['notifySyndics', 'createIntervention'] },
    { from: 'en_cours', to: 'resolu', action: 'resolve', effects: ['notifySignaleur', 'updateCarnetEntretien'] },
    { from: 'resolu', to: 'ferme', action: 'close', effects: ['emitDomainEvent'] }
  ]
}
```

**Regle critique :** Chaque state machine supporte un `override` pour le role syndic (bypass des guards, mais l'evenement est quand meme emis). Guide, pas cage.

**Appliquer en priorite a :** Incident, AG (planifiee→convoquee→en_cours→terminee), Contentieux (relance→procedure).

### 1.3 Server-Sent Events (SSE) pour notifications temps reel

**Probleme actuel :** Le `NotificationBell` ne sait pas qu'il y a de nouvelles notifications sans refresh ou polling.

**Solution :**

Endpoint SSE : `GET /api/events/stream` — 50 lignes de middleware. Quand l'EventBus fire, push aux clients connectes. Le frontend souscrit une fois au login via un hook `useEventStream` qui trigger `queryClient.invalidateQueries()`.

**Pourquoi SSE et pas WebSocket :** Unidirectionnel (serveur → client), passe a travers le proxy Vite existant, zero dependance, fallback gracieux.

---

## Pilier 2 — Vitesse d'interaction UX

### 2.1 Inline Table Editing (tuer le round-trip dialog)

**Probleme actuel :** Changer le telephone d'un coproprietaire = clic edit → attente dialog → modifier → submit → attente fermeture. 4-5 interactions pour 1 champ.

**Solution :**

Composant `EditableCell` wrappant shadcn `Input`/`Select` :
- Activation : double-clic ou Enter
- Submit : blur ou Enter
- Mutation optimiste via React Query
- Validation inline via Zod
- Feedback visuel : checkmark succes ou shake erreur

**Deployer en priorite sur :** CoproprietairesPage (telephone, email), TravauxPage (statut incident, urgence), ChargesPage (statut paiement).

**Conserver les form dialogs uniquement pour la creation** (multiples champs vides a remplir).

### 2.2 Command Palette avec Actions (pas juste navigation)

**Probleme actuel :** Le `GlobalSearch` ne fait que chercher et naviguer. C'est une barre de recherche, pas un command palette.

**Solution :**

Ajouter un `CommandGroup` "Actions" dans le `CommandDialog` :
- "Signaler un incident" → ouvre le form pre-rempli avec la copropriete selectionnee
- "Changer statut incident X" → changement inline
- "Basculer copropriete [nom]" → switch le selector
- "Exporter [entite] en CSV" → trigger export
- "Aller a AG du [date]" → deep link

**Modele :** Superhuman, Linear — `Cmd+K` comme interface principale pour les power users.

### 2.3 Raccourcis clavier

**Solution :**

Hook `useHotkeys` (ou `react-hotkeys-hook`) enregistre au niveau `MainLayout` :
- `n` : creer nouvelle entite sur la page courante
- `j`/`k` : naviguer dans les lignes du tableau
- `Enter` : ouvrir le detail
- `e` : editer la ligne selectionnee inline
- `Escape` : deselectionner
- `?` : afficher l'overlay des raccourcis

**Protection :** Desactive quand un input/textarea est focus.

### 2.4 Dashboard Action Drawers (zero-navigation pattern)

**Probleme actuel :** Dashboard → clic sur alerte → navigation vers la page → trouver l'entite → agir. 3-4 clics minimum.

**Solution :**

Remplacer les `Link` du dashboard par des `Sheet` (slide-over panels shadcn/ui). Quand le syndic voit "Incident critique: fuite toiture", il clique et un drawer s'ouvre avec : details, statut, bouton "Emettre ordre de service", dropdown prestataire. Zero navigation.

**Impact :** 80% des actions quotidiennes sans quitter le dashboard. C'est le differenciateur qui empeche le churn.

### 2.5 Tables virtualisees + Multi-select + Bulk actions

**Solution :**

`@tanstack/react-virtual` pour les listes 10K+ (coproprietaires, tiers). Colonne checkbox pour multi-select. Barre d'actions bulk : email groupé, changement de statut, export.

Backend : pagination par curseur (`.where('id', '>', lastId).limit(50)`) au lieu d'offset.

---

## Pilier 3 — Workflows metier structures

### 3.1 Ordres de Service (workflow GDI complet)

**Gap principal vs POWIMO.** C'est le workflow quotidien n°1 du syndic. CoproPilot a incidents et interventions comme entites plates.

**Solution :**

State machine complete :
```
Incident signale → Ordre de service emis → Devis recu → Devis accepte → Intervention planifiee → Realisation → Facture recue → Cloture
```

Chaque transition :
- Notifie le prestataire (table `prestataires` existante)
- Auto-cree l'etape suivante
- Alimente la timeline

**Migration :** `ordres_service` (id, incident_id, prestataire_id, type, montant_provisionnel, statut, date_emission, date_reponse, copropriete_id).

**UX :** Timeline verticale sur la page detail incident, avec clic sur le noeud suivant pour avancer l'etat.

### 3.2 Taches & Rappels Engine (cross-module)

**Gap vs POWIMO.** POWIMO a des rappels manuels. CoproPilot a le cycle annuel mais pas de taches generales.

**Solution :**

Migration `taches` : user_id, copropriete_id, titre, description, date_echeance, rappel_date, entite_type (polymorphique), entite_id, statut, priorite.

**Auto-generation depuis les donnees existantes :**
- Contrat atteignant `preavis_mois` avant `date_fin` → tache auto
- Diagnostic `date_validite` approchant → tache auto
- AG a J-21 sans convocation → tache auto
- Assurance expirant dans 30j → tache auto

**UX :** Sidebar persistante ou section command palette "Taches du jour" / "En retard" / "A venir".

### 3.3 Module Devis & Comparaison

**Solution :**

Migration `devis` : intervention_id, prestataire_id, montant_ht, montant_ttc, date_reception, date_validite, statut (recu/accepte/refuse/expire), document_url, notes.

**UX :** Vue comparaison cote-a-cote (max 3 devis). Un clic "Accepter" → transition de l'ordre de service dans la state machine.

### 3.4 Timeline par entite (generalisation du pattern GDI)

**Solution :**

Endpoint generique : `GET /api/{entity}/{id}/timeline` → query sur `domain_events WHERE aggregate_type AND aggregate_id ORDER BY created_at`.

Composant `EntityTimeline` reutilisable sur toutes les pages detail (incident, AG, contrat, sinistre).

---

## Pilier 4 — Intelligence financiere

### 4.1 Reconciliation bancaire auto-match

**Probleme actuel :** Les mouvements bancaires ont un `rapprochement_status` mais le matching est manuel.

**Solution :**

Endpoint `suggested_matches` : fuzzy matching (montant ±2%, date ±5j, reference substring) entre mouvements et appels de fonds + factures fournisseurs. Score de confiance. Le syndic confirme ou rejette.

**Regle critique :** Jamais d'auto-confirmation. Toujours un clic humain. Match < 90% = orange.

**Cible :** 80% de taux d'auto-match. Economies : 4-6h/semaine/syndic.

### 4.2 Regularisation automatique post-AG

**Solution :**

Quand une resolution de type "approbation budget" est marquee `adoptee` → auto-generation du budget en statut brouillon avec les montants votes → creation du calendrier d'appels de fonds pour le nouvel exercice.

Le syndic review et valide en 1 clic au lieu de re-saisir manuellement.

### 4.3 Cash Flow Forecast & Scoring delinquance

**Solution :**

`PaymentAnalyticsService` : score de fiabilite par coproprietaire base sur l'historique de paiements (paiements effectues / paiements dus sur N periodes).

Endpoint `/api/coproprietes/:id/cash-flow-forecast` : projection 30/60/90 jours des encaissements vs depenses prevues.

**Dashboard widget :** Graphique barres simple (pas de librairie lourde — canvas lightweight).

**Garde-fou :** Minimum 2 exercices complets avant d'afficher des predictions. Sinon afficher "Donnees insuffisantes".

### 4.4 Auto-repartition des charges

**Solution :**

A la creation d'une charge → calcul automatique de la quote-part par lot basee sur la cle de repartition assignee → generation des lignes d'appel de fonds individuelles → diff si la cle a change depuis le dernier exercice.

Table `repartition_audit` pour la tracabilite legale.

### 4.5 Dashboard action-oriented (pas juste des metriques)

**Solution :**

Remplacer la grille de 7 metriques par une **file d'actions priorisees** :
- "3 coproprietaires a risque d'impaye en avril — envoyer rappels"
- "12 mouvements bancaires non rapproches — verifier les matchs"
- "AG du 15 avril : 2 resolutions non finalisees"
- "Police assurance X expire dans 30j"

Chaque carte a un seul bouton qui mene directement a la resolution (via action drawer, pas navigation).

---

## Matrice de priorisation

| Feature | Impact quotidien | Effort | Prerequis | Sprint |
|---------|-----------------|--------|-----------|--------|
| Domain Events + EventBus | Fondation | M | Aucun | S1 |
| SSE Notifications | Eleve | S | EventBus | S2 |
| Workflow Engine | Fondation | M | EventBus | S2 |
| Inline Table Editing | Tres eleve | S | Aucun | S3 |
| Command Palette Actions | Eleve | S | Aucun | S3 |
| Keyboard Shortcuts | Moyen | XS | Aucun | S3 |
| Dashboard Action Drawers | Tres eleve | M | Aucun | S4 |
| Ordres de Service | Tres eleve | L | WorkflowEngine | S5 |
| Taches & Rappels | Tres eleve | M | EventBus | S5 |
| Timeline par entite | Eleve | S | DomainEvents | S6 |
| Devis & Comparaison | Eleve | M | OrdresDeService | S7 |
| Bank Reconciliation | Tres eleve | M | Aucun | S8 |
| Regularisation post-AG | Eleve | M | EventBus | S8 |
| Cash Flow Forecast | Moyen | M | Data historique | S9 |
| Auto-repartition | Moyen | M | Aucun | S10 |
| Multi-select + Batch | Moyen | M | Aucun | S10 |
| Import POWIMO (CSV) | Critique (migration) | L | Aucun | Parallele |

---

## Ce qu'on ne fait PAS (decisions explicites)

1. **Pas d'ajout d'ecrans CRUD supplementaires** — la couverture est suffisante
2. **Pas de WebSocket** — SSE suffit pour le push unidirectionnel
3. **Pas de message broker (Kafka/RabbitMQ)** — EventEmitter in-process + PostgreSQL comme log durable
4. **Pas de workflow engine externe (Temporal/n8n)** — 200 lignes de state machine suffisent
5. **Pas de ML pour les predictions** — heuristiques deterministes d'abord, ML quand on a les donnees
6. **Pas de mobile app** — le syndic travaille sur desktop, le responsive suffit pour l'extranet
7. **Pas d'equipements immeuble (30+ checkboxes POWIMO)** — data entry sans valeur workflow
8. **Pas de multi-agence** — feature enterprise, a construire quand les premieres agences sont live

---

## Metriques de succes

| Metrique | Baseline (actuel) | Cible post-P2 | Cible post-P4 |
|----------|-------------------|---------------|---------------|
| Clics pour traiter un incident | ~12 | ~4 | ~2 |
| Temps reconciliation bancaire/mois | Manuel (heures) | 30 min | 10 min |
| Taches oubliees (echeances manquees) | Non mesure | -60% | -90% |
| Temps preparation AG | ~2h | ~45 min | ~20 min |
| Navigation pages/action quotidienne | ~8 pages | ~3 pages | ~1 (dashboard) |

---

_Analyse generee par Fast Meeting — 4 personas IA en parallele_
