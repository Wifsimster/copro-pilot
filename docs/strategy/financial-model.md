# Modèle financier 3 ans & décision de financement — CoproPilot

> Date : 2026-07-16 — livrable des issues **#158** (P&L 3 ans + arbitrage bootstrap/levée) et **#162** (coût de servir le gratuit).
> **Tous les chiffres marqués [H] sont des hypothèses de travail** dérivées des documents stratégie (`analyse-marche.md`, `product-market-fit.md`, `go-to-market.md`) et de leur revue (PR #157). Ce modèle ne contient **aucune donnée réelle constatée** : il se recalcule dès que le funnel est instrumenté (#123), les interviews faites (#159) et le SAM chiffré (#160).

## 1. Hypothèses de base (issues de la revue)

| Paramètre | Valeur centrale | Source |
|---|---|---|
| ARPU (mix ~90 % Essentiel / 8 % Pro / 2 % Entreprise) | ~20 € (an 1) → ~24 € (M+18) → ~28 € (an 3) | `go-to-market.md` §5 (corrigé PR #157) |
| Churn mensuel | 3,5 % (an 1), 3 % (an 2-3) | idem |
| LTV brute (ARPU 24 € / churn 3,5 %) | ~690 € (~480 € en marge [H]) | revue §6.1 |
| Conversion payante (base *activée*) | 3 → 5 % | funnel §5 |
| Part de comptes gratuits | ~90 % du parc | §4.1 |
| Budget GTM cash 18 mois | ~51,5 k€ | §6 |

## 2. Funnel → parc payant (scénario central)

| | M+6 | M+12 (fin an 1) | M+18 | M+24 (fin an 2) [H] | M+36 (fin an 3) [H] |
|---|---|---|---|---|---|
| Signups cumulés (~) | 700 | 3 000 | 8 500 | 16 000 | 34 000 |
| **Payants (cumul, net de churn)** | 12 | 55 | 150 | ~230 | ~380 |
| ARPU moyen | 20 € | 21 € | 24 € | 26 € | 28 € |
| **MRR fin de période** | ~250 € | ~1 150 € | ~3 600 € | ~6 000 € | ~10 600 € |
| **ARR fin de période** | 3 k€ | 14 k€ | 43 k€ | 72 k€ | **~127 k€** |

Le parc payant an 3 (~380) et l'ARR (~127 k€) tombent dans la fourchette SOM centrale du doc 1/3 (**300-700 payants, 100-250 k€ ARR**). Cohérent.

## 3. P&L 3 ans — scénario central

Revenu annuel ≈ MRR moyen sur l'année × 12.

| (k€) | An 1 | An 2 | An 3 | Cumul 3 ans |
|---|---|---|---|---|
| **Revenu** | ~6 | ~36 | ~94 | **~136** |
| GTM cash (SEO freelance, salon, partenariats, outils, juriste, SEA) | 30 | 25 | 20 | 75 |
| Conformité & juridique (RGPD 15 + audit paiement 3 + claims 4) | 22 | — | — | 22 |
| **Coût de servir le gratuit** (§5) | 3 | 12 | 25 | 40 |
| **Build produit** (voir §4) | 60 | 70 | 40 | 170 |
| **Total coûts** | 115 | 107 | 85 | **307** |
| **Résultat** | **−109** | **−71** | **+9** | **−171** |

> Lecture : même en atteignant le SOM central, le cumul 3 ans est **déficitaire de ~170 k€** *si le build pro complet est entrepris*. Le point mensuel de rentabilité (hors amortissement du build) n'arrive qu'en fin d'an 3. **Le revenu beachhead ne finance pas le build pro sur 3 ans.**

### Sensibilité
- **Scénario bas** (conversion 1,5-2 %, ~70 payants M+18, ~180 an 3) : ARR an 3 ~60 k€, cumul revenu 3 ans ~85 k€ → déficit ~220 k€ avec build complet.
- **Scénario haut** (conversion 6 %, ARPU tiré P3 ~40 €, ~600 payants an 3) : ARR an 3 ~290 k€, cumul revenu ~230 k€ → quasi-équilibre sur 3 ans *seulement* si build étalé et P3 monétisé tôt — le cas le plus favorable ne rembourse le build qu'au-delà de 3 ans.

## 4. Le poste décisif : le coût du build

Pour ouvrir l'expansion d'ARPU (P3, seul levier qui redresse l'économie unitaire), il faut : reprise de gestion, LRE, **moteur comptable décret 2005-240 (2-3 trimestres)**, comptes séparés multi-comptes, RGPD. Soit **~4-6 trimestres-ingénieur en domaine régulé**.

Valorisation [H] : 1 trimestre-ingénieur *fully loaded* ≈ 25-30 k€ → **build ≈ 120-180 k€** sur 3 ans (ligne « Build produit » ci-dessus, ~170 k€). C'est le poste qui bascule le P&L dans le rouge, et il est **incompressible si l'on veut le segment pro**.

## 5. Coût de servir le gratuit (issue #162)

Le persona gratuit (bénévole non-comptable, questions juridiques/comptables) est le profil de support le plus high-touch. « Coût marginal nul » est **faux**.

| Poste | Coût unitaire /compte gratuit /mois [H] | À M+36 (~30 000 gratuits) |
|---|---|---|
| Hébergement + stockage documents | 0,05-0,15 € | 1,5-4,5 k€/mois |
| Emails transactionnels | 0,02-0,05 € | 0,6-1,5 k€/mois |
| Support (si non self-serve) | **explosif** | à éviter absolument |

**Politique actée (à confirmer) : support des comptes gratuits en self-serve only** (base de connaissances juridique = actif SEO, communauté). Le CSM mi-temps fait l'onboarding des *payants* + nurturing AG, jamais le support des gratuits. Sans cette règle, quelques milliers de comptes gratuits rendent le freemium insoutenable. Coût unitaire réel à mesurer sur les 2 premières cohortes (dépend de #123).

## 6. Économie unitaire

| Métrique | Valeur [H] | Commentaire |
|---|---|---|
| LTV brute | ~690 € | ARPU 24 € ÷ churn 3,5 %/mois |
| LTV marge | ~480 € | après coût de servir |
| CAC cash cible | < 230 € | payback < 12 mois |
| **LTV/CAC régime** | **~2:1** | mince ; sain = 3:1 |
| CAC fully loaded (amorçage) | plusieurs k€ | temps interne valorisé, ~12 payants sur 0-6 mois |

À churn 3,5 %/mois, **l'économie unitaire est structurellement mince quel que soit le CAC**. Deux seuls leviers : (a) baisser le churn en rattachant le compte à la *copropriété* (passation de mandat intégrée) ; (b) monter l'ARPU via P3 — ce qui ramène au coût du build.

## 7. Décision : bootstrap discipliné vs levée

Le modèle impose un choix explicite **avant tout démarrage du build pro**.

| | **A. Bootstrap discipliné** | **B. Levée d'amorçage** |
|---|---|---|
| Principe | Rester sur le beachhead bénévole (Essentiel). Ne bâtir le socle pro (décret complet, comptes séparés, EBICS) **qu'une fois financé par le cash-flow ou une demande entrante payante avérée** (critères go/no-go du doc 2/3 §7) | Financer le socle pro par un tour d'amorçage |
| Build entrepris | Rangs 0-4 seulement (reprise, compta *simplifiée* dérogation, régularisation, LRE) — ~2-3 trimestres, pas le décret complet | Socle complet, calendrier accéléré |
| Cash requis 3 ans | ~50-90 k€ (GTM + conformité + build réduit) | ~300-500 k€ |
| Récit | PME rentable 100-250 k€ ARR | Trajectoire venture — **exige** le TAM/expansion chiffré (ARPU cabinet, adjacences LRE/assurance/open banking) du doc 1/3 §2.3, **non encore fait** |
| Risque | Croissance lente ; fenêtre concurrentielle (Matera) | Dilution ; obligation de scaler un marché de 15-30 M€ de TAM monétisable |

**Recommandation (à trancher par l'équipe, pas par ce document) : bootstrap-first.**
- Le scénario central ne finance pas un build pro régulé sur 3 ans ; s'endetter en ingénierie décret 2005-240 / comptes séparés **avant** d'avoir prouvé le PMF beachhead et mesuré la conversion serait engager 120-180 k€ sur une demande postulée.
- Séquence proposée : (1) prouver le PMF beachhead avec le build réduit (rangs 0-4) et le funnel instrumenté ; (2) ne déclencher le build pro (option B / levée) **que** si les critères go/no-go §7 du doc 2/3 sont remplis **et** que le récit d'expansion venture est chiffré.
- Une levée reste ouverte, mais **après** la preuve, pas avant — le TAM monétisable (15-30 M€) peut porter un récit venture, à condition de documenter l'expansion, ce qui est un livrable distinct (dépend de #160, #161).

## 8. Ce qu'il reste à faire pour fiabiliser ce modèle

Ce P&L est un **cadre**, pas une prévision. Il se durcit avec :
- #123 (funnel instrumenté) → conversion, activation, churn réels ;
- #159 (interviews + Van Westendorp) → ARPU et willingness-to-pay réels ;
- #160 (SAM bottom-up) → parc adressable et flux « first AG panic » ;
- #161 (devis concurrents) → pricing défendable ;
- chiffrage dev du socle (rangs 0-4 vs décret complet) par un dev + un expert-comptable copro → coût du build affiné.

**Décision demandée à l'équipe : acter A ou B, et geler le build pro tant que le choix n'est pas fait.**
