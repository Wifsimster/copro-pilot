# CLAUDE.md — CoproPilot

## Présentation

CoproPilot est une plateforme monorepo de gestion de copropriété pour syndics professionnels. Elle est composée d'un backend Express (API REST) et d'un frontend React (SPA), communiquant via une API REST sous le préfixe `/api`.

## Stack technique

- **Runtime :** Node.js >= 24 (ESM natif, `"type": "module"` — pas de CommonJS)
- **Backend :** Express 5, Knex.js 3 (PostgreSQL), Better Auth 1.4, Winston (logs)
- **Frontend :** React 19, TypeScript 5.7, Vite 7, TailwindCSS v4, Radix UI (shadcn/ui), React Query 5, Zustand 5, React Hook Form + Zod
- **Base de données :** PostgreSQL 18
- **Tests :** Vitest 4 (backend : node environment, frontend : jsdom + Testing Library)
- **CI/CD :** GitHub Actions, Semantic Release
- **Infra :** Docker multi-stage, Docker Compose

## Structure du projet

```
copro-pilot/
├── apps/
│   ├── backend/                    # API Express (JavaScript ESM)
│   │   ├── migrations/             # 33 migrations Knex (schema complet)
│   │   ├── seeds/                  # 23 fichiers de seed (données de test)
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── auth.js         # Better Auth setup
│   │   │   │   ├── knex-database.js # Initialisation Knex
│   │   │   │   ├── knexfile.js     # Config connexion PostgreSQL (dev/test/prod)
│   │   │   │   └── migrate.js      # Migration runner
│   │   │   ├── controllers/        # ~40 contrôleurs Express (PascalCase)
│   │   │   ├── middleware/
│   │   │   │   ├── accountLockout.js # Verrouillage après 5 échecs (15 min)
│   │   │   │   ├── auditLogger.js  # Journal d'audit infalsifiable (hash chain)
│   │   │   │   ├── auth.js         # Authentification Better Auth
│   │   │   │   ├── authorization.js # Contrôle d'accès par rôle
│   │   │   │   ├── correlationId.js # X-Request-Id pour tracer les requêtes
│   │   │   │   ├── csrf.js         # Protection CSRF (double-submit cookie)
│   │   │   │   ├── errorHandler.js # Gestion globale des erreurs
│   │   │   │   ├── metrics.js      # Collecte métriques Prometheus
│   │   │   │   ├── rateLimiter.js  # Rate limiting
│   │   │   │   ├── requestLogger.js # Logging requêtes (Winston)
│   │   │   │   ├── requirePlan.js  # Vérification plan Stripe
│   │   │   │   ├── requireQuota.js # Vérification quotas d'usage
│   │   │   │   ├── validate.js     # Validation Zod des payloads
│   │   │   │   └── validation.js   # Validation JSON
│   │   │   ├── models/             # ~40 modèles (requêtes Knex, pas d'ORM)
│   │   │   ├── routes/             # ~45 fichiers de routes (kebab-case)
│   │   │   │   └── index.js        # Registre central (monté sur /api et /api/v1)
│   │   │   ├── schemas/
│   │   │   │   └── index.js        # Schémas Zod pour la validation des payloads
│   │   │   ├── services/           # ~50 services (logique métier)
│   │   │   ├── utils/
│   │   │   │   ├── cache.js        # Node-cache
│   │   │   │   ├── crypto.js       # Helpers cryptographiques
│   │   │   │   ├── email-templates.js
│   │   │   │   ├── email.js
│   │   │   │   ├── encryption.js   # AES-256-GCM pour PII (IBAN)
│   │   │   │   ├── logSampling.js  # sample(rate, key) pour réduire le bruit
│   │   │   │   ├── metrics.js      # Registre Prometheus
│   │   │   │   ├── pagination.js   # Helper pagination standardisée
│   │   │   │   └── password-validator.js
│   │   │   ├── createApp.js        # Factory Express (middleware setup)
│   │   │   ├── index.js            # Point d'entrée serveur
│   │   │   └── logger.js           # Winston logger (JSON stdout en prod)
│   │   ├── tests/
│   │   │   ├── helpers/            # Factories de test + mocks Knex
│   │   │   ├── middleware/         # Tests des middleware (csrf, auth, etc.)
│   │   │   ├── models/             # Tests Paiement/Mutation/Relance…
│   │   │   ├── services/           # Tests financiers (AppelFonds, ComptaRegl…)
│   │   │   ├── utils/              # Tests crypto/encryption (19 cas)
│   │   │   └── smoke.test.js       # Smoke tests backend
│   │   ├── vitest.config.js
│   │   └── package.json
│   └── frontend/                   # SPA React (TypeScript)
│       ├── src/
│       │   ├── api/                # ~50 modules fetch typés (+ api.ts base wrapper)
│       │   ├── components/
│       │   │   ├── ui/             # Composants shadcn/ui + DataTable, ConfirmDialog,
│       │   │   │                   # ErrorAlert, ErrorBoundary, Breadcrumbs, TabBar,
│       │   │   │                   # NoCoproprieteSelected (NE PAS MODIFIER les ui/)
│       │   │   ├── layout/         # MainLayout, NotificationBell, OfflineIndicator
│       │   │   ├── assemblees/     # Composants feature AG
│       │   │   ├── assurances/     # Composants feature assurances
│       │   │   ├── auth/           # Composants auth (login, lockout, MFA)
│       │   │   ├── charges/        # Composants feature comptabilité
│       │   │   ├── comptes-bancaires/
│       │   │   ├── conseil-syndical/
│       │   │   ├── contentieux/
│       │   │   ├── contrats/
│       │   │   ├── contrats-syndic/
│       │   │   ├── coproprietaires/
│       │   │   ├── coproprietes/
│       │   │   ├── dashboard/      # KPIs + graphiques Recharts
│       │   │   ├── documents/
│       │   │   ├── employes/
│       │   │   ├── extranet/       # Espace copropriétaire (paiements, documents)
│       │   │   ├── gdpr/           # Export RGPD (Art. 20) + effacement (Art. 17)
│       │   │   ├── immatriculation/
│       │   │   ├── incidents/
│       │   │   ├── landing/        # Page d'accueil publique
│       │   │   ├── reglements/
│       │   │   └── user-management/
│       │   ├── hooks/              # ~44 custom hooks (React Query wrappers)
│       │   ├── lib/
│       │   │   ├── auth-client.ts  # Better Auth client
│       │   │   └── utils.ts        # cn() (clsx + tailwind-merge)
│       │   ├── pages/              # ~30 pages (PascalCase + suffixe Page)
│       │   ├── routes/
│       │   │   ├── index.tsx       # HashRouter config (react-router-dom v7)
│       │   │   └── ProtectedRoute.tsx
│       │   ├── store/
│       │   │   ├── authStore.ts    # Zustand auth state
│       │   │   └── coproprieteStore.ts
│       │   ├── style/
│       │   │   └── index.css       # CSS global + TailwindCSS v4
│       │   ├── types/
│       │   │   └── index.ts        # Types TypeScript partagés
│       │   ├── utils/
│       │   │   ├── logger.ts       # Client-side logging
│       │   │   └── roleAccess.ts   # Contrôle d'accès par rôle
│       │   ├── App.tsx
│       │   └── main.tsx            # Entry point React 19 + React Query
│       ├── tests/
│       │   ├── smoke.test.tsx      # Smoke tests frontend
│       │   └── setup.ts            # Test setup (jsdom)
│       ├── components.json         # Config shadcn/ui
│       ├── tsconfig.json           # TypeScript strict, alias @/*
│       ├── vite.config.js          # Vite + TailwindCSS + proxy /api → :3001
│       ├── vitest.config.ts
│       └── package.json
├── docs/                           # Documentation (api, architecture, modules, données, operations)
├── scripts/
│   ├── dev.js                      # Lance backend + frontend en parallèle
│   ├── build.js                    # Build tous les workspaces
│   ├── backup.sh                   # pg_dump compressé + rotation (RETENTION_DAYS)
│   └── generate-encryption-key.js  # Génère une clé AES-256-GCM pour PII_ENCRYPTION_KEY
├── .github/workflows/ci.yml       # CI/CD (lint, typecheck, build, release, Docker)
├── Dockerfile                      # Multi-stage (frontend build → production image)
├── compose.local.yml               # Dev local (PostgreSQL + app)
├── compose.yml                     # Production (PostgreSQL + app)
├── compose.backup.yml              # Override : sidecar postgres-backup (3 h du matin)
├── release.config.js               # Semantic Release config
├── eslint.config.js                # ESLint racine
├── .prettierrc                     # Prettier config
├── AGENT.md                        # Instructions pour agents IA
└── package.json                    # Root workspace (v1.10.0)
```

