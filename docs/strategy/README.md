# Stratégie CoproPilot — série de trois documents

**Date : 16 juillet 2026 — Documents de travail internes, confidentiels.**

Cette série a été produite par un processus multi-agents : 7 rapports de recherche (inventaire produit et pricing extraits du dépôt, taille de marché, concurrence, personas/canaux et analogues open-core sourcés par recherche web), un rédacteur par document, puis une revue adverse (« devil's advocate ») par deux critiques indépendants — un investisseur early-stage sceptique et un opérateur métier (gestionnaire de copropriété / éditeur concurrent) — dont les objections retenues sont intégrées et archivées en fin de chaque document (section « Objections et réponses »).

## Les trois documents

| # | Document | Question à laquelle il répond |
|---|---|---|
| 1 | [`analyse-marche.md`](analyse-marche.md) | **Marketing & marché** — quelle est la taille réelle du marché, qui sont les concurrents, quel positionnement et quel pricing ? |
| 2 | [`product-market-fit.md`](product-market-fit.md) | **Product-market fit** — où en est le produit, quel beachhead, quelles hypothèses valider et avec quel protocole ? |
| 3 | [`go-to-market.md`](go-to-market.md) | **Go-to-market** — quel plan d'exécution à 0-90 jours / 3-6 mois / 6-18 mois, quels canaux, quel funnel, quel budget ? |

## Chiffres de référence partagés (à date)

Le chiffrage canonique du marché est celui d'`analyse-marche.md` §2.3 (construction bottom-up) ; les deux autres documents s'y réfèrent :

- **Marché total** : ~620 000 copropriétés immatriculées au RNIC ; 250-300K en gestion bénévole ou sans syndic déclaré (chiffre brut, majoritairement des micro-copros dormantes).
- **SAM** : 30-50K copropriétés bénévoles actives digitalisables + 2-4K cabinets < 20 copros [hypothèse, chantier data à faire].
- **Cœur beachhead** (PMF) : 15-40K copros bénévoles actives de 8-20 lots [hypothèse].
- **SOM 3 ans, scénario central** : 300-700 comptes payants, 100-250 K€ ARR (organique pur) ; scénario haut ~500 K€ ARR conditionné au mur freemium réparé et à la distribution partenariale.
- **Objectif M+18 (GTM)** : ~150 clients payants, ~4,5 K€ MRR en scénario central.
- **Pricing** : Gratuit 0 € / Essentiel 19 € / Pro 49 € / Entreprise 149 €/mois — le 149 € est confirmé, `docs/open-core-strategy.md` (99 €) est à mettre à jour.

## Décisions bloquantes identifiées (consensus des trois documents)

1. **Valider le terrain avant d'exécuter** : interviews de syndics bénévoles + chiffrage bottom-up du SAM sous 30 jours ; roadmap gelée au-delà du sprint 2 tant que ce n'est pas fait.
2. **Réparer le mur freemium** : la limite « 20 lots » affichée n'existe pas dans le code, et des features vendues en Pro (réconciliation bancaire, SSE, cash flow) ne sont pas gatées par `requirePlan`.
3. **Corriger les claims marketing juridiquement risqués** : abandonner « 10x moins cher » (art. L122-1 code de la consommation) et « AG conforme » tant que la LRE n'est pas intégrée ; aligner les promesses de la landing sur les features réellement implémentées.
4. **Prioriser la reprise de gestion** (import balance + soldes, art. 18-2) comme prérequis produit n°1 — c'est le mur d'adoption, avant toute feature nouvelle.
