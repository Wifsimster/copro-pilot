# Modèle de sizing SAM bottom-up — méthodologie & template

> Date : 2026-07-16 — livrable de l'issue **#160**. Ce document fournit la **méthodologie et le template de calcul** ; **les cellules « valeur » sont vides ou marquées [À REMPLIR]** — elles ne peuvent l'être qu'avec les données RNIC réelles, que l'équipe doit extraire. Aucun chiffre n'est inventé ici.

## Objectif

Remplacer les fourchettes larges [hypothèse] des documents stratégie (SAM « 30-50K », cœur « 15-40K ») par un chiffre **défendable devant un investisseur**, construit de bas en haut à partir du Registre National d'Immatriculation des Copropriétés (RNIC).

## Source de données

- **RNIC / data.gouv.fr** — jeu de données ouvert : <https://www.data.gouv.fr/datasets/registre-national-dimmatriculation-des-coproprietes>
- Variables clés : nombre de lots (tranches), type de syndic (professionnel / bénévole / coopératif / non déclaré), localisation, présence d'un budget voté, date de dernière mise à jour.

## Étape 1 — Croisement taille × type de syndic

Extraire du RNIC le tableau croisé **tranche de lots × type de syndic** :

| Lots \ Type | Pro | Bénévole/coop | Non déclaré | Total |
|---|---|---|---|---|
| 1-10 | [À REMPLIR] | | | |
| 11-50 | | | | |
| 51-200 | | | | |
| 200+ | | | | |
| **Total** | | | | ~620 000 |

## Étape 2 — Filtres de qualification du SAM

Appliquer, ligne à ligne, les filtres d'adressabilité (chaque filtre = une hypothèse à documenter) :

| Filtre | Règle | Justification |
|---|---|---|
| **Activité** | exclure les copros sans budget voté / immatriculation périmée | une copro dormante n'achète pas |
| **Fraction activable des « non déclaré »** | ×10-20 % [H — à affiner via l'activité RNIC] | ~265K bruts, majoritairement micro-copros dormantes (doc 1/3 §2.1) |
| **Taille minimale de besoin** | < 10 lots = compta trésorerie simplifiée (dispense art. 14-3) → besoin partiel | segmenter, ne pas surcompter |
| **Digitalisation** | ×taux d'équipement logiciel réaliste [À REMPLIR — benchmark] | tous les bénévoles actifs ne s'équipent pas |

## Étape 3 — Calcul du SAM et du cœur beachhead

```
SAM bénévole = (bénévoles actifs digitalisables, toutes tailles)
             + (fraction activable des non-déclarés)
Cœur beachhead = sous-ensemble 8-20 lots du SAM bénévole
SAM cabinets   = cabinets < 20 copros insatisfaits [À REMPLIR — autre source]
```

| Résultat | Valeur cible | Statut |
|---|---|---|
| SAM bénévole | [À REMPLIR] | remplace « 30-50K [H] » |
| Cœur beachhead 8-20 lots | [À REMPLIR] | remplace « 15-40K [H] » |
| SAM cabinets | [À REMPLIR] | remplace « 2-4K [H] » |

## Étape 4 — Flux annuel « first AG panic » (dimensionne le funnel)

Le funnel P1 cible la copro qui vient de résilier son syndic pro. Il faut ce **flux annuel**, pas le stock :

```
Flux annuel = (copros 8-20 lots gérées par un pro)
            × (taux de résiliation annuel du syndic)
            × (taux de passage en bénévole après résiliation)
```

| Terme | Source | Valeur |
|---|---|---|
| Copros 8-20 lots en gestion pro | RNIC (étape 1) | [À REMPLIR] |
| Taux de résiliation annuel | ARC/ANCC, études sectorielles | [À REMPLIR] |
| Taux de passage en bénévole | ARC/ANCC | [À REMPLIR] |
| **Flux annuel adressable** | | [À REMPLIR] |

> ⚠️ Décision du doc 2/3 §3.1 : si ce flux est faible (ex. ~3 000/an), le funnel « first AG panic » seul ne suffit pas et le beachhead doit s'élargir aux **bénévoles installés**. À trancher une fois le flux estimé.

## Étape 5 — Input pricing concurrentiel (lien #161)

Le SAM en valeur (€) dépend de l'ARPU, donc des prix réels du marché. **Ne pas figer la carte de positionnement ni l'ARPU concurrentiel sans les 3 devis réels de l'issue #161** (Septeo, Vilogi, Matera). Template de suivi des devis :

| Concurrent | Prix obtenu | Périmètre | Date | Source (devis/URL) |
|---|---|---|---|---|
| Septeo | [À REMPLIR] | | | |
| Vilogi (offre bénévole) | [À REMPLIR] | | | |
| Matera | [À REMPLIR] | | | |

## Livrable de sortie

- Tableau croisé RNIC rempli, SAM et cœur beachhead chiffrés (± fourchette resserrée), flux annuel « first AG panic » estimé.
- Ces valeurs remplacent les [hypothèse] dans `analyse-marche.md` §2.3, `product-market-fit.md` §3.1, `go-to-market.md` §1, et alimentent le modèle financier (#158).

**Effort : ~1 semaine de chantier data (extraction RNIC + 2-3 appels ARC/ANCC pour les taux de résiliation/passage).** À faire avant tout pitch investisseur.