## Commandes utiles

### Installation

```bash
npm install --workspaces --include-workspace-root
# ou raccourci :
npm run iw
# setup complet (install + build) :
npm run bootstrap
```

### Développement

```bash
# Backend seul (port 3001)
npm run dev:backend

# Frontend seul (port 3000 via Vite, proxy /api → localhost:3001)
npm run dev:frontend
```

### Base de données

```bash
cd apps/backend
npm run migrate:latest          # Appliquer les migrations
npm run migrate:rollback        # Annuler la dernière migration
npm run migrate:make -- <name>  # Créer une migration
npm run seed:run                # Lancer les seeds
npm run db:reset                # Rollback all + migrate + seed
```

### Tests

```bash
# Tous les workspaces
npm run test

# Backend uniquement
npm run test --workspace=@copro-pilot/backend

# Frontend uniquement
npm run test --workspace=copro-pilot-frontend

# Watch mode (dans le workspace concerné)
npm run test:watch
```

### Qualité de code

```bash
# Lint tous les workspaces
npm run lint

# TypeScript check (frontend)
npm run typecheck --workspace=copro-pilot-frontend
```

### Build & production

```bash
npm run build                   # Build tous les workspaces
npm run frontend:build          # Build frontend uniquement
```

### Docker

```bash
docker compose -f compose.local.yml up -d   # Démarrer l'environnement local
docker compose -f compose.local.yml down     # Arrêter
```

