# Spike — coût de l'open banking pour la réconciliation bancaire

> Date : 2026-07-16 — spike de décision pour l'issue #133.
> Objectif : décider d'un modèle de tarification **avant** toute promesse de
> réconciliation bancaire automatique. Les montants ci-dessous sont des
> **ordres de grandeur [hypothèse]** à confirmer par des devis fournisseurs.

## 1. Le problème structurel

La réconciliation bancaire automatique suppose de connecter le(s) compte(s)
bancaire(s) de chaque copropriété via un agrégateur DSP2. Or, en copropriété :

- Chaque syndicat a (doit avoir) son **propre compte séparé** (art. 18 loi 1965).
- Un cabinet gérant 20 copropriétés = **20 connexions** bancaires distinctes.
- Ces comptes sont souvent dans des **banques mutualistes régionales** (Crédit
  Agricole, Crédit Mutuel, Banque Populaire, Caisse d'Épargne), dont la
  couverture et la stabilité DSP2 sont **inégales**.

Conséquence : le coût open banking scale avec le **nombre de comptes**, pas avec
le nombre de clients payants. C'est la variable qui peut détruire la marge.

## 2. Modèles de prix des agrégateurs (ordres de grandeur [hypothèse])

| Fournisseur | Modèle typique | Ordre de grandeur [hypothèse] |
|---|---|---|
| **Powens** (ex-Budget Insight) | Abonnement + prix par connexion active/mois | ~0,5–2 € / connexion / mois + palier d'entrée |
| **Bridge** (Bankin') | Par utilisateur/connexion actif/mois | ~0,5–2 € / connexion / mois |
| **Tink / GoCardless** | Par compte connecté ou par appel | Variable, souvent minimum mensuel élevé |

> ⚠️ Tous ces chiffres sont des estimations issues de connaissances générales
> (cutoff jan. 2026) et **doivent être remplacés par des devis réels** — les
> grilles B2B sont négociées et rarement publiques.

## 3. Impact sur la marge — simulation

Hypothèses de travail : coût moyen **1 €/connexion/mois** [hypothèse].

| Profil client | Comptes connectés | Coût OB/mois | Prix plan | Reste avant autres coûts |
|---|---|---|---|---|
| Bénévole Essentiel (1 copro) | 1 | ~1 € | 19 € | 18 € |
| Cabinet Pro (20 copros) | 20 | ~20 € | 49 € + 3 €/copro au-delà de 20 | tendu |
| Cabinet Entreprise (50 copros) | 50 | ~50 € | 149 € + 2 €/copro | à surveiller |

Lecture : sur le **plan Pro à 49 €** couvrant jusqu'à 20 copropriétés, 20
connexions à 1 € consomment **~40 % du prix** avant tout autre coût (hébergement,
support, Stripe). À 2 €/connexion, le plan Pro devient **non margé**. Le
dépassement facturé (+3 €/copro) aide mais ne couvre pas les 20 premières.

## 4. Couverture DSP2 — risque qualité

- Les banques mutualistes régionales exposent des API DSP2 hétérogènes ;
  reconnexions fréquentes (ré-authentification forte tous les 90–180 jours),
  taux d'échec plus élevé.
- Une réconciliation « automatique » qui casse tous les 3 mois génère du support
  et détruit la confiance — l'inverse de l'argument de vente.

## 5. Options de tarification

| Option | Principe | Effet |
|---|---|---|
| **A. Add-on par compte connecté** | Facturer explicitement la connexion bancaire (p.ex. +2 €/compte/mois). | Aligne prix et coût ; transparent ; friction commerciale. |
| **B. Inclure N connexions, facturer au-delà** | X connexions incluses par plan, dépassement facturé. | Simple à comprendre ; risque si N mal calibré. |
| **C. Réconciliation semi-manuelle (import)** | Pas d'agrégateur : import de relevés (CSV/CAMT.053) + matching assisté. | Coût marginal nul ; moins « magique » mais margé et sans dépendance DSP2. |
| **D. Repousser l'auto-réconciliation** | Livrer d'abord le suivi manuel des mouvements (déjà en base : `mouvements_bancaires`). | Zéro coût OB ; valide le besoin avant d'investir. |

## 6. Recommandation

1. **Ne pas promettre la réconciliation bancaire automatique** tant que des devis
   Powens/Bridge réels ne sont pas obtenus (claim déjà retiré en #118).
2. Démarrer par **l'option C/D** (import de relevés + matching assisté sur la
   table `mouvements_bancaires` existante) : coût marginal nul, pas de dépendance
   DSP2, valide l'appétence.
3. Si l'automatisation est retenue plus tard, la facturer en **add-on par compte
   connecté (option A)** pour protéger la marge du plan Pro.
4. Chiffrer la couverture DSP2 réelle des 4–5 banques mutualistes dominantes chez
   les cibles avant tout engagement.

## 7. Suite

- [ ] Obtenir 2 devis (Powens, Bridge) avec grille par connexion.
- [ ] Tester la couverture DSP2 sur un échantillon de comptes de syndicats réels.
- [ ] Décider A vs C définitivement et mettre à jour la grille tarifaire.
