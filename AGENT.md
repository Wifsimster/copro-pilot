# AGENT.md — CoproPilot

## Objectif du projet

CoproPilot est une plateforme de gestion de copropriété pour syndics professionnels. Le projet est un monorepo Node.js avec un backend Express (API REST) et un frontend React (SPA). L'objectif est de couvrir l'ensemble des besoins d'un syndic : gestion des immeubles, copropriétaires, comptabilité, assemblées générales et travaux.

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
- Routing via `react-router-dom` v7 (`createBrowserRouter`)

### Style de code

- Pas de point-virgule
- Single quotes
- Indentation : 2 espaces
- Trailing comma : es5
- Print width : 80

### Git — Conventional Commits & Semantic Release

Ce projet utilise **Semantic Release** pour automatiser le versioning. Les commits sur `main` sont analysés pour déterminer automatiquement le numéro de version. **Respecter scrupuleusement le format Conventional Commits est obligatoire.**

#### Format obligatoire

```
<type>(<scope>): <description>
```

- **Langue :** anglais
- **Description :** impérative, minuscule, sans point final
- **Scope (optionnel) :** `backend`, `frontend`, `auth`, ou nom du module

#### Types et impact sur le versioning

| Type | Quand l'utiliser | Release déclenchée |
|---|---|---|
| `feat` | Nouvelle fonctionnalité | **minor** (1.x.0) |
| `fix` | Correction de bug | **patch** (1.0.x) |
| `perf` | Amélioration de performance | **patch** (1.0.x) |
| `refactor` | Restructuration sans changement fonctionnel | aucune |
| `docs` | Documentation uniquement | aucune |
| `style` | Formatage uniquement | aucune |
| `test` | Ajout ou modification de tests | aucune |
| `build` | Système de build, dépendances | aucune |
| `ci` | Configuration CI/CD | aucune |
| `chore` | Maintenance, tâches diverses | aucune |

#### Breaking changes (release majeure)

Ajouter `BREAKING CHANGE:` dans le footer ou `!` après le type :

```
feat(api)!: change coproprietes response format

BREAKING CHANGE: endpoint now returns paginated object instead of array.
```

#### Exemples

```bash
feat(frontend): add CSV export for coproprietes list    # → minor
fix(backend): prevent duplicate charges entries          # → patch
refactor(backend): extract shared validation helper      # → no release
docs: update API documentation for incidents             # → no release
test(frontend): add tests for useAssemblees hook         # → no release
chore: upgrade vite to v7.1                              # → no release
```

#### Règles strictes

- Un commit = un changement logique unique
- Ne pas omettre le type (ex: `update model` est invalide → `refactor: update model`)
- Ne pas utiliser le passé (`feat: added` → `feat: add`)
- Ne pas mettre de majuscule à la description
- Ne pas mettre de point final à la description
- Utiliser le bon type : un bugfix = `fix:`, pas `feat:` ; une feature = `feat:`, pas `fix:`

## Workflow de développement

1. Créer une branche depuis `main`
2. Développer et tester localement
3. Lancer le lint (`npm run lint`)
4. Committer avec un message au format Conventional Commits
5. Ouvrir une Pull Request vers `main`
6. Au merge sur `main` : Semantic Release analyse les commits et publie automatiquement une release si nécessaire

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
