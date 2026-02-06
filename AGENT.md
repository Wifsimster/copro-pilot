# AGENT.md — ImmoIA

## Objectif du projet

ImmoIA est une plateforme de gestion de copropriété pour syndics professionnels. Le projet est un monorepo Node.js avec un backend Express (API REST) et un frontend React (SPA). L'objectif est de couvrir l'ensemble des besoins d'un syndic : gestion des immeubles, copropriétaires, comptabilité, assemblées générales et travaux.

## Structure monorepo

```
apps/backend/    → API Express (JavaScript ESM, Knex, PostgreSQL)
apps/frontend/   → SPA React (TypeScript, Vite, TailwindCSS)
scripts/         → Scripts utilitaires (dev.js)
```

Les workspaces sont gérés via npm workspaces (définis dans le `package.json` racine).

## Commandes essentielles

```bash
# Installation
npm install --workspaces --include-workspace-root

# Dev
npm run dev:backend              # Backend Express (port 3001)
npm run dev:frontend             # Frontend Vite (port 5173)

# Build
npm run build                    # Build tous les workspaces
npm run frontend:build           # Build frontend uniquement

# Base de données
cd apps/backend
npm run migrate:latest           # Appliquer les migrations
npm run migrate:rollback         # Annuler la dernière migration
npm run migrate:make -- <name>   # Créer une nouvelle migration
npm run seed:run                 # Exécuter les seeds
npm run db:reset                 # Reset complet (rollback + migrate + seed)

# Lint
npm run lint                     # Lint tous les workspaces

# Docker
docker compose -f compose.local.yml up -d
```

## Conventions à respecter

### Architecture backend

- Pattern **Controller → Service → Model**
- Controllers : reçoivent `req/res`, appellent le service, renvoient la réponse JSON
- Services : logique métier, appellent les modèles
- Models : requêtes Knex (pas d'ORM), fonctions pures
- Nommage fichiers : PascalCase pour controllers/services/models, kebab-case pour routes
- Routes montées sous `/api/` dans `routes/index.js`

### Architecture frontend

- Une page par fichier dans `pages/` (suffixe `Page.tsx`)
- Hooks custom dans `hooks/` (un hook par entité, wrappant React Query)
- API calls dans `api/` (fonctions fetch typées)
- Composants UI : shadcn/ui (Radix + Tailwind) dans `components/ui/`
- Composants feature dans `components/<feature>/`
- Types dans `types/index.ts`
- Routing via `react-router-dom` v7 (`createHashRouter`)

### Style de code

- Pas de point-virgule
- Single quotes
- Indentation : 2 espaces
- Trailing comma : es5
- Print width : 80

### Git

- Messages de commit en anglais, préfixés (`feat:`, `fix:`, `refactor:`, `docs:`)
- Branche principale : `main`

## Workflow de développement

1. Créer une branche depuis `main`
2. Développer et tester localement
3. Lancer le lint (`npm run lint`)
4. Committer avec un message préfixé
5. Ouvrir une Pull Request vers `main`

## Notes importantes pour les modifications automatisées

### À toujours faire

- Créer une migration Knex pour tout changement de schéma de base de données
- Mettre à jour `routes/index.js` lorsqu'une nouvelle route est ajoutée
- Ajouter les types TypeScript dans `types/index.ts` pour chaque nouvelle entité
- Respecter le pattern Controller → Service → Model pour chaque nouveau module backend
- Utiliser React Query (via un hook custom) pour les données serveur côté frontend

### À ne jamais faire

- Ne pas modifier directement le schéma en base de données (toujours passer par une migration)
- Ne pas utiliser `dotenv` — le backend utilise `--env-file=.env` natif Node.js 24
- Ne pas créer de fichiers en `CommonJS` (`require/module.exports`) — tout est en ESM
- Ne pas stocker de secrets dans le code source
- Ne pas modifier les fichiers `components/ui/` (générés par shadcn/ui)

### Fichiers critiques

- `apps/backend/src/index.js` — Point d'entrée du serveur, middleware, initialisation
- `apps/backend/src/routes/index.js` — Registre central de toutes les routes
- `apps/backend/src/config/auth.js` — Configuration Better Auth + Microsoft OAuth
- `apps/backend/src/config/knexfile.js` — Configuration de connexion à PostgreSQL
- `apps/frontend/src/routes/index.tsx` — Définition de toutes les routes frontend
- `apps/frontend/src/types/index.ts` — Types TypeScript partagés