### Backup & Operations

Les opérations courantes (sauvegarde, logs, métriques, incident response) sont documentées en détail dans [`docs/operations.md`](docs/operations.md).

```bash
# Sauvegarde manuelle de la base (gzip dans $BACKUP_DIR, défaut /var/backups/copro-pilot)
POSTGRES_PASSWORD=... ./scripts/backup.sh

# Démarrer la stack de production avec le sidecar de backup automatique (3 h du matin, tous les jours)
docker compose -f compose.yml -f compose.backup.yml up -d

# Consulter les logs JSON du backend (production)
docker compose -f compose.yml logs -f app | jq .

# Scraper Prometheus : endpoint /metrics exposé par le backend (hors préfixe /api)
curl http://localhost:3001/metrics

# Générer une clé AES-256-GCM pour PII_ENCRYPTION_KEY (chiffrement opt-in des IBAN)
node scripts/generate-encryption-key.js

# Vérifier l'intégrité de la chaîne d'audit (admin)
curl -H "Cookie: <session>" http://localhost:3001/api/audit/verify-chain

# Health check enrichi (latence DB + connectivité)
curl http://localhost:3001/api/health
```

Fichiers clés :

- `scripts/backup.sh` — dump `pg_dump` compressé + rotation `RETENTION_DAYS`
- `compose.backup.yml` — override Docker Compose avec sidecar `postgres-backup`
- `apps/backend/src/logger.js` — Winston structuré (stdout JSON en prod, fichiers en dev)
- `apps/backend/src/utils/logSampling.js` — helper `sample(rate, key)` pour réduire le bruit des logs debug
- `docs/operations.md` — runbook backup/restore, logs, metrics, incident response

## Conventions de code

### Formatage (Prettier)

- Pas de point-virgule (`semi: false`)
- Single quotes (`singleQuote: true`)
- Indentation 2 espaces (`tabWidth: 2`)
- Trailing comma ES5 (`trailingComma: "es5"`)
- Largeur max 80 caractères (`printWidth: 80`)
- Arrow parens évitées (`arrowParens: "avoid"`)
- Fin de ligne LF (`endOfLine: "lf"`)

