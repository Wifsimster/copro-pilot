# Décisions stratégiques actées — CoproPilot

> Date : 2026-07-16 — **journal de décisions**. Ces décisions sont *prises*, pas proposées.
> Contexte : CoproPilot est piloté comme un **produit agentique autonome**. Il n'y a **pas d'équipe humaine** pour conduire des entretiens terrain, tenir un stand, négocier des partenariats ou démarcher des concurrents. Toute la stratégie est donc reconstruite autour de ce qui est **100 % exécutable sans travail humain externe** : produit self-service, SEO programmatique, contenu, et instrumentation. Les décisions ci-dessous résolvent les issues #158-#163.

## D0 — Contrainte opératoire fondatrice (cascade sur tout le reste)

**Aucune acquisition ne peut dépendre d'un travail humain externe.** Sont **retirés du plan** (non exécutables de façon autonome) :

- entretiens terrain, panels, recrutement d'interviewés → remplacés par l'**instrumentation produit + micro-sondages in-app** (D2) ;
- stand salon ARC, partenariats ARC/ANCC comme dépendance → **optionnels, jamais bloquants** (D6) ;
- vente sales-led du segment pro (P3), founder calls → **P3 gelé** (D1) ;
- négociation d'un partenariat assurance RC → **abandonné comme axe** ; on garde le *messaging* RC qu'on peut livrer par produit (D2) ;
- demande manuelle de devis concurrents → remplacée par la **veille tarifaire web** déjà faite (D5).

Canaux retenus (autonomes) : **product-led (freemium + extranet), SEO programmatique, contenu réglementaire daté, listings comparateurs, open-source/communauté.**

## D1 — Financement : bootstrap, définitif (issue #158)

**Décision : bootstrap strict. Le build pro est gelé.**

- Le modèle financier (`financial-model.md`) montre qu'au scénario central, entreprendre le socle pro complet (moteur décret 2005-240, comptes séparés, EBICS) rend le cumul 3 ans déficitaire de ~170 k€. Sans processus de levée humain (exclu par D0) et sans demande pro validée, **on ne finance pas ce build**.
- **Build autorisé : rangs 0-4 uniquement** (instrumentation/fixes, reprise de gestion, compta *simplifiée* dérogation, régularisation des charges, LRE). Ce périmètre est réalisable et suffit au beachhead bénévole.
- **Gelé jusqu'à nouvel ordre** : décret 2005-240 complet, comptes séparés multi-comptes, EBICS, état daté, paie, app mobile, assistant IA. Réévaluation *seulement* si le beachhead génère un cash-flow qui les autofinance.
- Trajectoire assumée : **PME rentable ~100-250 k€ ARR**, pas venture. Le segment cabinet (P3) est **fermé** tant que D0 tient (il exige de la vente humaine).

## D2 — Validation : par la donnée produit, pas par des entretiens (issue #159)

Les entretiens étant hors de portée (D0), **la validation se fait par le comportement observé**, ce qui est plus fiable que du déclaratif et entièrement automatisable.

