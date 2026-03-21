# Contribuer à CoproPilot

Merci de votre intérêt pour CoproPilot ! Ce guide explique comment contribuer au projet.

## Licence

CoproPilot est distribué sous licence **AGPL-3.0**. En contribuant, vous acceptez que vos contributions soient publiées sous cette même licence.

## Prérequis

- Node.js >= 24
- PostgreSQL 18
- Docker & Docker Compose (optionnel, pour l'environnement local)

## Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/Wifsimster/immo-ia.git
cd immo-ia

# Installer les dépendances
npm install --workspaces --include-workspace-root

# Démarrer PostgreSQL (via Docker)
docker compose -f compose.local.yml up -d

# Appliquer les migrations et seeds
cd apps/backend
npm run migrate:latest
npm run seed:run
cd ../..

# Lancer le développement
npm run dev:backend   # Port 3001
npm run dev:frontend  # Port 3000
```

## Structure du projet

```
apps/
├── backend/    # API Express (JavaScript ESM)
└── frontend/   # SPA React (TypeScript)
```

Voir [CLAUDE.md](CLAUDE.md) pour la documentation complète de la structure et des conventions.

## Workflow de contribution

1. **Créer une issue** décrivant le changement proposé (bug, feature, amélioration)
2. **Forker le dépôt** et créer une branche depuis `main`
3. **Nommer la branche** selon le type : `feat/description`, `fix/description`, `refactor/description`
4. **Implémenter** en suivant les conventions ci-dessous
5. **Tester** : `npm run test` (tous les workspaces)
6. **Ouvrir une Pull Request** vers `main`

## Conventions de code

### Formatage

Le projet utilise Prettier (pas de point-virgule, single quotes, 2 espaces). Lancez `npm run lint` avant de committer.

### Commits

Ce projet utilise **Conventional Commits** et **Semantic Release**. Chaque commit doit suivre le format :

```
<type>(<scope>): <description>
```

Types courants : `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`

Exemples :
```bash
feat(frontend): add export to CSV for coproprietes list
fix(backend): prevent duplicate entries in charges table
docs: update API documentation for incidents module
```

Voir [CLAUDE.md](CLAUDE.md#git--conventional-commits--semantic-release) pour les règles complètes.

### Backend (JavaScript ESM)

- Architecture : **Controller → Service → Model** (pas d'ORM, Knex query builder)
- Fichiers en PascalCase (controllers, services, models)
- Routes en kebab-case, préfixées `/api/`
- Tout en ESM (`import/export`) — jamais de `require`

### Frontend (TypeScript)

- Pages suffixées `Page` (ex: `CoproprietesPage.tsx`)
- Composants feature dans `components/<feature>/`
- **Ne pas modifier** les fichiers `components/ui/` (générés par shadcn/ui)
- Hooks custom dans `hooks/` wrappant React Query
- TypeScript strict mode

## Tests

```bash
npm run test                                    # Tous les workspaces
npm run test --workspace=@copro-pilot/backend   # Backend uniquement
npm run test --workspace=copro-pilot-frontend   # Frontend uniquement
```

## Signaler un bug

Ouvrez une [issue GitHub](https://github.com/Wifsimster/immo-ia/issues) avec :
- Description du problème
- Étapes pour reproduire
- Comportement attendu vs observé
- Environnement (navigateur, OS)

## Code de conduite

Soyez respectueux et constructif. Toute forme de harcèlement ou de discrimination est inacceptable.