### Backend (JavaScript ESM)

- Architecture stricte : **Controller → Service → Model** (pas d'ORM, Knex query builder)
- Fichiers en **PascalCase** pour controllers, services, models (ex: `CoproprieteController.js`, `CoproprieteService.js`, `Copropriete.js`)
- Routes en **kebab-case** (ex: `parties-communes.js`, `cles-repartition.js`)
- API préfixée `/api/` (ex: `/api/coproprietes`, `/api/lots`)
- Toute nouvelle route doit être enregistrée dans `routes/index.js`
- Modèles : fonctions pures avec Knex query builder, pas d'ORM
- Pas de `dotenv` — utiliser `--env-file=.env` natif Node.js 24
- Tout en ESM (`import/export`) — jamais de `require/module.exports`

### Frontend (TypeScript)

- Pages en **PascalCase** suffixées `Page` (ex: `CoproprietesPage.tsx`)
- Composants feature dans `components/<feature>/` (ex: `components/coproprietes/`)
- Composants UI via **shadcn/ui** (Radix + TailwindCSS) dans `components/ui/` — **ne pas modifier ces fichiers**
- Hooks custom dans `hooks/` : un hook par entité wrappant React Query (ex: `useCoproprietes.ts`)
- API calls dans `api/` : fonctions fetch typées, base wrapper dans `api/api.ts`
- Types dans `types/index.ts` — ajouter les types pour chaque nouvelle entité
- State management : **Zustand** pour l'auth et la sélection de copropriété, **React Query** pour les données serveur
- Routing : `react-router-dom` v7 avec `createHashRouter` (URLs avec `#`)
- Validation formulaires : **React Hook Form** + **Zod**
- Path alias : `@/*` → `./src/*`
- TypeScript strict mode activé (`noUnusedLocals`, `noUnusedParameters`)

### Git — Conventional Commits & Semantic Release

Ce projet utilise **Semantic Release** (config : `release.config.js`) pour automatiser le versioning et les releases. Les commits sur `main` sont analysés par `@semantic-release/commit-analyzer` (preset Angular) pour déterminer le type de release. **Il est impératif de respecter le format Conventional Commits** pour que le pipeline fonctionne correctement.

#### Format des messages de commit

```
<type>(<scope>): <description>

[body optionnel]

[footer(s) optionnel(s)]
```

- **Langue :** anglais uniquement
- **Description :** impérative, minuscule, sans point final (ex: `add user export endpoint`)
- **Scope (optionnel) :** module ou zone concernée (ex: `backend`, `frontend`, `auth`, `charges`, `coproprietes`)
- **Body (optionnel) :** détails supplémentaires, motivation du changement
- **Footer (optionnel) :** références issues (`Closes #42`), breaking changes

#### Types de commit et impact sur le versioning

| Type | Description | Release |
|---|---|---|
| `feat` | Nouvelle fonctionnalité | **minor** (1.x.0) |
| `fix` | Correction de bug | **patch** (1.0.x) |
| `perf` | Amélioration de performance | **patch** (1.0.x) |
| `refactor` | Restructuration sans changement fonctionnel | aucune release |
| `docs` | Documentation uniquement | aucune release |
| `style` | Formatage, espaces, point-virgules (pas de changement logique) | aucune release |
| `test` | Ajout ou modification de tests | aucune release |
| `build` | Changements du système de build, dépendances | aucune release |
| `ci` | Configuration CI/CD (GitHub Actions, Docker) | aucune release |
| `chore` | Maintenance, tâches diverses | aucune release |

#### Breaking changes (version majeure)

Pour déclencher une release **major** (x.0.0), ajouter `BREAKING CHANGE:` dans le footer du commit ou `!` après le type :

```
feat(api)!: replace /api/coproprietes response format

BREAKING CHANGE: the coproprietes endpoint now returns a paginated
response object instead of a plain array.
```

#### Exemples de bons messages de commit

```bash
# Patch release (fix)
fix(backend): prevent duplicate entries in charges table

# Minor release (feat)
feat(frontend): add export to CSV for coproprietes list

# Feat avec scope et body
feat(auth): add Microsoft OAuth login support

Integrate Better Auth Microsoft provider. Users can now sign in
with their Microsoft account in addition to email/password.

Closes #127

# No release (refactor, docs, chore, test, ci...)
refactor(backend): extract validation logic into shared helper
docs: update API documentation for incidents module
test(frontend): add unit tests for useAssemblees hook
chore: upgrade vite to v7.1
ci: add test step to CI pipeline
```

#### Erreurs courantes à éviter

- **Ne pas mélanger plusieurs changements dans un commit** — un commit = un changement logique
- **Ne pas utiliser de type incorrect** — un bugfix ne doit pas être `feat:`, une nouvelle feature ne doit pas être `fix:`
- **Ne pas omettre le type** — `update user model` est invalide, utiliser `refactor: update user model`
- **Ne pas utiliser le passé** — `feat: added export` est incorrect, utiliser `feat: add export`
- **Ne pas mettre de majuscule à la description** — `feat: Add export` est incorrect, utiliser `feat: add export`
- **Ne pas mettre de point final** — `feat: add export.` est incorrect

#### Branche et pipeline

- Branche principale : `main`
- Semantic Release s'exécute uniquement sur les pushes vers `main`
- Le pipeline CI (`ci.yml`) : lint → typecheck → test → build → semantic-release → Docker (si nouvelle release)
- Le commit de release est automatique : `chore(release): <version> [skip ci]`

## CI/CD Pipeline

Le workflow GitHub Actions (`.github/workflows/ci.yml`) exécute :

1. **CI** (push sur `main` + PRs) : install → lint backend → lint frontend → typecheck → build frontend
2. **Release** (push sur `main` uniquement) : semantic-release (bump version, tag, GitHub release)
3. **Docker** (après une nouvelle release) : build multi-plateforme → push GitHub Container Registry (`ghcr.io/<owner>/copro-pilot:latest` + tag de version)

## Variables d'environnement

Voir `apps/backend/.env.example`. Variables requises :

| Variable | Description | Défaut |
|---|---|---|
| `NODE_ENV` | Environnement (`development` / `production`) | `development` |
| `PORT` | Port du backend | `3001` |
| `POSTGRES_URI` | URI complète PostgreSQL (option 1) | — |
| `POSTGRES_HOST` | Hôte PostgreSQL (option 2) | `localhost` |
| `POSTGRES_PORT` | Port PostgreSQL | `5432` |
| `POSTGRES_DB` | Nom de la base | `copro_pilot` |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `copro_pilot` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | — |
| `BETTER_AUTH_SECRET` | Secret pour Better Auth | — |
| `BASE_URL` | URL du frontend (CORS + auth) | `http://localhost:3000` |

Variables optionnelles (fonctionnalités avancées) :

| Variable | Description | Défaut |
|---|---|---|
| `PII_ENCRYPTION_KEY` | Clé AES-256-GCM pour chiffrer les champs IBAN (générer via `node scripts/generate-encryption-key.js`) | — (chiffrement désactivé) |
| `METRICS_AUTH_TOKEN` | Bearer token requis pour accéder à l'endpoint `/metrics` | — (endpoint public) |
| `YOUSIGN_API_KEY` | Clé API Yousign pour la signature électronique des documents | — |
| `YOUSIGN_WEBHOOK_SECRET` | Secret de validation des webhooks Yousign | — |
| `VITE_KOE_PROJECT_KEY` | Clé de projet Koe (widget support — bug reports, feature requests) — vide pour désactiver | — |
| `VITE_KOE_API_URL` | URL de l'API Koe self-hosted | `https://api.koe.dev` |

## Ajout d'un nouveau module (checklist)

Pour ajouter une nouvelle entité/fonctionnalité :

### Backend

1. Créer une migration dans `migrations/` pour le schéma
2. Créer le modèle dans `models/` (PascalCase, requêtes Knex)
3. Créer le service dans `services/` (logique métier)
4. Créer le contrôleur dans `controllers/` (req/res → service → JSON)
5. Créer la route dans `routes/` (kebab-case)
6. Enregistrer la route dans `routes/index.js`
7. (Optionnel) Ajouter un fichier seed dans `seeds/`

### Frontend

1. Ajouter les types dans `types/index.ts`
2. Créer les fonctions API dans `api/` (fetch typé)
3. Créer le hook React Query dans `hooks/` (use + nom entité)
4. Créer la page dans `pages/` (PascalCase + suffixe `Page`)
5. Créer les composants feature dans `components/<feature>/`
6. Ajouter la route dans `routes/index.tsx`

## Points d'attention

- Le backend utilise `--env-file=.env` (fonctionnalité native Node.js 24, pas dotenv)
- Les migrations s'exécutent automatiquement au démarrage du serveur
- En production, le backend sert les fichiers statiques du frontend depuis `/frontend-dist`
- L'authentification utilise Better Auth (email/mot de passe) avec verrouillage après 5 échecs
- Le frontend utilise un `HashRouter` (URLs avec `#`)
- API versionnée : toutes les routes sont exposées à la fois sous `/api` et `/api/v1` (alias)
- L'endpoint `/metrics` (Prometheus) est exposé **hors** du préfixe `/api`, authentification optionnelle via `METRICS_AUTH_TOKEN`
- Toutes les routes POST/PUT doivent valider leur payload via un schéma Zod déclaré dans `src/schemas/index.js`
- Les endpoints de liste doivent accepter la pagination standard (`?page=&limit=&sortBy=&sortOrder=`) via `utils/pagination.js`
- Ne pas créer de fichiers CommonJS — tout est en ESM (`import/export`)
- Ne pas modifier les fichiers `components/ui/` (générés par shadcn/ui) — mais `DataTable`, `ConfirmDialog`, `ErrorAlert`, `ErrorBoundary`, `Breadcrumbs`, `TabBar`, `NoCoproprieteSelected` sont des composants partagés à réutiliser
- Ne pas stocker de secrets dans le code source
- Toujours passer par une migration Knex pour tout changement de schéma
- Le frontend dev server (Vite) tourne sur le port 3000 et proxy `/api` vers le backend (port 3001)
- Build variables disponibles : `__APP_VERSION__` et `__BUILD_DATE__` (injectées par Vite)
- Les nouvelles pages doivent être chargées via `React.lazy` et wrappées par `ErrorBoundary`

## Fichiers critiques

- `apps/backend/src/index.js` — Point d'entrée serveur, middleware, initialisation
- `apps/backend/src/createApp.js` — Factory Express, montage des middleware
- `apps/backend/src/routes/index.js` — Registre central des routes (monté sur `/api` et `/api/v1`)
- `apps/backend/src/config/auth.js` — Configuration Better Auth
- `apps/backend/src/config/knexfile.js` — Configuration connexion PostgreSQL
- `apps/backend/src/middleware/csrf.js` — Protection CSRF (double-submit cookie)
- `apps/backend/src/middleware/accountLockout.js` — Verrouillage après 5 échecs de connexion (15 min)
- `apps/backend/src/middleware/correlationId.js` — Injection de l'en-tête `X-Request-Id`
- `apps/backend/src/middleware/auditLogger.js` — Journal d'audit infalsifiable (hash chain SHA-256)
- `apps/backend/src/middleware/validate.js` — Validation Zod des payloads POST/PUT
- `apps/backend/src/schemas/index.js` — Schémas Zod partagés par module
- `apps/backend/src/utils/pagination.js` — Helper pagination (`?page=&limit=&sortBy=&sortOrder=`)
- `apps/backend/src/utils/encryption.js` — AES-256-GCM pour PII (IBAN)
- `apps/backend/src/utils/metrics.js` — Registre Prometheus exposé sur `/metrics`
- `apps/frontend/src/routes/index.tsx` — Définition de toutes les routes frontend (avec `React.lazy`)
- `apps/frontend/src/types/index.ts` — Types TypeScript partagés
- `apps/frontend/src/api/api.ts` — Base fetch wrapper pour toutes les API calls
- `apps/frontend/src/lib/auth-client.ts` — Client d'authentification Better Auth