- **Instrumentation** (déjà livrée, #123) : signups, activation, conversion, churn par cause. C'est la source de vérité.
- **Micro-sondages in-app** (1 question, non bloquants) pour la willingness-to-pay et la douleur n°1 — remplacent les interviews et le Van Westendorp en salle.
- **Hypothèses tranchées par défaut, faute d'entretiens** :
  - **H1 (job juridique = douleur n°1)** : *actée comme vraie* — la peur de la responsabilité personnelle et de l'annulation d'AG est structurelle et documentée ; le produit et le message mènent avec « on borne votre risque » (garde-fous délais/majorités, alertes de conformité).
  - **Assurance RC packagée** : *abandonnée* comme axe (non négociable sans humain, réplicable). On conserve uniquement le *messaging* RC livrable par produit.
  - **Circuit de décision (perso vs vote AG)** : *acté* à deux vitesses ; le kit « résolution AG » (déjà livré, #128) répond au cas du vote.

## D3 — Pricing : repositionnement face à Vilogi (issues #159/pricing)

**Fait nouveau (veille web 07/2026)** : Vilogi propose son offre syndic bénévole **à partir de 10 € HT/mois (~120 €/an)**, extranet et modules inclus ([logiciels.pro](https://www.logiciels.pro/vilogi/)) ; LogicielSyndic est à **99 €/an** ; Matera à **~10-15 €/lot/mois** (1 500-2 500 €/an pour 20 lots, [Matera](https://matera.eu/fr/syndic-tarifs)). **CoproPilot Essentiel à 228 €/an est ~2× le prix des logiciels bénévoles concurrents, sans différenciateur livré.**

**Décision (révisée — voir D7) : maintenir la grille publiée (19 €/mois, 144 €/an en annuel).** Le différenciateur n'est ni le prix ni le nombre de features, mais **l'expérience** : une application moderne, responsive et **guidée par les workflows** face à des outils legacy (Vilogi, LogicielSyndic) qui alignent des fonctionnalités. Cette expérience *est déjà livrée* et justifie un premium sur les logiciels bénévoles — on ne s'aligne pas par le bas sur les 120 €/an de Vilogi.
- **Gratuit** conservé comme fer de lance et dé-risqueur d'essai (personne d'autre n'offre un cloud gratuit crédible — avantage périssable, à exploiter vite).
- Pro (49 €) / Entreprise (149 €) : inchangés mais **non commercialisés** tant que P3 est fermé (D1).
- *Conséquence* : **pas de changement de prix live à faire** — la grille production actuelle (19/49/149) est conservée. L'ancienne piste « prix de lancement 144 €/an » est abandonnée : baisser le prix reviendrait à concéder que la valeur est équivalente à celle de Vilogi, ce qui est faux.

## D4 — Sizing SAM : chiffré depuis les données publiques (issue #160)

Faute d'extraction RNIC dédiée mais avec les données publiques disponibles, **le SAM est acté à des valeurs de travail** (remplacent les fourchettes) :

| Grandeur | Décision | Base |
|---|---|---|
| Marché total | **626 702 copros**, 27,5 M lots (ANAH Q4 2025, [Le Comptoir](https://www.le-comptoir-de-la-copropriete.fr/)) | sourcé |
| Gestion pro | ~48 % (~295 000 copros) | sourcé |
| Bénévoles actifs | ~52 000 ([SimpleSyndic](https://simplesyndic.fr/blog/guide-syndic-benevole)) | sourcé (à recouper) |
| Marché logiciel bénévole équipé | ~30 000 | plancher |
| **SAM bénévole digitalisable** | **~35 000 copros** | 52K actifs × propension d'adoption SaaS ; 30K équipés = plancher |
| **Cœur beachhead 8-20 lots** | **~12 000 copros** | ~30-35 % du SAM (répartition tailles ANAH) |
| Flux annuel « first AG panic » | **~1 000-1 500/an** | pro 8-20 lots (~118K) × résiliation ~12 % × passage bénévole ~8 % |

**Conséquence actée** : le flux « first AG panic » est **trop mince pour porter le funnel seul** → le beachhead cible **les bénévoles installés** en priorité (SEO permanent), la panique d'AG n'étant qu'un moment d'entrée à forte intention. Le TAM narratif « 300K+ » reste abandonné.

## D5 — Concurrence : veille tarifaire actée (issue #161)

Devis humains exclus (D0) ; la veille web tient lieu de référence (à rafraîchir périodiquement) :

| Concurrent | Prix public | Source | Lecture |
|---|---|---|---|
| **Vilogi** (bénévole) | ~10 € HT/mois (~120 €/an), tout inclus | [logiciels.pro](https://www.logiciels.pro/vilogi/) | Riche en fonctionnalités **mais application legacy** (UX datée, pas de guidage). Concurrent de référence sur le prix/features — **pas sur l'expérience** |
| **LogicielSyndic** | 99 €/an (≤ 50 lots) | docs | ancre prix psychologique |
| **Matera** | ~10-15 €/lot/mois ; ~250 €/lot/an (Syndic Local) | [Matera](https://matera.eu/fr/syndic-tarifs) | autre catégorie (plateforme + experts) |
| **Septeo** | devis only | — | marché pro, hors scope (D1) |

**Conséquence** : la carte de positionnement est figée ; les pages `/vs/` (#136) ne citeront que ces prix publics sourcés, jamais un devis inventé. **On ne combat pas Vilogi sur son terrain** (prix ni parité fonctionnelle — imbattable sous 120 €, catalogue mûr). On le combat sur le sien de faiblesse : c'est une **application legacy**. Voir D7.

## D6 — Support & canaux : self-serve et product-led (issues #162, #163)

- **Support des comptes gratuits : self-serve strict** (base de connaissances juridique = actif SEO, communauté). Aucun support humain sur le gratuit — non finançable et non autonome. *Acté.*
- **Partenariats ARC/ANCC : optionnels, jamais une dépendance du plan.** On ne peut pas les engager de façon autonome ; on ne bâtit donc pas dessus. Le risque de désintermédiation devient sans objet puisqu'on ne dépend pas d'eux. *Acté.*
- **Acquisition = product-led + SEO programmatique + contenu réglementaire daté + listings comparateurs + open-source.** Ce sont les seuls canaux qu'un produit autonome exécute sans humain. Priorité SEO : hubs « guide du syndic bénévole », calculateurs (déjà livrés, #135), pages réglementaires datées.

## D7 — Positionnement : application moderne guidée par les workflows, pas un catalogue de features

**Décision : la douve de CoproPilot est l'expérience, pas la parité fonctionnelle.**

Les concurrents bénévoles (Vilogi, LogicielSyndic) sont des **applications legacy** : riches en fonctionnalités, mais des interfaces datées qui *alignent des écrans* et laissent le syndic seul face à la complexité. CoproPilot se différencie sur ce que ces outils ne peuvent pas rattraper vite :

- **Application moderne et responsive** (mobile/desktop) — là où Vilogi est un full-web daté.
- **Guidée par les workflows** : le produit *conduit* le syndic à travers ses actes (première AG, appel de fonds, clôture, reprise de gestion) au lieu de lui présenter des tableaux passifs. Un workflow qui vérifie les délais, les majorités et l'ordre des étapes.
- **Lien direct avec la douleur n°1 (H1)** : le bénévole a peur de l'erreur qui engage sa responsabilité. **Un parcours guidé réduit ce risque — c'est la vraie valeur, pas le nombre de fonctionnalités.** « Vilogi vous donne des fonctions ; CoproPilot vous guide pour ne pas commettre l'erreur qui vous engage. »

**Conséquences actées :**
- **Message** : « la gestion de copropriété moderne et guidée », vs les outils qui « listent des fonctions ». Ne pas se comparer feature-à-feature (on perdrait contre Vilogi) ; se comparer sur l'expérience et le guidage.
- **Prix** : cette expérience justifie le premium (D3 révisé — on garde 19 €, on ne descend pas à 144 €/an).
- **Roadmap (dans le périmètre bootstrap D1)** : prioriser le **moteur de workflows guidés** — c'est le différenciateur, donc l'investissement produit n°1 après les fixes. Le pilier « workflows métier » de `disruptive-roadmap.md` remonte en priorité ; l'onboarding « première AG » (#125, livré) en est la première brique. Chaque acte clé (appel de fonds, régularisation, reprise, AG) doit devenir un workflow guidé, pas un formulaire.

## Récapitulatif des issues

| Issue | Décision |
|---|---|
| #158 Financement | **Bootstrap strict, build pro gelé** (D1) |
| #159 Validation terrain | **Remplacée par instrumentation + micro-sondages** ; H1 actée, RC-assurance abandonnée (D2) |
| #160 SAM | **SAM ~35K / cœur ~12K / flux AG-panic ~1-1,5K/an** ; beachhead = bénévoles installés (D4) |
| #161 Devis concurrents | **Veille web actée** ; Vilogi = référence prix/features **mais legacy** — on se différencie sur l'expérience, pas le prix (D5, D7) |
| #162 Coût du gratuit | **Support self-serve strict** (D6) |
| #163 ARC/ANCC | **Optionnel, non bloquant** ; acquisition product-led + SEO (D6) |

## Ce que ces décisions impliquent, concrètement, pour le produit

Priorité d'ingénierie (autonome, finançable) : **(1)** finir les rangs 0-4 (reprise, compta simplifiée, régularisation, LRE) ; **(2)** le **moteur de workflows guidés** (D7) — le différenciateur face au legacy : transformer chaque acte clé (appel de fonds, régularisation, reprise, AG) en parcours guidé plutôt qu'en formulaire ; **(3)** SEO programmatique + base de connaissances self-serve ; **(4)** micro-sondages in-app. La grille de prix reste inchangée (D3 révisé). Tout le reste (socle pro, IA, partenariats) est **hors scope** tant que D0/D1 tiennent.
