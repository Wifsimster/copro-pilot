# Analyse de reunion : Fondations event-driven (P1) pour CoproPilot

> Date : 2026-03-21
> Methode : Meeting avec 4 personas IA (2 rounds de debat)

---

## Question posee

Comment implementer les fondations event-driven (P1) dans CoproPilot — domain events, workflow engine, SSE — en preservant la simplicite du produit et la retrocompatibilite ?

## Participants

| Persona | Role | Position finale |
|---------|------|-----------------|
| Whiteboard Damien | Architecte logiciel | `domain_events` table comme source unique (timeline + audit + events). EventBus minimal. Defer WorkflowEngine a P2. |
| SOLID Alex | Senior Backend Engineer | Fix bugs d'abord. Events dans les services (pas controllers). Piloter avec Incident. Factory functions pour testabilite. |
| Edge-Case Nico | QA / Fiabilite | 2 bugs critiques a fixer en priorite (notification leak + mass assignment). Event dans la meme transaction Knex. Tests avant refactoring. |
| Sprint Zero Sarah | Product Owner | Chaque PR doit livrer du visible ou fixer du casse. SSE = win utilisateur. 3 semaines max, pas 6. |

## Synthese de la discussion

### Consensus fort

Les 4 participants convergent sur 6 points :
1. **Fixer les bugs critiques en premier** — la fuite de notification (`_getSyndicUsersForCopropriete` ignore le `coproprieteId`) est un bug de confidentialite en production
2. **Deplacer les evenements des controllers vers les services** — les controllers ne doivent pas connaitre les side-effects
3. **SSE est le seul delivrable visible de P1** — remplacer le polling 30s par du push temps reel
4. **La timeline est une feature utilisateur** — pas de l'infrastructure invisible
5. **Piloter avec Incident** — entite la plus simple avec des hooks existants
6. **Pas de dependances externes** — pas de Redis, Kafka, Temporal

### Debat central : `domain_events` vs `activity_log`

Le debat le plus vif a oppose deux approches pour le stockage :

**Option A (Damien + Nico) :** Une seule table `domain_events` qui sert de timeline, audit trail, et source d'evenements. L'evenement est ecrit dans la meme transaction Knex que la mutation metier. La timeline est une simple requete SELECT sur cette table.

**Option B (Alex + Sarah) :** Une table `activity_log` simple avec des appels directs `TimelineService.record()`. Plus rapide a implementer, pas besoin d'abstraction EventBus.

**Resolution :** L'option A est retenue. L'argument decisif de Damien : construire une `activity_log` separee puis migrer vers `domain_events` plus tard coute plus cher au total que de construire `domain_events` correctement une seule fois. Mais le scope de l'option A est reduit : pas de WorkflowEngine, pas d'outbox processor, pas de dead-letter. Juste une table append-only avec ecriture synchrone dans la transaction.

### Debat secondaire : synchrone vs asynchrone

Alex voulait un dispatch synchrone (handlers bloquent la reponse). Damien voulait des handlers async apres commit. Nico a tranche : l'evenement est persiste dans la transaction, le dispatch aux handlers est async et best-effort. Si un handler echoue, l'evenement est dans la table pour investigation/replay.

## Recommandation

**Niveau de confiance :** Eleve

