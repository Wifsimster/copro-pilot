# Product-Market Fit — CoproPilot
**Document de travail interne 2/3 — Équipe fondatrice — Version finale (post-revue devil's advocate)**
*Date : 16 juillet 2026 — Confidentiel — Rédigé sur la base de l'inventaire produit, de l'analyse concurrentielle, des études de marché consolidées et de deux revues contradictoires (investisseur sceptique + opérateur métier)*

---

## Résumé exécutif

CoproPilot est **pre-PMF**, et il faut le dire sans détour : la couverture fonctionnelle est large (58+ routes API, 30+ pages), mais aucune preuve de traction mesurée n'existe — pas de cohortes de rétention, pas de baseline d'usage, et une roadmap construite sur des « Fast Meetings » avec des personas IA plutôt que sur des clients réels (source : `docs/disruptive-roadmap.md` et `docs/meeting-p1-analysis.md`). Le produit est un excellent **candidat au PMF**, pas un produit qui l'a atteint.

Quatre convictions structurent ce document — dont deux ont été substantiellement révisées par la revue contradictoire :

1. **Le beachhead est le syndic bénévole de petite copropriété (persona Marc, ≤ 20 lots), et lui seul.** Le marché est réel (~70 % des copropriétés françaises font moins de 11 lots — [note G. Brisepierre 2022](https://gbrisepierre.fr/wp-content/uploads/2022/10/2022-GBS-note-petites-copro-et-RE-vf.pdf)) et le timing réglementaire est exceptionnel (PPPT généralisé en 2025, DPE collectif < 50 lots en 2026 — [Opéra Énergie](https://opera-energie.com/loi-climat-resilience-coproprietes/)). **Mais le sizing doit être reconstruit bottom-up** : les ~265K copropriétés « sans syndic déclaré » au RNIC sont majoritairement des micro-copros dormantes (2-5 lots, pas de budget voté, pas d'AG) — le segment le moins solvable, pas un réservoir. Elles sortent du discours investisseur (§3.1).

2. **Le gap n°1 vers le PMF n'est pas dans la roadmap disruptive actuelle : c'est la confiance juridique et comptable.** Ce qui fait basculer un bénévole d'Excel vers un SaaS, c'est la peur de l'erreur qui engage sa responsabilité — pas la vitesse au clic. Révision majeure issue de la revue métier : **une part significative du beachhead (syndicats ≤ 5 lots ou budget ≤ 15 000 €, ordonnance 2019-1101) est dispensée de comptabilité en partie double**. La priorité n'est donc pas le décret 2005-240 complet (chantier de 2-3 trimestres minimum, pas de « 2-3 sprints »), mais une **compta simplifiée petites copros** conforme à la dérogation, livrable vite et juridiquement exacte (§5).

3. **Il faut instrumenter avant de construire — mais avec un calendrier honnête.** Avec 5-10 trials organiques/mois, un Sean Ellis à n ≥ 40 « sous 8 semaines » était arithmétiquement impossible. Le protocole révisé (§4.2) découple interviews qualitatives (8 semaines, recrutement actif) et mesures quantitatives (première lecture à J+180, n = 20-25 accepté), et cale la north-star sur le **cycle annuel de la copropriété**, pas sur une fenêtre hebdomadaire qui classerait « churné » un bénévole parfaitement retenu.

4. **Le modèle freemium tel que décrit ne convertit structurellement pas.** Le document initial notait lui-même que ~85 % des bénévoles gèrent < 11 lots ([ANAH](https://www.anah.gouv.fr/anatheque/le-guide-du-syndic-benevole)) : un mur d'upgrade à « 1 copro / 20 lots » ne mord jamais sur la cible cœur (un bénévole a par définition une copropriété). **Le mur d'upgrade doit être redéfini sur la valeur** (LRE, compta au-delà de la dérogation, encaissement en ligne, stockage documentaire), pas sur la taille (§4.1, H2).

Point d'hygiène immédiat, inchangé : **l'incohérence de prix Entreprise (149 €/mois sur la landing — `PricingSection.tsx:90` — vs 99 € dans `docs/open-core-strategy.md:42`) doit être tranchée cette semaine**, de même que la limite « 20 lots » affichée mais non implémentée (`PLAN_QUOTAS`, `apps/backend/src/config/stripe.js:125-140`, ne limite que copropriétés/utilisateurs) et les features Pro accessibles gratuitement. Un écart de 50 % entre la doc stratégique et le prix affiché casse la confiance en bas de funnel et pollue toute mesure de willingness-to-pay.

---

## 1. Définir le PMF pour CoproPilot — et où on en est

### 1.1 Définition opérationnelle

Le PMF n'est pas un sentiment, c'est un état mesurable. Pour un SaaS vertical freemium à faible ARPU comme CoproPilot :

> **CoproPilot a atteint le PMF quand une cohorte de syndics bénévoles acquis organiquement (a) traverse son premier cycle annuel complet — budget, appels de fonds, AG, régularisation des charges — sur la plateforme, (b) exécute sur l'outil les actes attendus de son calendrier de gestion, et (c) déclarerait majoritairement être « très déçue » si le produit disparaissait.**

Le « cycle annuel » n'est pas un détail : la gestion de copropriété est saisonnière (AG au printemps, appels trimestriels, clôture d'exercice). Un bénévole de 10 lots gère sa copro en 2-4 h **par mois**, concentrées sur quelques moments — il peut ne rien avoir à faire dans l'outil pendant six semaines entre deux appels de fonds, et c'est normal. C'est donc la **rétention au cycle** (les 4-5 actes annuels obligatoires sont-ils réalisés dans l'outil ?) qui prouve que le produit est devenu le système de référence de la copropriété — pas une rétention hebdomadaire, qui produirait un faux signal d'échec par construction.

Deux nuances imposées par la revue contradictoire :

- **Le churn de ce segment est d'abord humain, pas produit.** « Une copropriété ne quitte pas sa propre gestion » est vrai, mais le bénévole, lui, s'épuise, vend, déménage, ou la copro re-mandate un syndic pro — et il emporte le compte. Le turnover des mandats bénévoles est notoirement élevé [hypothèse — à sourcer auprès de l'ARC/ANCC ; les benchmarks de churn cités précédemment provenaient de blogs SEO et sont retirés du raisonnement]. Contre-mesure produit : faire de la **copropriété** (et non du bénévole) le titulaire du compte, avec passation de mandat intégrée.
- **La décision d'achat est elle-même calée sur l'AG.** Un abonnement payé par le syndicat est une charge du budget, votée en AG (majorité art. 24). Un bénévole prudent ne s'engage pas sur 228 €/an sans résolution — sinon il paie de sa poche. Le cycle de conversion réel peut atteindre 12 mois, avec des vagues au printemps. Toute mesure de « conversion à 90 jours calendaires » produirait mécaniquement un faux signal de pivot (§4.2).

### 1.2 Diagnostic honnête : pre-PMF, stade « produit construit, marché non testé »

Ce qui existe et qui compte :

- Un feature-set réel et profond : patrimoine complet, appels de fonds, cycle AG entier avec vote électronique et Yousign, extranet copropriétaire avec paiement Stripe, relances graduées, score de conformité ALUR, annexes comptables du décret 2005-240, journal d'audit à chaîne de hachage.
- Une infrastructure de monétisation opérationnelle (Stripe, plans, quotas) et un modèle open-core cohérent (AGPL, `LICENSING_MODE`) — dont le risque de cannibalisation est traité en §6.3.
- Un positionnement prix bas — mais **le comparatif « 10x moins cher qu'un syndic pro » est retiré du cœur de l'argumentaire**. Le bénévole n'arbitre pas contre un syndic pro : il l'a quitté précisément parce qu'il refusait de payer. Ses ancrages réels sont Excel (0 €), Copriciel (~120 €/an), LogicielSyndic (~99 €/an), Diacamma (0 €, auto-hébergé). À 228 €/an, CoproPilot est ~2x plus cher que ses vrais comparables logiciels. Le positionnement doit se faire sur **le coût de l'erreur évitée** (« votre AG conforme en 2 h au lieu de 2 week-ends, et inattaquable ») ; la comparaison honoraires est réservée au sous-segment en résiliation. Un scénario financier à ARPU réel de 9 €/mois doit être modélisé en parallèle du scénario 19 € [hypothèse à tester par Van Westendorp lors des interviews, §4.2].

Ce qui manque et qui disqualifie toute revendication de PMF :

- **Aucune donnée d'usage citée nulle part.** Les métriques de la roadmap (« 12 clics → 2 ») sont admises « non mesurées ».
- **Aucun client réel consulté** pour la priorisation : 23 captures d'écran POWIMO d'une seule agence, personas IA.
- **Trafic organique embryonnaire** : 5-10 trials organiques/mois, cible 20-30 (réunion SEO du 14/05/2026) — des volumes de découverte de marché.
- **Des promesses marketing non implémentées** (réconciliation « intelligente », prévisions de trésorerie, import Excel, tâches auto-générées).

**Verdict : nous sommes au stade « solution construite, problème présumé ». La priorité absolue des 6 prochains mois est de fabriquer de la preuve, pas des features.**

---

## 2. Feature-set actuel vs jobs-to-be-done : matrice de couverture

Notation : ✅ fort · 🟡 partiel · ❌ absent. Personas : **P1** Marc (bénévole, ≤ 20 lots), **P2** Sophie (présidente de conseil syndical), **P3** Karim (cabinet < 20 copros), **P4** cabinet établi.

| Job-to-be-done | Couverture produit | P1 | P2 | P3 | P4 |
|---|---|---|---|---|---|
| Tenir le référentiel (lots, tantièmes, copropriétaires, mutations) | Complet, moderne | ✅ | ✅ | ✅ | ✅ |
| Émettre budget + appels de fonds par lot | Complet (budget, appels trimestriels, fonds travaux ALUR) | ✅ | ✅ | ✅ | 🟡 |
| Encaisser (paiement en ligne) | Stripe Checkout carte + SEPA ponctuel — **mais le flux des fonds est juridiquement sous-spécifié : la loi ALUR impose le compte séparé au nom du syndicat (art. 18) ; si les fonds transitent par la plateforme, on entre en territoire garantie financière Hoguet / établissement de paiement** | 🟡 | 🟡 | ❌ | ❌ |
| Prélever automatiquement (mandats SEPA récurrents) | Absent | 🟡 | — | ❌ | ❌ |
| **Comptabilité conforme** (dérogation trésorerie ≤ 5 lots / ≤ 15 K€, ou décret 2005-240 complet au-delà) | Limité aux 5 annexes AG ; ni compta simplifiée conforme à la dérogation, ni grand livre/clôture/à-nouveaux | 🟡 | 🟡 | ❌ | ❌ |
| Organiser une AG juridiquement inattaquable | Cycle complet, délai 21 j vérifié, vote électronique, procurations (limite 3), Yousign | ✅ | ✅ | ✅ | 🟡 |
| Convocations en recommandé (LRE + envoi postal hybride, registre de consentements art. 42-1) | Suivi AR manuel uniquement | ❌ | ❌ | ❌ | ❌ |
| AG en visioconférence | Absent (vote à distance oui, visio non) | ❌ | ❌ | ❌ | ❌ |
| Recouvrer les impayés | Relances graduées + contentieux : rare et fort | ✅ | ✅ | ✅ | 🟡 |
| Réconcilier la banque | Saisie manuelle ; pas d'EBICS/DSP2 ; l'« auto-match » est en roadmap P4, pas en prod | 🟡 | 🟡 | ❌ | ❌ |
| **Régulariser les charges annuelles** (compteurs, réel vs provisions, décompte par lot) | Absent — **acte obligatoire de clôture d'exercice : sans lui, chaque copro retourne à Excel au moment précis où la rétention annuelle se joue** | ❌ | 🟡 | ❌ | ❌ |
| Prouver la conformité ALUR (fiche synthétique, immatriculation, carnet) | Score de conformité automatique — différenciateur réel ; pas de télétransmission RNIC ; **l'attestation d'assurance RC du syndic bénévole est absente du score** | ✅ | ✅ | 🟡 | 🟡 |
| Produire l'état daté lors d'une vente | Mutations tracées, livrable absent | ❌ | — | ❌ | ❌ |
| Informer les copropriétaires (extranet, notifications) | Extranet complet + conseil syndical + tickets + SSE : au-dessus du marché bénévole | ✅ | ✅ | ✅ | 🟡 |
| Gérer incidents et travaux | Incidents + interventions + carnet d'entretien auto : bon | ✅ | ✅ | 🟡 | 🟡 |
| PPPT / DPE collectif (loi Climat & Résilience) | Diagnostics avec dates d'expiration ; pas de module PPPT dédié | 🟡 | 🟡 | 🟡 | 🟡 |
| Payer le gardien (paie, déclarations sociales) | Employés référencés, pas de paie | ❌ | — | ❌ | ❌ |
| **Reprendre la gestion après résiliation du syndic sortant** (soldes incertains, PDF, cartons d'archives — art. 18-2 loi 1965) | Rien ; l'« import Excel » revendiqué en FAQ n'existe pas dans le code et ne couvrirait de toute façon pas ce cas | ❌ | ❌ | ❌ | ❌ |
| Travailler en mobilité | SPA responsive, pas d'app mobile (décision actée) | 🟡 | 🟡 | 🟡 | ❌ |
| Gérer un portefeuille multi-gestionnaires | Absent | — | — | ❌ | ❌ |
| RGPD / sécurité / auditabilité | Art. 16/17/20, audit hash-chain, chiffrement IBAN : au-dessus du marché — mais conformité globale ~55 %, non survendable | ✅ | ✅ | ✅ | 🟡 |

**Lecture de la matrice.** Le fit est **fort pour P1/P2** sur le visible et le quotidien, **partiel sur le comptable et l'invisible**, et **rédhibitoire pour P3/P4**. Trois manques juridiquement chargés touchent tous les personas : **LRE hybride, régularisation des charges, reprise de gestion**. Le dernier est le plus grave : le nouveau bénévole ne démarre pas avec un Excel propre mais avec des PDF et des soldes copropriétaires incertains transmis (tardivement) par le syndic sortant — sans module de reprise, le coût de bascule annule l'argument d'activation rapide.

---

## 3. Beachhead : le syndic bénévole ≤ 20 lots, en résiliation de syndic pro

### 3.1 Pourquoi ce segment — sizing reconstruit

**Taille et structure — version corrigée.** ~620-627K copropriétés immatriculées ([ANAH Q4 2025 via Le Comptoir de la Copropriété](https://www.le-comptoir-de-la-copropriete.fr/)), ~52 000 syndics bénévoles actifs recensés ([SimpleSyndic](https://simplesyndic.fr/blog/guide-syndic-benevole)), tendance structurelle à la hausse (5 % → 15 % des copros en dix ans selon l'ARC — [Maison à Part](https://www.maisonapart.com/edito/immobilier-logement/vie-en-copropriete/coproprietes---hausse-fulgurante-du-nombre-de-synd-10730.php)).

Deux corrections actées :

- **Les ~265K copropriétés « sans syndic déclaré » au RNIC sortent du discours.** Ce sont massivement des micro-copros dormantes (2-5 lots, pas de budget, pas d'AG, souvent aucune gestion) — le segment le moins solvable. Les additionner au TAM était une hypothèse déguisée en chiffre.
- **Le SAM se construit bottom-up** : copropriétés en gestion bénévole active de 8-20 lots × taux d'équipement logiciel réaliste × prix. Ordre de grandeur de travail : **15-40K copropriétés** [hypothèse — bornes larges assumées tant que le croisement RNIC taille × type de syndic n'est pas fait ; chantier data d'une semaine, à faire avant tout pitch investisseur]. Ce chiffre couvre le seul cœur beachhead 8-20 lots : c'est le sous-ensemble le plus actif du SAM global de 30-50K copros bénévoles digitalisables retenu comme référence dans `analyse-marche.md` §2.3.
- **Le flux « first AG panic » (§3.2) doit être dimensionné avant d'y aligner le funnel** : combien de copros de 8-20 lots résilient leur syndic pro et passent en bénévole chaque année ? Personne ne le sait aujourd'hui [hypothèse à estimer : taux de résiliation × taux de passage en bénévole, données ARC/ANCC]. Si c'est 3 000/an, le funnel est construit sur un filet d'eau et le beachhead s'élargit aux bénévoles installés.

**Économie unitaire — à démontrer, pas à décréter.** À 19 €/mois d'ARPU cible, le CAC doit rester < ~230 € (payback < 12 mois) [hypothèse — benchmark de blog, à remplacer par notre CAC blended constaté]. Le funnel actuel (5-10 trials/mois) ne prouve ni ce CAC ni que le SEO scale face à Matera, qui domine les requêtes « syndic bénévole ». Actions : publier le CAC blended constaté dès maintenant, même embryonnaire, et chiffrer le plan SEO (mots-clés, difficulté, volume) au lieu d'une cible de trials. Un scénario à ARPU 9 € doit tenir aussi (§1.2).

**Concurrence faible sur le créneau exact — mais pas pour longtemps.** Le quadrant « logiciel pur, très bas prix, UX moderne, cloud managé » est quasi vide. Il faut se demander pourquoi et combien de temps il le restera : **Matera (> 40 M€ levés, machine SEO installée) peut lancer un tier logiciel-seul à 30 €/mois en un trimestre dès que CoproPilot montrera de la traction publique ; Copriciel peut moderniser son UX ; Syment monétise déjà la LRE.** L'AGPL n'est pas un moat pour un bénévole de 62 ans qui ne sait pas ce qu'est GitHub. Le moat visé est triple : partenariats institutionnels (ARC, ANCC, ADIL), corpus SEO juridique de référence, vitesse d'exécution sur les échéances réglementaires 2026. Un plan « si Matera lance un freemium » et un scénario « guerre des prix à 99 €/an » (impact conversion + CAC) sont à documenter au T3 (§6.2).

**Timing réglementaire.** 2025-2026 frappe précisément les petites copropriétés : PPPT pour toutes les copros de +15 ans depuis 2025, DPE collectif < 50 lots en 2026 ([monimmeuble.com](https://monimmeuble.com/actualite/plan-pluriannuel-de-travaux-obligatoire-loi-climat-et-resilience)), dématérialisation par défaut des notifications (loi Habitat Dégradé 2024 — [vie-publique.fr](https://www.vie-publique.fr/loi/292388-renovation-habitat-indigne-coproprietes-degradees-loi-du-9-avril-2024)). Chaque obligation nouvelle est un déclencheur d'équipement.

**Le frein n°1 du persona n'est pas Excel, c'est la responsabilité personnelle.** Ce qui empêche un copropriétaire de prendre le mandat : « si je me trompe, je suis responsable sur mes deniers ». L'assurance RC du syndic bénévole (30-100 €/an) était absente du document initial. Actions : partenariat courtier RC intégré à l'onboarding, attestation d'assurance dans le score de conformité, messaging « on vous protège de l'erreur » en tête de proposition de valeur.

**Boucle d'acquisition : dégonflée et instrumentée.** Le scénario « Sophie voit l'extranet → fait virer le syndic pro → la copro passe en bénévole → choisit CoproPilot » enchaîne quatre conversions successives dont aucune n'est estimée ; dans l'immense majorité des cas, un conseil syndical mécontent change de syndic pro, il ne le supprime pas. Décisions : (a) **Sophie devient un segment autonome** — offre « conseil syndical » (lecture seule, annotations, contre-comptabilité, comparateur d'honoraires) avec son propre pricing, à explorer en 2027 ; (b) la boucle virale réaliste est « copropriétaire exposé à l'extranet → autre copro dont il est aussi copropriétaire » — un « Propulsé par CoproPilot » sur les documents du tier Gratuit reste à implémenter (2 jours de dev [hypothèse]), avec **tracking de la source d'inscription dès le premier jour, et aucune projection tant que le coefficient viral n'est pas mesuré**.

### 3.2 Le sous-segment précis à attaquer en premier

Pas « les bénévoles » en général, mais : **la copropriété de 8-20 lots qui vient de résilier son syndic professionnel, et dont le nouveau syndic bénévole doit organiser sa première AG dans les 3-6 mois.** Ce moment (« first AG panic ») concentre urgence, peur juridique et willingness-to-pay. Le funnel (SEO « convocation AG copropriété », onboarding, activation) se conçoit autour de ce moment — **sous deux conditions issues de la revue** : dimensionner le flux annuel de ce sous-segment avant d'y engager tout le budget acquisition (§3.1), et intégrer la réalité de la passation : le syndic sortant a 1 mois pour transmettre les pièces et 3 mois pour l'état des comptes (art. 18-2), et livre des PDF, pas des données. D'où le module « reprise de gestion » au rang 1 des gaps (§5), avec un **service de reprise facturé (setup fee)** qui monétise et verrouille — et donne au passage un deuxième étage de monétisation indépendant du mur freemium.

---

## 4. Hypothèses critiques et protocole de validation

### 4.1 Les cinq hypothèses qui portent tout le modèle — version révisée

| # | Hypothèse (révisée) | Risque si fausse | Statut |
|---|---|---|---|
| H1 | Un bénévole non-comptable peut produire seul une compta conforme (dérogation trésorerie ou décret) et une AG inattaquable avec CoproPilot | Le produit reste un Excel amélioré ; pas de rétention annuelle | Non testée |
| H2 | **Un mur d'upgrade fondé sur la valeur** (LRE, compta au-delà de la dérogation, encaissement en ligne, stockage, reprise de gestion) **convertit le Gratuit** — le mur « 1 copro / 20 lots » est abandonné comme levier principal : un bénévole a une seule copro et ~85 % gèrent < 11 lots, il ne mordait jamais | Freemium = gouffre de coûts sans revenus | Non testée ; conversion attendue à modéliser segment par segment **avant** de fixer un seuil |
| H3 | La reprise de gestion (référentiel + soldes) est absorbable en **2-4 h avec accompagnement** — pas « < 1 h », pas « 5 minutes » : les Excel de bénévoles sont des artisanats (tantièmes faux, impayés mélangés) et un appel de fonds faux se conteste en AG | Activation effondrée, promesse mensongère | Non testée — aucun import dans le code |
| H4 | La rétention suit le cycle annuel (actes obligatoires exécutés dans l'outil, pic AG) — **testable seulement si la régularisation des charges existe**, sinon la copro retourne à Excel à la clôture et H4 est infalsifiable dans le mauvais sens | LTV divisée par 3-5 | Non testée ; dépend du rang 3 du §5 |
| H5 | Le pricing 0/19/49 est le bon découpage — avec scénario alternatif à ARPU 9 € et **conversion mesurée par cohorte saisonnière calée sur les AG** (résolution art. 24), pas à 90 jours calendaires | Modèle économique à revoir | Trois grilles contradictoires dans le repo ; Van Westendorp à intégrer aux interviews |

### 4.2 Protocole de validation — calendrier honnête

**North-star metric (révisée) : nombre de copropriétés « à jour de leur cycle »** — c'est-à-dire ayant exécuté dans l'outil les actes attendus de leur calendrier propre (appel de fonds du trimestre émis, convocation AG dans les délais, régularisation à la clôture, relances sur impayés actifs). Granularité **mensuelle avec attente saisonnière explicite** (pic T1-T2 AG, pics trimestriels d'appels). Pas de fenêtre hebdomadaire uniforme : un bénévole retenu peut légitimement ne rien faire pendant six semaines, et une north-star hebdo pousserait à créer de l'engagement artificiel.

**Métrique d'activation : « première valeur en 14 jours »** = référentiel repris (lots + copropriétaires + soldes validés par écran de contrôle contradictoire : somme des tantièmes = 1 000/10 000, somme des soldes = solde bancaire) ET premier document officiel émis. Cible : ≥ 40 % des inscriptions [hypothèse, à calibrer sur les 2 premières cohortes].

**Batterie de mesures, avec seuils et calendrier compatibles avec le funnel réel :**

| Mesure | Méthode | Seuil « signal PMF » | Seuil « pivot » | Échéance réaliste |
|---|---|---|---|---|
| Rétention par cohortes mensuelles (« à jour de son cycle ») | Instrumentation produit (events `domain_events` du pilier P1 + tracking analytics à y ajouter explicitement) | Plateau à M6 ≥ 50 % ; M12 ≥ 40 % | Courbe vers 0 sans plateau à M6 | Première lecture **J+180**, pas J+90 |
| 20 interviews qualitatives de bénévoles réels | Recrutement **actif** : ARC/ANCC, forums copropriété, panels rémunérés, utilisateurs Gratuit — inclut Van Westendorp (prix) et test du frein RC | « Job juridique » (H1) motif n°1 dans ≥ 12/20 | Priorisation POWIMO-centrée invalidée → re-prioriser | **8 semaines** (découplé du quantitatif) |
| Sean Ellis test | Survey in-app, utilisateurs ≥ 2 semaines + ≥ 3 actions de gestion ; **n = 20-25 accepté en première lecture** (n ≥ 40 exigerait 6-12 mois au rythme actuel) | ≥ 40 % « très déçu » sur le beachhead | < 25 % après itérations d'onboarding | Première lecture quand n atteint 20 |
| Conversion freemium → payant | Stripe + produit, **par cohorte saisonnière calée sur les AG** ; kit « résolution type à faire voter en AG » + essai mensuel sans engagement payable par le bénévole | Seuil fixé **après** modélisation segment par segment du nouveau mur de valeur (H2) — l'ancien « ≥ 4 % à 90 j » est retiré | Conversion nulle après une saison d'AG complète | Première saison d'AG complète (printemps 2027) |
| Churn payant + turnover bénévole | Stripe + motif de départ déclaré (épuisement / vente / retour syndic pro / produit) | À benchmarker sur données primaires ARC/ANCC [hypothèse] | Churn « produit » > churn « humain » | Continu |
| Trials organiques + CAC blended | GSC + analytics + dépenses réelles | 20-30 trials/mois fin Q3 ; CAC constaté publié même embryonnaire | — | Mensuel |
| Alimentation des cohortes | **Acquisition payante temporaire encadrée** (SEA sur requêtes de panique AG, budget test 2-3 K€/mois [hypothèse]) si l'organique ne suffit pas à peupler les cohortes de test | — | — | Décision fin T3 |

**Règle de discipline (maintenue) : aucune feature du pilier P4 (intelligence financière) ne démarre tant que la première cohorte n'a pas 3 mois de données de rétention lisibles.** Le pilier P1 (event-driven, `domain_events`) est l'infrastructure d'instrumentation : raison supplémentaire de le finir en premier.

---

## 5. Gaps produit priorisés pour atteindre le PMF

Recommandation tranchée, révisée par la revue métier : **la roadmap actuelle est bonne mais mal ordonnée — P2 (vitesse UX) cède sa place à un « P0 confiance & activation », et le chantier comptable est scindé en deux (dérogation d'abord, décret complet ensuite).**

| Rang | Gap | Pourquoi c'est bloquant | Décision |
|---|---|---|---|
| **0** | **Instrumentation + fixes commerciaux** : analytics d'activation/rétention, mur d'upgrade par la valeur (remplace le quota lots), gating Pro réel, quotas scopés par tenant, prix Entreprise arbitré, retrait des claims non implémentés, **documentation noir sur blanc du flux Stripe Connect avec le compte séparé du syndicat en bénéficiaire direct** (« CoproPilot ne détient jamais les fonds » — art. 18 ALUR / Hoguet) | Sans mesure, pas de PMF constatable ; le flux de fonds est un risque réglementaire structurel, pas un détail | S1-S2, non négociable |
| **1** | **Module « reprise de gestion »** : saisie assistée référentiel + soldes/à-nouveaux, écran de contrôle contradictoire, checklist de passation art. 18-2, relance du syndic sortant, import Excel en second temps ; **service de reprise facturé (setup fee)** | H3 ; répond au cas réel (PDF et cartons, pas d'Excel propre) ; monétise et verrouille | Remplace et englobe l'« import Excel guidé » ; POWIMO CSV ensuite |
| **2** | **Compta simplifiée petites copros** conforme à la dérogation ordonnance 2019-1101 (trésorerie, syndicats ≤ 5 lots ou budget ≤ 15 K€) + parcours guidé de clôture | H1 pour une part significative du beachhead, livrable en 1-2 sprints [hypothèse], juridiquement exact et différenciant — là où le décret complet est un chantier de **2-3 trimestres minimum** (moteur en partie double, plan comptable arrêté du 14 mars 2005, à-nouveaux, multi-clés), à chiffrer par un dev + un expert-comptable copro **avant** toute promesse de calendrier | Nouveau chantier prioritaire ; **le décret 2005-240 complet est reclassé prérequis du go pro (§7)** |
| **3** | **Régularisation annuelle des charges** (version minimale : saisie des relevés compteurs, répartition tantièmes/consommations, décompte individuel par lot) | Acte obligatoire de clôture — le moment où H4 (rétention au cycle) se joue ; son absence renvoyait chaque copro à Excel à la clôture | Remonte devant la visio AG |
| **4** | **LRE hybride** : AR24/Maileva, **registre de consentements horodaté (art. 42-1)** et envoi papier externalisé en parallèle pour les opposants — majoritaires chez les copropriétaires âgés des petites copros | Point de panique juridique n°1 ; Syment monétise ce seul sujet | **2-3 sprints** (pas « 1 sprint ») ; paywall Essentiel/Pro honnête (coût unitaire réel) |
| **5** | Visio AG minimale (champ lien Jitsi/Zoom + rappels) | Obligation de moyens depuis 2020 ; complète un module AG déjà fort | Quelques jours ; ne pas sur-ingénierer ; après rangs 1-4 |
| **6** | Ordres de service + devis comparés | Promesse landing « incidents de A à Z » | Maintenir (P3 roadmap) |
| **7** | Réconciliation bancaire auto-match + open banking | Accélérateur de rétention, pas déclencheur d'adoption | P4, conditionné aux données de rétention ; paywall Pro |
| **8** | Module PPPT / DPE collectif | Surf réglementaire 2026, différenciateur SEO | Quick win Q4 2026 |
| — | App mobile, paie, état daté, RNIC, EBICS, multi-agences, décret 2005-240 complet | Hors beachhead an 1 | **Ne pas faire en 2026** ; décret complet et état daté réévalués au go pro |

**Ce que cela change à la roadmap actée :** P1 (event-driven) conservé et enrichi (analytics). P2 (Command Palette, raccourcis) **repoussé** : Marc, 58 ans, se connecte quelques fois par mois — la peur de l'erreur est son problème, pas la vitesse au clic. **La conclusion initiale « tout se corrige en deux trimestres » est réécrite : le socle de confiance beachhead (rangs 0-4) tient en 2-3 trimestres [hypothèse à confirmer par chiffrage] ; la crédibilité comptable pro est un horizon 2027-2028.**

---

## 6. Risques structurels — section ajoutée suite à la revue

### 6.1 Le coût du tier Gratuit

Le persona gratuit — non-comptable, faisant des actes juridiquement sensibles — est le profil le plus coûteux à supporter du SaaS. L'affirmation « coût marginal nul » est retirée. Action : chiffrer un coût de support par compte gratuit (tickets/mois × coût unitaire) dès les premières cohortes, l'intégrer au calcul LTV/CAC, et concevoir le support en self-service d'abord (base de connaissance juridique = actif SEO au passage) [hypothèse de coût à établir sous 90 jours].

### 6.2 La riposte concurrentielle

Scénarios à documenter au T3 avec impact chiffré sur conversion et CAC : (a) Matera descend en gamme avec un tier logiciel-seul ; (b) guerre des prix à 99 €/an par les low-cost. Défense : partenariats institutionnels (ARC/ANCC/ADIL — les prescripteurs de confiance du segment), corpus SEO juridique, vitesse sur les échéances 2026, et coûts de sortie une fois un exercice comptable complet dans l'outil.

### 6.3 L'open-core AGPL

Un segment défini par son aversion au coût peut auto-héberger, et rien n'empêche un tiers d'offrir une instance mutualisée. Réponse : le moat cloud-only est explicité — LRE (coût d'envoi réel), encaissement Stripe (compte de plateforme), futures connexions bancaires, service de reprise. En pratique, le bénévole type n'auto-héberge pas ; le risque réel est l'instance mutualisée associative, qui est aussi… une opportunité de partenariat à négocier avec l'ARC/ANCC plutôt qu'à subir.

### 6.4 Le risque juridique de vendre de la conformité

Si une convocation générée est irrégulière et qu'une AG est annulée, la responsabilité de CoproPilot sera recherchée. Avant de faire de la peur juridique l'axe marketing central : revue par un avocat spécialisé copropriété des templates (convocations, PV, appels), CGU limitant explicitement la responsabilité (outil d'aide, pas de conseil juridique), assurance RC pro éditeur, et alignement du discours avec la conformité RGPD réelle (~55 %). Budget conseil juridique à provisionner au S2 [hypothèse : 10-15 K€].

### 6.5 Le coût du socle vs le revenu qu'il finance — l'arbitrage de financement

C'est le risque structurel dominant, et il conditionne la roadmap de ce document. Les rangs 0-4 du §5 (reprise de gestion, compta simplifiée, régularisation, LRE) plus, pour ouvrir P3, le **décret 2005-240 complet (2-3 trimestres auto-estimés)** et les comptes séparés, représentent ~4-6 trimestres-ingénieur en domaine régulé. Or l'économie beachhead génère un ARR de l'ordre de **100-250 K€ à 3 ans** (`analyse-marche.md` §2.3) sur un ARPU ~24 € et un churn ~3,5 %/mois (LTV brute ≈ 690 €). **Le socle pro coûte plausiblement plus cher à construire que trois ans de revenu beachhead.** Conséquence directe sur les go/no-go du §7 : ne pas engager le build pro (décret complet, comptes séparés, EBICS) tant que l'un des deux financements n'est pas explicitement acté — cash-flow du beachhead (trajectoire PME, on reste sur Essentiel) ou tour d'amorçage (mais alors le récit d'expansion venture doit être chiffré, travail demandé au doc 1/3 §2.3, non fait). Livrable préalable : P&L 3 ans intégrant le coût du build, pas seulement le CAC et le coût du gratuit.

---

## 7. Critères go/no-go d'expansion vers le segment professionnel (P3)

L'expansion vers les petits cabinets (Karim) ne s'ouvre que sur critères objectifs, évalués au plus tôt **Q2 2027** :

**GO si TOUS les critères suivants sont remplis :**

1. **PMF beachhead prouvé** : rétention M6 ≥ 50 % avec plateau, Sean Ellis ≥ 40 %, conversion freemium conforme au modèle segmenté (H2 révisée), ≥ 300 copropriétés actives payantes [hypothèse de seuil].
2. **Socle comptable pro livré ET validé métier** : décret 2005-240 complet en production depuis ≥ 2 trimestres, au moins un exercice clôturé par de vrais utilisateurs sans support — **et validation formelle par un garant financier (GALIAN, SOCAF…) et un expert-comptable spécialisé copropriété des états exigés par le contrôle annuel Hoguet** (grand livre, balance, pointe des fonds détenus par copropriété). Sans cela, le produit est disqualifié avant la démo, EBICS ou pas — ne pas dépenser un euro sur P3.
3. **Demande entrante constatée** : ≥ 10 cabinets en essai actif du plan Pro sans démarchage.
4. **Chemin de migration crédible** : import POWIMO/Thetrawin testé sur ≥ 3 migrations réelles.
5. **Économie unitaire saine sur le beachhead** : churn payant maîtrisé (benchmark primaire, §4.2) et CAC payback < 12 mois **constaté**, coût du Gratuit intégré (§6.1).

**NO-GO / report si :** la conversion reste nulle après une saison d'AG complète malgré le mur de valeur (le modèle PLG lui-même est en question) ; ou si EBICS + SEPA + état daté + états garant dépassent 2 trimestres de dev — auquel cas le segment pro attend 2028 et on approfondit le beachhead (offre conseil syndical, PPPT, assistant PV d'AG).

**Dès maintenant, sans « ouvrir » le segment :** plan Pro en self-service (en cessant de le qualifier de « coût marginal nul »), pages `/vs/POWIMO` actées en SEO Q3, tout cabinet entrant traité en design partner.

---

## 8. Synthèse des décisions demandées à l'équipe fondatrice

1. **Trancher le prix Entreprise (149 € vs 99 €) et aligner landing, `open-core-strategy.md`, `stripe-integration.md` — cette semaine.**
2. **Reconstruire le sizing bottom-up** (copros bénévoles 8-20 lots × équipement × prix), sortir les 265K « sans syndic » du discours, dimensionner le flux annuel « first AG panic » — sous 4 semaines.
3. **Redéfinir le mur freemium sur la valeur** (LRE, compta, encaissement, reprise) et modéliser la conversion segment par segment avant de fixer tout seuil.
4. **Lancer le protocole de validation révisé** : instrumentation dans P1, 20 interviews recrutées activement sous 8 semaines (avec Van Westendorp et test du frein RC), Sean Ellis à n atteignable, première lecture quantitative à J+180, conversion mesurée par saison d'AG.
5. **Réordonner la roadmap** : P0 confiance/activation (fixes + flux de fonds documenté), reprise de gestion, compta simplifiée dérogation, régularisation des charges, LRE hybride — avant P2 vitesse UX ; P4 conditionné aux données.
6. **Provisionner le risque juridique** (revue avocat, CGU, RC pro éditeur) avant de centrer le marketing sur la conformité ; ajouter le partenariat courtier RC bénévole à l'onboarding.
7. **Geler l'expansion pro** derrière les critères du §7, incluant la validation garant Hoguet.

Le marché existe, le timing réglementaire est le meilleur depuis la loi ALUR, et le produit est plus avancé que tout ce que le quadrant bas-prix propose. Ce qui sépare CoproPilot du PMF n'est ni une pénurie de features ni un problème de prix : c'est l'absence de preuve mesurée, un déficit ciblé de confiance juridique, et — la revue l'a montré — quelques hypothèses économiques qui devaient être dégonflées avant de coûter cher. **Le socle de confiance beachhead se construit en 2-3 trimestres [hypothèse] ; la preuve de PMF, elle, exige une saison d'AG complète. C'est le vrai calendrier, et il faut le tenir plutôt que le maquiller.**

---

## Objections et réponses (devil's advocate)

Les huit critiques les plus fortes des deux revues, et l'arbitrage retenu.

**1. « Le SAM 50-80K est une hypothèse déguisée en chiffre ; les 265K copros sans syndic sont des coquilles vides. » (investisseur)**
*Retenue intégralement.* Les 265K sortent du discours investisseur ; le SAM est reconstruit bottom-up (fourchette de travail 15-40K [hypothèse], chantier data sous 4 semaines). Le TAM narratif « 300K+ » est abandonné.

**2. « La cible cœur tient entièrement dans le Gratuit — le freemium ne convertit structurellement pas. » (investisseur)**
*Retenue intégralement — c'était la contradiction la plus grave du draft.* Le mur « 1 copro / 20 lots » est abandonné comme levier principal (un bénévole a une copro ; 85 % gèrent < 11 lots). Le mur devient un mur de valeur : LRE, compta au-delà de la dérogation, encaissement, stockage, service de reprise facturé. Le seuil « ≥ 4 % à 90 j » est retiré tant que la conversion attendue n'est pas modélisée segment par segment.

**3. « Compta décret 2005-240 en 2-3 sprints est une fiction — et vous ratez la dérogation qui sauve le beachhead. » (opérateur)**
*Retenue, avec le retournement proposé.* Le décret complet est requalifié en chantier de 2-3 trimestres minimum, à chiffrer avec un expert-comptable copro, et devient un prérequis du go pro. Le beachhead est servi d'abord par une compta simplifiée de trésorerie conforme à l'ordonnance 2019-1101 (syndicats ≤ 5 lots ou budget ≤ 15 K€) — plus rapide, juridiquement exacte, différenciante. La promesse « tout en deux trimestres » de la conclusion est réécrite.

**4. « Le protocole de validation est incompatible avec votre propre funnel (n ≥ 40 en 8 semaines avec 5-10 trials/mois) ; et la north-star hebdo contredit votre thèse de saisonnalité. » (les deux revues)**
*Retenue intégralement.* Interviews (8 semaines, recrutement actif) découplées du quantitatif (J+180, n = 20-25 accepté) ; acquisition payante temporaire envisagée pour peupler les cohortes ; north-star redéfinie « copropriété à jour de son cycle », granularité mensuelle avec saisonnalité explicite ; conversion mesurée par cohorte saisonnière calée sur les AG (une charge de 228 €/an se vote en AG, art. 24 — kit résolution + essai mensuel fournis).

**5. « Le mauvais ancrage prix : le bénévole compare à Excel et Copriciel, pas au syndic pro — vous êtes 2x plus cher que vos vrais comparables. » (investisseur + opérateur)**
*Retenue.* Le « 10x moins cher » sort du cœur de l'argumentaire (réservé au sous-segment en résiliation). Positionnement sur le coût de l'erreur évitée et le temps gagné ; Van Westendorp intégré aux interviews ; scénario financier à ARPU 9 € modélisé en parallèle.

**6. « Zéro analyse de riposte concurrentielle ; le quadrant vide ne le restera pas ; l'AGPL cannibalise votre monétisation. » (investisseur)**
*Retenue.* Nouveau §6 : scénarios « Matera descend en gamme » et « guerre des prix » à chiffrer au T3 ; moat explicité (partenariats ARC/ANCC/ADIL, corpus SEO juridique, vitesse réglementaire, features cloud-only : LRE, Stripe, reprise) ; l'instance mutualisée associative traitée en opportunité de partenariat.

**7. « La reprise de gestion réelle (PDF, cartons, soldes incertains — art. 18-2), pas un import Excel en 1 h ; et la régularisation des charges manque au moment exact où la rétention annuelle se joue. » (opérateur)**
*Retenue intégralement.* Le rang 1 devient un module « reprise de gestion » (saisie assistée, contrôles contradictoires, checklist de passation, 2-4 h assumées, setup fee) ; la régularisation des charges (version minimale) remonte au rang 3, devant la visio AG. H3 et H4 sont reformulées en conséquence.

**8. « Vendre de la "conformité" à des amateurs sans revue juridique, sans RC pro, avec un flux Stripe sous-spécifié (art. 18 ALUR / Hoguet) et sans traiter la RC du bénévole, c'est un risque non provisionné. » (opérateur, partiellement investisseur)**
*Retenue.* Budget conseil juridique + CGU + RC pro éditeur avant de centrer le marketing sur la peur juridique ; architecture Stripe Connect documentée avec le compte séparé du syndicat en bénéficiaire direct (« CoproPilot ne détient jamais les fonds » devient un argument affiché) ; partenariat courtier RC bénévole dans l'onboarding et attestation dans le score de conformité.

*Critiques écartées ou nuancées :* la suggestion d'abandonner toute référence au moment « first AG panic » n'est pas retenue — le ciblage du moment de bascule reste la bonne mécanique de funnel (point C de la revue métier), à condition de dimensionner le flux d'abord ; et la boucle extranet n'est pas supprimée mais dégonflée : instrumentée, non projetée, avec Sophie requalifiée en segment autonome plutôt qu'en canal.
