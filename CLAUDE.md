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
│   │   ├── migrations/             # 19 migrations Knex (schema complet)
│   │   ├── seeds/                  # 21 fichiers de seed (données de test)
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── auth.js         # Better Auth setup
│   │   │   │   ├── knex-database.js # Initialisation Knex
│   │   │   │   ├── knexfile.js     # Config connexion PostgreSQL (dev/test/prod)
│   │   │   │   └── migrate.js      # Migration runner
│   │   │   ├── controllers/        # ~40 contrôleurs Express (PascalCase)
│   │   │   ├── middleware/
│   │   │   │   ├── auth.js         # Authentification Better Auth
│   │   │   │   ├── errorHandler.js # Gestion globale des erreurs
│   │   │   │   ├── requestLogger.js # Logging requêtes (Winston)
│   │   │   │   └── validation.js   # Validation JSON
│   │   │   ├── models/             # ~40 modèles (requêtes Knex, pas d'ORM)
│   │   │   ├── routes/             # ~39 fichiers de routes (kebab-case)
│   │   │   │   └── index.js        # Registre central des routes
│   │   │   ├── services/           # ~45 services (logique métier)
│   │   │   ├── utils/
│   │   │   │   └── cache.js        # Node-cache
│   │   │   ├── createApp.js        # Factory Express (middleware setup)
│   │   │   ├── index.js            # Point d'entrée serveur
│   │   │   └── logger.js           # Winston logger
│   │   ├── tests/
│   │   │   └── smoke.test.js       # Smoke tests backend
│   │   ├── vitest.config.js
│   │   └── package.json
│   └── frontend/                   # SPA React (TypeScript)
│       ├── src/
│       │   ├── api/                # ~44 modules fetch typés (+ api.ts base wrapper)
│       │   ├── components/
│       │   │   ├── ui/             # 23 composants shadcn/ui (NE PAS MODIFIER)
│       │   │   ├── layout/         # MainLayout, NotificationBell
│       │   │   ├── assemblees/     # Composants feature AG
│       │   │   ├── assurances/     # Composants feature assurances
│       │   │   ├── charges/        # Composants feature comptabilité
│       │   │   ├── comptes-bancaires/
│       │   │   ├── conseil-syndical/
│       │   │   ├── contentieux/
│       │   │   ├── contrats/
│       │   │   ├── contrats-syndic/
│       │   │   ├── coproprietaires/
│       │   │   ├── coproprietes/
│       │   │   ├── documents/
│       │   │   ├── employes/
│       │   │   ├── immatriculation/
│       │   │   ├── incidents/
│       │   │   └── reglements/
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
├── docs/                           # Documentation (api, architecture, modules, données)
├── scripts/
│   ├── dev.js                      # Lance backend + frontend en parallèle
│   └── build.js                    # Build tous les workspaces
├── .github/workflows/ci.yml       # CI/CD (lint, typecheck, build, release, Docker)
├── Dockerfile                      # Multi-stage (frontend build → production image)
├── compose.local.yml               # Dev local (PostgreSQL + app)
├── compose.yml                     # Production (PostgreSQL + app)
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

### Git

- Messages de commit en anglais, préfixés : `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Branche principale : `main`
- Semantic Release gère le versioning automatique depuis `main`

## CI/CD Pipeline

Le workflow GitHub Actions (`.github/workflows/ci.yml`) exécute :

1. **CI** (push sur `main` + PRs) : install → lint backend → lint frontend → typecheck → build frontend
2. **Release** (push sur `main` uniquement) : semantic-release (bump version, tag, GitHub release)
3. **Docker** (après une nouvelle release) : build multi-plateforme → push DockerHub (`wifsimster/copro-pilot:latest` + tag de version)

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
- L'authentification utilise Better Auth (email/mot de passe)
- Le frontend utilise un `HashRouter` (URLs avec `#`)
- Ne pas créer de fichiers CommonJS — tout est en ESM (`import/export`)
- Ne pas modifier les fichiers `components/ui/` (générés par shadcn/ui)
- Ne pas stocker de secrets dans le code source
- Toujours passer par une migration Knex pour tout changement de schéma
- Le frontend dev server (Vite) tourne sur le port 3000 et proxy `/api` vers le backend (port 3001)
- Build variables disponibles : `__APP_VERSION__` et `__BUILD_DATE__` (injectées par Vite)

## Fichiers critiques

- `apps/backend/src/index.js` — Point d'entrée serveur, middleware, initialisation
- `apps/backend/src/createApp.js` — Factory Express, montage des middleware
- `apps/backend/src/routes/index.js` — Registre central de toutes les routes API
- `apps/backend/src/config/auth.js` — Configuration Better Auth
- `apps/backend/src/config/knexfile.js` — Configuration connexion PostgreSQL
- `apps/frontend/src/routes/index.tsx` — Définition de toutes les routes frontend
- `apps/frontend/src/types/index.ts` — Types TypeScript partagés
- `apps/frontend/src/api/api.ts` — Base fetch wrapper pour toutes les API calls
- `apps/frontend/src/lib/auth-client.ts` — Client d'authentification Better Auth
