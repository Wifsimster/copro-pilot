# CLAUDE.md — CoproPilot

## Présentation

CoproPilot est une plateforme monorepo de gestion de copropriété pour syndics professionnels. Elle est composée d'un backend Express et d'un frontend React, communiquant via une API REST sous le préfixe `/api`.

## Stack technique

- **Runtime :** Node.js >= 24 (ESM natif, `"type": "module"`)
- **Backend :** Express 5, Knex.js 3 (PostgreSQL), Better Auth 1.4, Winston (logs)
- **Frontend :** React 19, TypeScript 5.7, Vite 7, TailwindCSS v4, Radix UI, React Query 5, Zustand 5, React Hook Form + Zod
- **Base de données :** PostgreSQL 18
- **Infra :** Docker, Docker Compose

## Structure du projet

```
copro-pilot/
├── apps/
│   ├── backend/                 # API Express
│   │   ├── migrations/          # Migrations Knex
│   │   ├── src/
│   │   │   ├── config/          # Knex, auth (Better Auth), migrations
│   │   │   ├── controllers/     # Contrôleurs Express
│   │   │   ├── middleware/      # Auth, error handler, validation, logging
│   │   │   ├── models/          # Modèles (fonctions Knex, pas d'ORM)
│   │   │   ├── routes/          # Routeurs Express
│   │   │   ├── services/        # Logique métier
│   │   │   ├── utils/           # Cache, helpers
│   │   │   ├── index.js         # Point d'entrée serveur
│   │   │   └── logger.js        # Winston logger
│   │   └── package.json
│   └── frontend/                # SPA React
│       ├── src/
│       │   ├── api/             # Fonctions d'appel API (fetch wrappers)
│       │   ├── components/      # Composants React (ui/, layout/, feature/)
│       │   ├── hooks/           # Custom hooks (React Query wrappers)
│       │   ├── lib/             # Utilitaires (cn, auth-client)
│       │   ├── pages/           # Pages (une par route)
│       │   ├── routes/          # Configuration du routeur
│       │   ├── store/           # Zustand stores
│       │   ├── style/           # CSS global
│       │   ├── types/           # Types TypeScript
│       │   └── utils/           # Helpers (logger, roleAccess)
│       └── package.json
├── scripts/                     # Scripts de dev (dev.js)
├── Dockerfile                   # Build multi-étapes (frontend + backend)
├── compose.local.yml            # Docker Compose local (PostgreSQL + app)
├── package.json                 # Root workspace
└── .prettierrc                  # Config Prettier
```

## Commandes utiles

### Installation

```bash
npm install --workspaces --include-workspace-root
```

### Développement

```bash
# Backend (port 3001)
npm run dev:backend

# Frontend (port 5173)
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

### Build & production

```bash
npm run build                   # Build tous les workspaces
npm run frontend:build          # Build frontend uniquement
```

### Qualité de code

```bash
npm run lint                    # Lint tous les workspaces
```

### Docker

```bash
docker compose -f compose.local.yml up -d   # Démarrer l'environnement local
docker compose -f compose.local.yml down     # Arrêter
```

## Conventions de code

### Backend (JavaScript ESM)

- Architecture **Controller → Service → Model** (pas d'ORM, Knex query builder)
- Fichiers en **PascalCase** pour controllers, services, models (ex: `CoproprieteController.js`)
- Routes en **kebab-case** (ex: `parties-communes.js`, `cles-repartition.js`)
- API préfixée `/api/` (ex: `/api/coproprietes`, `/api/lots`)
- Pas de point-virgule, single quotes, indentation 2 espaces (Prettier)
- Modèles : fonctions pures prenant `knex` en paramètre ou utilisant `req.db`

### Frontend (TypeScript)

- Pages en **PascalCase** suffixées `Page` (ex: `CoproprietesPage.tsx`)
- Composants UI via **shadcn/ui** (Radix + TailwindCSS) dans `components/ui/`
- Hooks custom pour chaque entité (ex: `useCoproprietes.ts`) wrappant React Query
- API calls dans `api/` (fonctions fetch typées)
- State management : **Zustand** pour l'auth, **React Query** pour les données serveur
- Routing : `react-router-dom` v7 avec `createHashRouter`
- Validation formulaires : **React Hook Form** + **Zod**

### Git

- Messages de commit en anglais, préfixés : `feat:`, `fix:`, `refactor:`, `docs:`, etc.
- Branche principale : `main`

## Variables d'environnement

Voir `apps/backend/.env.example`. Variables requises :

- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (ou `POSTGRES_URI`)
- `BETTER_AUTH_SECRET` — Secret pour Better Auth
- `BASE_URL` — URL frontend (CORS + auth)
- `PORT` — Port du backend (défaut : 3001)

## Points d'attention

- Le backend utilise `--env-file=.env` (fonctionnalité native Node.js 24, pas dotenv)
- Les migrations s'exécutent automatiquement au démarrage du serveur
- En production, le backend sert les fichiers statiques du frontend depuis `/frontend-dist`
- L'authentification utilise Better Auth (email/mot de passe)
- Le frontend utilise un `HashRouter` (URLs avec `#`)
