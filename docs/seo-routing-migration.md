# Routing SEO — état de la migration BrowserRouter

> Date : 2026-07-16 — état pour l'issue #134.

## Constat : la migration du routeur est déjà faite

Contrairement à ce qu'indiquaient CLAUDE.md / AGENT.md (corrigés dans ce même
changement), le frontend **utilise déjà `createBrowserRouter`** (URLs propres,
sans `#`) :

- `apps/frontend/src/routes/index.tsx` → `createBrowserRouter([...])`.
- Le backend sert déjà un **fallback SPA** : toute requête GET non-API retourne
  `index.html` (`apps/backend/src/index.js`), condition nécessaire pour que le
  rafraîchissement d'un lien profond (`/dashboard`) fonctionne.

## Ce que corrige ce changement

Des liens résiduels utilisaient encore la syntaxe hash `#/…`, **cassée** sous
BrowserRouter (interprétée comme un fragment, pas une navigation). Corrigés :

| Fichier | Avant | Après |
|---|---|---|
| `components/subscription/PlanGuard.tsx` | `#/subscription?plan=…` | `/subscription?plan=…` |
| `lib/onboarding.ts` (5 étapes) | `#/coproprietes`, `#/assemblees` | `/coproprietes`, `/assemblees` |
| `pages/extranet/ExtranetLayout.tsx` | `#/` | `/` |
| `pages/CalculateurTantiemesPage.tsx` | `#/login` | `/login` |
| `pages/MentionsLegalesPage.tsx` | `/#/politique-confidentialite` | `/politique-confidentialite` |

Documentation mise à jour (CLAUDE.md, AGENT.md) : `createBrowserRouter` + fallback.

## Ce qui reste : le prerender de la landing

Le second volet de #134 — **prérendre / SSG la landing publique** pour
l'indexation — n'est pas fait. Pistes :

1. `vite-plugin-prerender` / `vite-ssg` sur les routes publiques (`/`,
   `/securite`, `/politique-confidentialite`, `/vs/logiciels-traditionnels`,
   `/calculateurs/*`, `/outils/*`).
2. Générer un HTML statique par route publique au build, servi par le fallback
   existant.
3. Vérifier que `SEOHead` (déjà en place) émet bien les balises dans le HTML
   prérendu.

Ce volet mérite sa propre PR (changement de build + vérification du rendu). #134
reste ouverte pour le prerender uniquement.