**Approche retenue :** P1 en 3 phases de 1 semaine chacune, chaque phase livre du visible ou fixe du casse. Table `domain_events` unique (pas de table separee pour timeline). Pas de WorkflowEngine dans P1. EventBus minimal (simple EventEmitter, pas d'abstraction complexe).

### Phase 1 — Semaine 1 : Fix bugs critiques + tests

| Action | Detail | Justification |
|--------|--------|---------------|
| Fix notification leak | `_getSyndicUsersForCopropriete()` doit filtrer par `copropriete_id` | Bug de confidentialite en production |
| Fix mass assignment | Whitelist des champs dans les 5 services event-producing | Vulnerabilite de securite |
| Add status validation | Map de transitions autorisees dans `IncidentService.update()` — rejeter avec 400 | Pas de WorkflowEngine, juste un `if` |
| Idempotency guard | Verifier si `carnet_entretien` existe deja avant insert dans `onInterventionTerminee` | Evite les doublons |
| Tests | Caracterisation tests du cycle Incident (create → update status → side effects) | Prerequis pour refactorer en securite |

### Phase 2 — Semaine 2 : `domain_events` table + move events to services

| Action | Detail | Justification |
|--------|--------|---------------|
| Migration `domain_events` | `id` (uuid), `event_type`, `entity_type`, `entity_id`, `copropriete_id`, `actor_id`, `payload` (jsonb), `metadata` (jsonb), `created_at`, `processed_at` | Source unique pour timeline, audit, events |
| `DomainEventModel.js` | Modele Knex standard (create, getByEntity, getByType) | Suit le pattern existant des modeles |
| Refactor `IncidentService` | `create()` et `update()` emettent un domain event dans la meme transaction Knex | Pilote — valide le pattern |
| Refactor les 4 autres services | Meme pattern pour Intervention, AG, Paiement, Sinistre | Rollout apres validation du pilote |
| Supprimer `WorkflowEventService` | Remplacer par des handler functions enregistrees au demarrage | Decouplage side-effects |
| `EventBus.js` minimal | Wrapper EventEmitter (~40 lignes). `emit(event, trx)` persiste + dispatch. Constructor injection pour tests. | Pas d'outbox processor, pas de retry — juste persist + dispatch |
| Timeline endpoint | `GET /api/:entityType/:entityId/timeline` — SELECT sur `domain_events` | La timeline est gratuite une fois la table creee |

### Phase 3 — Semaine 3 : SSE + frontend

| Action | Detail | Justification |
|--------|--------|---------------|
| SSE endpoint | `GET /api/notifications/stream` — long-lived HTTP connection | Remplace le polling 30s |
| `SseManager.js` | Map in-memory userId → connections. Heartbeat toutes les 30s. Cleanup on disconnect. | Simple, pas de Redis |
| Wire EventBus → SSE | Quand un domain event cree une notification, push via SSE | Temps reel sans polling |
| Frontend `useEventStream` hook | Souscrit a SSE, invalide React Query on event, fallback polling si SSE deconnecte | Progressive enhancement |
| Frontend `EntityTimeline` component | Composant timeline sur la page detail Incident | Premier usage visible de domain_events |

### Structure de fichiers proposee

```
src/
  events/
    EventBus.js              — EventEmitter wrapper (~40 lignes)
    DomainEventModel.js      — Modele Knex pour domain_events
    SseManager.js            — Gestion connexions SSE
    event-types.js           — Constantes des types d'evenements
    handlers/
      NotificationHandler.js — Cree les notifications (ex-WorkflowEventService)
      CarnetEntretienHandler.js — Auto-cree entree carnet
      SseHandler.js          — Push SSE aux clients connectes
  workflows/
    transitions.js           — Map simple { entity: { from: [to] } } (pas un engine)
```

**Justification :**
- La `domain_events` table sert 3 usages (timeline, audit, event source) sans duplication
- L'EventBus est minimal (~40 lignes) — pas un framework, juste un mediateur
- La validation de transitions est un simple objet JS, pas un engine declaratif
- Chaque handler est une fonction isolee, testable sans DB
- SSE est le seul delivrable visible pour l'utilisateur — temps reel instantane

**Risques identifies :**
- **Transaction Knex dans les services** → Le backend n'utilise quasi aucune transaction aujourd'hui (sauf GDPR). Risk de bugs. Mitigation : piloter avec Incident, ajouter des tests specifiques pour les cas d'echec.
- **SSE et reverse proxy** → Nginx/load balancer peut couper les connexions longues. Mitigation : heartbeat 30s + fallback polling.
- **Dual path si `update()` generique reste ouvert** → Un dev peut bypass la validation de transition. Mitigation : le `update()` des entites workflow-managed rejette les changements de `statut` directement, force l'usage de methodes nommees (`resoudre()`, `cloturer()`).

**Points non resolus :**
- Optimistic locking (`updated_at` dans WHERE clause) : identifie par Nico comme necessaire mais defere a P2
- Replay d'evenements echoues : la colonne `processed_at` est prevue mais pas de mecanisme de retry automatique en P1
- Migration de l'`audit_log` existant : les deux tables coexistent en P1, consolidation en P2

## Alternatives considerees

| Option | Avantages | Inconvenients | Verdict |
|--------|-----------|---------------|---------|
| **A. domain_events unique (retenue)** | Source unique, timeline gratuite, pas de migration future | Necessite transactions Knex, plus complexe semaine 2 | Recommandee |
| **B. activity_log separee (Sarah)** | Plus simple, plus rapide (1 semaine) | Double source de verite, migration couteuse vers events plus tard | Rejetee |
| **C. Full EventBus + WorkflowEngine + Outbox (Damien initial)** | Architecture complete, retry, dead-letter | 6+ semaines, over-engineering pour 5 call sites | Rejetee (defer P2) |
| **D. Fix bugs only, defer tout (minimal)** | Rapide, pas de risque architectural | Ne debloque pas P2-P4, timeline impossible | Rejetee |

## Prochaines etapes proposees

1. **Valider cette recommandation** — confirmer le scope 3 semaines / 3 phases
2. **Phase 1 (S1)** — Fix bugs + tests (1 PR)
3. **Phase 2 (S2)** — domain_events + EventBus + refactor services (1 PR)
4. **Phase 3 (S3)** — SSE + timeline frontend (1 PR)
5. **Review P2** — Evaluer si WorkflowEngine est necessaire avant d'attaquer P2 du roadmap

---

_Analyse generee par Meeting IA — 4 personas, 2 rounds de debat_
