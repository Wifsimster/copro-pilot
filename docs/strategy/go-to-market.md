# Plan Go-To-Market — CoproPilot

**Document de travail interne — confidentiel · 16 juillet 2026 · Document 3/3 (série stratégie) · Version finale post-revue devil's advocate**

---

## 1. Résumé exécutif

CoproPilot attaque le marché des ~620 000 copropriétés immatriculées au RNIC ([données ANAH Q4 2025 via Le Comptoir de la Copropriété](https://www.le-comptoir-de-la-copropriete.fr/)). Attention au chiffre brut : sur les 250 000 à 300 000 copropriétés « en gestion bénévole ou sans syndic déclaré » ([Sogefi/RNIC](https://www.sogefi-sig.com/geoservices-apis-wms/api-copro-les-coproprietes/)), une large part sont des micro-copropriétés de 2-5 lots dormantes, sans gestion active ni équipement numérique. **Notre SAM réel — copropriétés bénévoles actives (AG tenue, comptes gérés), digitalisables — est estimé à 30 000-50 000 copropriétés, plus 2 000-4 000 cabinets < 20 copros [hypothèse, chiffrage canonique : `analyse-marche.md` §2.3, à valider par un chiffrage bottom-up au T3].** C'est 5 à 10 fois moins que le chiffre brut, et c'est largement suffisant pour la phase 1.

Le timing réglementaire reste notre meilleur argument : PPPT obligatoire pour les copropriétés de +15 ans depuis 2025, DPE collectif étendu aux <50 lots en 2026 ([Opéra Énergie](https://opera-energie.com/loi-climat-resilience-coproprietes/)), dématérialisation par défaut depuis la loi Habitat Dégradé ([Légifrance](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049392425)). Ces obligations datées frappent précisément notre cible et créent une demande mécaniquement croissante sur des requêtes encore peu concurrentielles.

**La stratégie tient en une phrase : PLG open-core sur le beachhead des syndics bénévoles, avec un produit gratuit crédible et les associations comme relais, puis remontée vers les petits syndics pro calée sur les clôtures d'exercice (cycle 6-12 mois).** Le SEO est traité comme « table stakes de crédibilité » (décision actée le 14/05/2026). L'extranet copropriétaire est un canal de notoriété à coût nul — pas une « boucle virale » tant que son coefficient mesuré reste inférieur à 0,3.

**Trois décisions à prendre cette semaine, non négociables :**

1. **Trancher le prix Entreprise** : la landing affiche 149 €/mois, `docs/open-core-strategy.md` dit 99 €. Recommandation : acter 149 € et mettre à jour la doc — en notant que la comparaison avec Septeo (~119 € HT/mois, marché pro) ne vaut que pour les personas P3/P4, pas pour les bénévoles.
2. **Colmater la fuite de valeur Pro** : réconciliation bancaire, SSE temps réel et cash flow sont vendus dans le plan Pro à 49 € mais accessibles gratuitement dans le code (aucun `requirePlan`). Sans mur d'upgrade réel, pas de conversion.
3. **Aligner les promesses marketing sur le produit** : « réconciliation bancaire intelligente », « import Excel » et « tâches auto-générées » sont revendiqués sans implémentation. **Ce fix est une porte bloquante avant toute présence publique (salon, campagne, lancement HN)** — pas un vœu. On ne grille pas sa réputation dans un milieu associatif où tout le monde se parle.

**Objectif à 18 mois (scénario central, cohérent avec le funnel du §5)** : ~950 signups cloud/mois, **150 clients payants cumulés, ~4,5 K€ de MRR**. Scénario haut (conversion 6 %, ARPU tiré par P3) : ~11 K€ de MRR. Les 30 K€ évoqués dans les versions antérieures de ce document étaient arithmétiquement incompatibles avec notre propre grille tarifaire et sont abandonnés. Tous les coûts sont dimensionnés sur le scénario central ; la viabilité est vérifiée sur le scénario bas (§5).

---

## 2. Stratégie GTM globale

### 2.1 Pourquoi PLG et pas sales-led

À 19 €/mois (Essentiel), un CAC blended doit rester sous ~230 € pour un payback <12 mois ([Bantrr](https://bantrr.com/business-model/saas-metrics/cac-payback-benchmarks-for-saas-companies/)) — **et ce CAC doit être calculé fully loaded, temps interne valorisé inclus** (cf. §6). Aucun canal payant ne tient cette contrainte sur le persona bénévole. Seuls l'organique, le produit et la communauté fonctionnent. Le sales-led reste réservé aux personas P3/P4, plus tard.

### 2.2 Séquencement beachhead : bénévoles d'abord, pros ensuite

**Phase 1 (mois 0-9) — Syndics bénévoles (P1) et présidents de conseil syndical (P2, en prescripteurs).** Personne n'offre de freemium cloud crédible sur ce segment. **Correction majeure du positionnement P1** : les copropriétés de moins de 10 lots avec budget <15 000 € sont *dispensées* de la comptabilité en partie double du décret 2005-240. Vendre « votre comptabilité conforme au décret » à un bénévole de 8 lots, c'est résoudre un problème qu'il n'a pas légalement. L'argumentaire P1 se recentre sur les douleurs réelles : **appels de fonds et régularisation, convocations et délais d'AG, suivi des impayés — et surtout la peur de la responsabilité civile** (vice de convocation, erreur de répartition), qui est le frein n°1 d'adoption du bénévole, souvent retraité. Réponses prévues : garde-fous produit mis en avant (contrôle automatique des délais de convocation, alertes de conformité), contenu « vos responsabilités et comment l'outil les borne », et exploration d'un partenariat courtier RC syndic bénévole [hypothèse, à sonder en interviews]. Le discours décret 2005-240 est réservé aux copros >9 lots et aux pros.

Deux réalités structurantes, absentes des versions précédentes :

- **Qui paie, et quand** : l'abonnement est une charge du syndicat, inscrite au budget prévisionnel voté en AG. La conversion suit donc **deux vitesses** — paiement personnel rapide (minorité) et vote en AG à 6-12 mois (majorité). Livrable dédié : un **kit « résolution AG prête à voter »** (texte de résolution + devis annuel aligné sur l'exercice comptable).
- **Saisonnalité** : 70-80 % des AG se tiennent entre mars et juin [hypothèse à confirmer sur nos données]. Le plan s'organise en conséquence : pic d'acquisition janvier-avril, pic d'activation avril-juillet, nurturing pré-AG d'octobre à décembre.

**Phase 2 (mois 9-18) — Petits syndics pro (P3, <20 copros).** On y va avec des preuves : témoignages, cas clients, et une **reprise de balance assistée** (soldes copropriétaires, budgets votés, impayés, clés de répartition) — car l'import CSV du référentiel POWIMO n'est que la partie triviale de la migration. Les bascules pro se font aux clôtures d'exercice, et un cabinet porte une carte pro, une garantie financière loi Hoguet et un garant qui regarde comment les fonds mandants sont suivis : **le cycle de vente P3 est de 6-12 mois, pas transactionnel. Les revenus P3 sont donc décalés de deux trimestres dans le funnel §5**, et le discours P3 intègre la compatibilité avec les exigences du garant (traçabilité des fonds, éditions pour le contrôle annuel). **P4 (cabinets 20-100 copros) reste opportuniste jusqu'à fin 2027.**

### 2.3 Le rôle de l'open-core

Le self-hosted est un canal de crédibilité et d'évangélisation, pas une fuite de revenu. Les analogies Odoo/GitLab des versions précédentes sont retirées : leurs revenus self-hosted proviennent de clients enterprise payants, sans rapport avec notre situation. Notre hypothèse de travail : les self-hosters seront des devs copropriétaires, évangélistes plus que clients, avec un taux de conversion vers le cloud de 1-5 % [hypothèse non sourcée, à mesurer]. Règle maintenue : le cloud se vend sur l'**opérationnel** (backups, mises à jour, RGPD, support), jamais en dégradant la version communautaire (piège Plausible, fork Cal.diy). Corollaire : la mitigation « resserrer le gratuit à 10 lots » envisagée au §8 est **encadrée** — elle ne s'appliquerait qu'aux nouveaux comptes cloud, jamais rétroactivement ni à la version AGPL.

### 2.4 L'extranet copropriétaire : notoriété à coût nul (pas « asset n°1 »)

Chaque copropriété activée expose 8 à 40 copropriétaires à l'extranet. Un « Propulsé par CoproPilot » sur l'extranet gratuit crée une exposition récurrente à coût nul, et certains de ces copropriétaires siègent au conseil syndical d'une autre copropriété. Mais soyons lucides : un copropriétaire qui reçoit un appel de fonds est un payeur de charges, pas un prospect en mode achat. **Ce canal est requalifié en canal d'appoint** : on le mesure (coefficient viral, KPI 8), on ne le promeut « canal n°1 » que si le coefficient dépasse 0,3. Deux garde-fous impératifs :

- **Le badge est retiré des convocations et PV** — ce sont des actes formels dont la régularité conditionne la validité des décisions d'AG ; un bandeau promotionnel y est au mieux non professionnel, au pire attaquable. Le badge vit sur l'extranet et les emails transactionnels non légaux.
- **Le badge ne part pas sans le socle RGPD** : l'extranet expose des données de tiers non contractants (les copropriétaires) dont CoproPilot est sous-traitant. DPA-type, mentions d'information extranet et registre sont livrés **dans le même sprint** que le badge, pas au trimestre suivant.

Point réglementaire critique sur les **paiements** : les appels de fonds appartiennent au syndicat et doivent arriver sur le compte séparé obligatoire (art. 18, loi de 1965). Un éditeur qui route ces flux s'approche du statut d'agent de prestataire de services de paiement (agrément/exemption ACPR). **Décision : audit juridique du flux de paiement avant toute mise en avant ; à court terme, virement référencé + rapprochement uniquement, et Stripe exclusivement en Connect direct vers le compte du syndicat.**

---

## 3. Plan d'exécution par horizon

### 3.1 Horizon 0-90 jours — Quick wins

Priorité absolue : rendre le funnel honnête et étanche avant d'y envoyer du trafic.

| # | Action | Owner | Deadline | Pourquoi |
|---|---|---|---|---|
| 1 | Trancher le prix Entreprise (reco : 149 €), aligner `open-core-strategy.md` et `stripe-integration.md` | CEO | S1 | Incohérence 99/149 € = risque crédibilité |
| 2 | Gater réconciliation, SSE, stats/cash flow en Pro (`requirePlan`) ; implémenter le quota 20 lots ; corriger le bug de comptage multi-tenant des quotas | CTO | S2-S4 | Sans mur d'upgrade, pas de conversion ; bug bloquant en prod |
| 3 | Retirer ou implémenter les claims landing non étayés — **porte bloquante avant toute présence publique** | CEO + CTO | S2 | Churn J+30, risque juridique (pratique commerciale trompeuse) |
| 4 | Badge « Propulsé par CoproPilot » sur extranet et emails transactionnels (pas les convocations/PV), livré avec DPA-type + mentions extranet | Front + juriste | S3-S5 | Canal d'appoint + conformité sous-traitant |
| 5 | SEO Foundations Q2 (acté) : meta tags, JSON-LD, sitemap, dé-lazy-load landing, hiérarchie H1/H2 | Sarah | S4-S8 | Prérequis d'indexation, coût faible |
| 6 | Onboarding « première AG réussie en 30 min » : checklist guidée in-app | Produit | S6-S10 | 43 % du churn SMB survient dans les 90 premiers jours ([Optifai](https://optif.ai/learn/questions/b2b-saas-churn-rate-benchmark/)) |
| 7 | Contact ARC + ANCC + plans B (clubs locaux, ADIL/CAUE pour le volet PPPT/DPE) ; candidater au stand du salon ARC d'octobre en le traitant comme de l'**achat de leads**, pas comme un partenariat acquis | CEO | S4 | L'ARC est structurellement méfiante envers les éditeurs ; l'ANCC est plus ouverte |
| 8 | Instrumenter le funnel (signups, activation, conversion, churn **par cause**) | CTO | S6 | Toutes les cibles internes sont « non mesurées » |
| 9 | **10-20 interviews clients réels (bénévoles), test de prix Van Westendorp, documentation du circuit de décision (qui signe, vote AG ou paiement perso)** — *avant* de figer la grille tarifaire | CEO | S4-S10 | La willingness-to-pay des bénévoles est aujourd'hui postulée, jamais démontrée ; la roadmap repose sur des personas IA |
| 10 | Listing comparateurs (immocompare, Coprolab, Appvizer) + forums (Universimmo, groupes Facebook) | Marketing | S4 en continu | Coût quasi nul, intent élevé |
| 11 | Kit « résolution AG prête à voter » (texte + devis annuel aligné exercice comptable) | Produit + juriste | S8-S12 | Débloquer la conversion « vote AG » (6-12 mois) |

**Livrable de fin de trimestre** : funnel mesuré, gating cohérent, interviews réalisées, présence salon décidée (ARC ou plan B), baseline chiffrée pour le §5.

### 3.2 Horizon 3-6 mois — Construire la machine

- **SEO Q3 (acté)** : migration `createHashRouter` → `createBrowserRouter`, prerender landing, pages `/vs/powimo`, `/vs/thetrawin`, `/vs/ics-naxos` — **uniquement après validation des prix concurrents par devis réels** (l'hypothèse « POWIMO 4-6 €/lot » n'est pas sourcée ; une page /vs/ inexacte est un risque juridique).
- **Mise en conformité RGPD complète, chantier séparé et prioritaire** : l'audit interne évalue la conformité à ~55 % (consentement, politique de confidentialité, DPIA non conformes) alors que nous stockons des PII financières (IBAN) de milliers de copropriétaires. Budget dédié **10-20 k€** (cf. §6), livré *avant* le hub « Sécurité / Conformité ». Règle d'écriture : jamais « conforme RGPD », toujours « conçu pour la conformité » avec preuves techniques, chaque claim validé par le juriste.
- **Import Excel réel** (revendiqué en FAQ, inexistant) + **import POWIMO CSV** (référentiel) + cadrage de la **reprise de balance assistée** (service accompagné, pas self-serve — prérequis P3).
- **Salon ARC (octobre)**, si candidature acceptée et claims corrigés : atelier pratique recentré « appels de fonds, convocations et responsabilité du syndic bénévole » (pas le décret 2005-240, cf. §2.2). Objectif réaliste pour un premier stand : **50 leads qualifiés, 15 signups** [hypothèse]. Octobre est un creux de décision (AG au printemps) : le salon alimente le nurturing pré-AG, pas la conversion immédiate.
- **Programme partenaires v0** : 5 experts-comptables pilotes (recommandation co-brandée) ; exploration courtier RC syndic bénévole.
- **Chiffrage open banking** : coût réel par connexion Powens/Bridge ([mapping BPI](https://bigmedia.bpifrance.fr/nos-actualites/mapping-2025-des-acteurs-francais-de-lopen-banking)) × nombre de comptes — chaque copropriété a son propre compte séparé obligatoire, souvent dans des banques mutualistes à couverture DSP2 inégale. Un cabinet P3 de 20 copros = 20 connexions : le plan Pro à 49 € + 3 €/copro ne les couvre peut-être pas. Décision de tarification (par compte connecté ?) *avant* toute promesse de réconciliation automatique.

### 3.3 Horizon 6-18 mois — Scaler et monter en gamme

- **SEO Q4 content compounding (acté)** : hubs « guide du syndic bénévole », réglementaire PPPT/DPE collectif (échéances datées 2025-2026, demande mécaniquement croissante, faible concurrence — notre meilleur angle SEO), calculateurs gratuits (tantièmes, budget prévisionnel, délai de convocation) comme lead magnets. Calendrier éditorial **saisonnier** : contenus décision/comparaison publiés octobre-janvier pour capter le pic d'AG mars-juin.
- **Ouverture du segment P3** (démarrage mois 9, revenus attendus à partir du mois 15) : landing dédiée, grille publique 49-149 €, reprise de balance assistée aux clôtures d'exercice, 20 founder calls/mois, argumentaire garant/loi Hoguet.
- **Open banking** en Pro, si et seulement si l'équation de coût du §3.2 est positive.
- **Assistant PV d'AG (IA générative)** : la tâche la plus anxiogène du bénévole ; différenciateur face à LogicielSyndic.fr (99 €/an, discours « IA »).
- **Programme de parrainage** : 3 mois d'Essentiel offerts par copropriété parrainée activée [hypothèse à tester au mois 9].
- **P4 opportuniste** : répondre aux inbound, ne pas prospecter.

---

## 4. Plan par canal

### 4.1 Produit-led (canal n°1)

- **Freemium** : 1 copro / 20 lots (quota à implémenter). Mur d'upgrade : 2ᵉ copropriété, >20 lots, exports PDF/Excel et AG (gatés Essentiel). Règle anti-fork maintenue : ne jamais gater CRUD, RGPD Art. 17/20, extranet de base.
- **Extranet** : badge + page d'atterrissage « votre syndic utilise CoproPilot — gérez-vous une autre copropriété ? ». Canal d'appoint, mesuré (KPI 8).
- **Self-hosted → cloud** : docs d'installation excellentes, image Docker officielle, « community support only » sur GitHub Discussions, bannière in-app non intrusive. Conversion attendue 1-5 % [hypothèse, à mesurer].
- **Politique de support des comptes gratuits, explicite dès le jour 1 : self-serve only** (docs, FAQ, communauté). Les bénévoles anxieux face à des obligations juridiques sont le persona de support le plus high-touch qui existe ; sans cette règle, 1 400 comptes gratuits noient le CSM mi-temps. Coût unitaire par compte gratuit (hébergement, stockage documents) à chiffrer à M+3 (action §3.1 #8).

### 4.2 SEO

S'appuie sur la roadmap actée du 14/05/2026 (Foundations Q2 → Migration Q3 → Content Q4), ~1,5 FTE cumulé, ownership Sarah. KPIs anti-vanity : indexation ≥ 95 %, trials organiques 5-10 → 20-30/mois, **CVR landing→trial ≥ 12 % (landing seule — ne pas appliquer ce taux au trafic blog, cf. §5)**, Lighthouse Mobile ≥ 90. Refus confirmés : pas de SSR/Next.js, pas d'agence à 5 k€, pas de blog massif en Q2. Priorité Q4 : contenus à échéance réglementaire datée.

### 4.3 Communautés et associations

- **ARC/UNARC** : viser le stand d'octobre en achat de leads. L'ARC vit de ses adhésions et de ses propres formations, sa ligne éditoriale est la critique des prestataires : un « partenariat contenu » est improbable à court terme — on le tente, sans en dépendre.
- **ANCC** (plus ouverte) : proposer CoproPilot comme support pédagogique de leurs formations de syndics bénévoles.
- **Plans B** : clubs de syndics bénévoles locaux, ADIL/CAUE sur le volet PPPT/DPE.
- **Forums et groupes** : Universimmo, groupes Facebook, r/vosfinances. Règle : réponses expertes d'abord, lien ensuite. 2 h/semaine, founder ou CSM.
- **Open source** : linuxfr, annuaires FR, lancement Hacker News quand import Excel et Docker one-liner sont prêts *et les claims corrigés*.

### 4.4 Partenariats

Séquence : experts-comptables (mois 4-9) → courtier RC syndic bénévole [hypothèse] → associations (co-marketing continu) → notaires (mois 12+). Modèle : commission 20 % année 1 ou co-branding [hypothèse]. Pas de partenariat fédérations pro (FNAIM, UNIS) avant 2027.

### 4.5 Contenu

Trois lignes éditoriales : (1) **pratique bénévole** (appels de fonds, convocations, impayés, responsabilité — le décret 2005-240 en contenu >9 lots/pro uniquement) ; (2) **conformité/sécurité** — après mise en conformité réelle ; (3) **comparatifs /vs/** — après devis réels. L'hypothèse interne « une page /vs/ peut tripler l'acquisition SMB » reste une [hypothèse à valider par GSC].

---

## 5. Funnel et métriques cibles

Baseline quasi nulle (trials organiques 5-10/mois). Toutes les cibles sont des **[hypothèses]** à recaler dès l'instrumentation. Corrections structurantes par rapport aux versions précédentes : **CVR visiteur→signup séparés par type de trafic** (landing 8-12 % ; contenu/blog 1-2 %, conformément aux benchmarks réels 2-5 % blended), **churn central 3,5 %/mois en année 1** (le bénévole churne — fatigue, déménagement, passage au syndic pro — même si la copropriété reste), **conversion à deux vitesses** (perso rapide / vote AG 6-12 mois), et **saisonnalité** (les valeurs M+X sont des moyennes lissées ; attendre des pics janvier-avril sur l'acquisition, avril-juillet sur l'activation).

| Étape | Définition | M+3 | M+6 | M+12 | M+18 | Hypothèse sous-jacente |
|---|---|---|---|---|---|---|
| Visiteurs uniques /mois | landing + blog | 2 000 | 5 000 | 12 000 | 25 000 | SEO acté + salon + extranet |
| Signups cloud /mois | compte créé | 60 | 160 | 450 | 950 | CVR blended ~3 % → 4 % (landing 8→12 %, contenu 1-2 %) |
| Activation /mois | 1 copro + lots + copropriétaires + 1 action clé sous 14 j | 25 (40 %) | 70 (45 %) | 215 (48 %) | 475 (50 %) | Onboarding guidé + imports livrés |
| Conversion payante | % des activés convertis sous 12 mois (2 vitesses : perso <90 j, vote AG 6-12 mois) | 3 % | 4 % | 4,5 % | 5 % | À rapprocher du benchmark signups→payant 3-5 % ([FirstPageSage](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/)) : appliqué à une base *activée* déjà filtrée, notre hypothèse est ambitieuse, pas prudente |
| Clients payants (cumul) | Essentiel+Pro+Entreprise | 3 | 12 | 55 | 150 | Churn 3,5 %/mois an 1, 3 % ensuite ; revenus P3 décalés à M+15 |
| MRR | € | ~90 € | ~360 € | ~1 650 € | ~4 500 € | ARPU ~30 € (mix 60/35/5) [hypothèse] |
| Expansion | % MRR issu upgrades/overage | — | — | 8 % | 12 % | Overage Pro + upgrades |

**Scénario bas (test de survie)** : conversion 1,5-2 % (si le gratuit couvre le besoin) → ~70 payants, ~2 K€ MRR à M+18. Le budget cash (§6) reste soutenable à ce niveau, mais ce scénario impose de resserrer le gratuit *pour les nouveaux comptes cloud uniquement* (jamais rétroactivement, cf. §2.3) et repousse tout recrutement. **Scénario haut** : conversion 6 %, ARPU 40 € tiré par P3 → ~11 K€ MRR. C'est le plafond crédible à 18 mois, pas l'objectif.

Churn cible : 3,5 %/mois en année 1 (dans la moyenne SMB 3-5 %, [Optifai](https://optif.ai/learn/questions/b2b-saas-churn-rate-benchmark/)), 2,5-3 % en année 2 une fois l'onboarding et les imports livrés. L'argument « une copropriété ne quitte pas sa gestion » est retiré : c'est l'utilisateur qui churne, pas l'immeuble. Mesure du churn **par cause** obligatoire (action §3.1 #8).

---

## 6. Budget indicatif et ressources

Budget 18 mois [hypothèses]. Deux changements de méthode : (1) la mise en conformité RGPD devient un poste séparé et prioritaire ; (2) le CAC se calcule **fully loaded** (temps interne valorisé), sinon le KPI 9 est de la comptabilité créative.

| Poste | 0-6 mois | 6-18 mois | Total | Commentaire |
|---|---|---|---|---|
| SEO/contenu (Sarah, ~1,5 FTE cumulé acté) | interne | interne + 6 k€ freelance | 6 k€ | Pas d'agence (acté) |
| **Mise en conformité RGPD complète** (DPIA, consentement, politique de confidentialité, DPA-type, mentions extranet) | 10 k€ | 5 k€ | **15 k€** | Non négociable avant le hub conformité et le badge extranet ; nous stockons des IBAN |
| Audit juridique flux de paiement (ACPR/art. 18) | 3 k€ | — | 3 k€ | Avant toute mise en avant des paiements extranet |
| Salon ARC ou plan B (stand, matériel, déplacement) | 4 k€ | 4 k€ | 8 k€ | Achat de leads, objectifs divisés par 3 |
| Partenariats/associations (webinaires, co-marketing, courtier RC) | 2 k€ | 4 k€ | 6 k€ | |
| Outils (analytics, GSC/Ahrefs, CRM léger, email) | 1,5 k€ | 3 k€ | 4,5 k€ | |
| Juriste — claims marketing + pages /vs/ | 2 k€ | 2 k€ | 4 k€ | Distinct du poste RGPD |
| SEA test (mois 12+, requêtes P3 uniquement) | 0 | 5 k€ | 5 k€ | Seulement si funnel prouvé |
| **Total cash** | **22,5 k€** | **29 k€** | **~51,5 k€** | |

**CAC fully loaded** : en valorisant 0,3 FTE founder, 1,5 FTE SEO cumulé, le CSM mi-temps et ~6 semaines-dev GTM, le coût complet 0-6 mois avoisine 60-80 k€ [hypothèse] pour ~12 payants — soit un CAC réel de plusieurs milliers d'euros en phase d'amorçage. C'est normal à ce stade (coûts fixes d'infrastructure GTM), mais on le dit honnêtement : **le payback unitaire ne devient sain qu'avec le volume (M+12+) et la part P3 dans le mix**. Le KPI 9 suit les deux mesures (cash-only et fully loaded).

**Coût des comptes gratuits** : à M+18, ~90 % des comptes sont gratuits. Politique support self-serve only (§4.1), coût unitaire (hébergement, stockage, emails) chiffré à M+3, et re-dimensionnement du support : le **CSM mi-temps à M+6** fait onboarding des payants + nurturing AG, *pas* le support des gratuits. 1 **growth/contenu temps plein au mois 12** si le funnel M+6 est validé. L'ingénierie GTM (~6 semaines-dev au T1) est à protéger contre la pression feature.

---

## 7. Actions pricing & packaging

1. **Entreprise = 149 €/mois, acté et documenté partout** (landing, `open-core-strategy.md`, `stripe-integration.md` — qui affiche encore une grille 9/29/99 € périmée). Justification par le marché pro (Septeo ~119 € HT/mois, Matera ~250 €/lot/an) — valable pour P3/P4 uniquement.
2. **Valider la willingness-to-pay P1 avant de figer Essentiel** : LogicielSyndic ancre le prix psychologique du bénévole à 99 €/an ; notre Essentiel annuel est au-dessus. Les interviews + Van Westendorp (§3.1 #9) tranchent. Corriger au passage le badge « −36 % » (−37 % réels) et challenger la remise annuelle (20-25 % suffirait) [hypothèse].
3. **Étanchéifier le gating** (§3.1 #2) : sans cela, le plan Pro à 49 € n'est justifié que par `cycle-annuel` — indéfendable.
4. **Créer le composant `PlanGuard` frontend** (décrit dans la doc, inexistant en code) : écran d'upsell contextuel plutôt que 403 bruts — premier levier de conversion.
5. **Ne jamais gater** : CRUD, RGPD Art. 17/20, extranet de base. Périmètre open/payant écrit, public et stable (anti-fork), jamais de retrait rétroactif.
6. **Le plan « Conseil syndical » à 9 €/mois est abandonné en tant que plan autonome** : le CS n'a ni budget propre ni personnalité pour payer (toute dépense = charge du syndicat votée en AG), et un CS contrôlant un syndic pro n'obtiendra pas les exports vers un outil tiers. Il devient un **add-on « accès conseil syndical » du plan du syndic**, et le président de CS est traité comme **prescripteur** (persona d'influence), pas comme payeur.

---

## 8. Risques d'exécution et mitigations

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Willingness-to-pay P1 non démontrée (ancrage 99 €/an, dépense votée en AG) → conversion 1,5-2 % | Moyenne-haute | Critique | Interviews + Van Westendorp avant de figer la grille ; kit résolution AG ; scénario bas modélisé (§5) et soutenable en cash |
| Le gratuit couvre tout le besoin des bénévoles | Moyenne-haute | Élevé | Quota lots appliqué ; exports + AG gatés Essentiel ; si conversion <2,5 % à M+6, resserrer à 10 lots **pour les nouveaux comptes cloud uniquement** (jamais rétroactif, jamais sur l'AGPL) |
| Claims marketing non tenus → churn J+30 et réputation | Haute (état actuel) | Élevé | Porte bloquante avant toute présence publique (§3.1 #3) |
| **Riposte Matera : offre logiciel-seul gratuite/low-cost lancée en 90 jours** avec sa marque, sa hotline juridique et ses encaissements déjà réglés | **Haute si le segment est prouvé** | Critique | Douve au-delà de l'open source : coûts de sortie réels (données + comptabilité engagée dans l'outil), preuve sociale locale, vitesse sur ANCC/clubs locaux ; **scénario « Matera Free/29 € » chiffré au T4** |
| Septeo verrouille la distribution (fédérations, garants, banques) | Moyenne | Élevé | Ne pas dépendre des fédérations pro ; canal expert-comptable + comparateurs |
| ARC refuse stand ou partenariat | Moyenne-haute | Moyen | Plan B actif : ANCC, clubs locaux, ADIL/CAUE (§4.3) |
| Flux de paiement extranet = maniement de fonds (ACPR, art. 18 loi 1965) | Moyenne | Critique | Audit juridique avant mise en avant ; virement référencé à court terme ; Stripe Connect direct compte du syndicat |
| Conformité RGPD ~55 % avec PII financières stockées | Certaine (état actuel) | Critique | Chantier dédié 15 k€ (§6), *avant* hub conformité et badge extranet |
| Coût open banking > revenu Pro (1 compte séparé par copro) | Moyenne | Élevé | Chiffrage coût/connexion avant promesse ; tarification par compte connecté si besoin |
| Roadmap fondée sur personas IA, pas de clients réels | Certaine (état actuel) | Élevé | 10-20 interviews sous 90 jours avant d'engager P3/P4 produit |
| Bug quotas multi-tenant en prod | Certaine si non corrigé | Critique | Fix S2-S4, bloquant avant scaling |
| Cycle P3 sous-estimé (garant, loi Hoguet, bascule aux clôtures) | Haute | Moyen | Revenus P3 décalés de 2 trimestres (§5) ; reprise de balance assistée en service |
| Fork/hébergement concurrent AGPL | Faible-moyenne | Moyen | Périmètre open/payant stable et public ; marque + cloud + support |
| Dépendance founder sur les canaux communautaires | Haute | Moyen | Playbooks documentés, CSM mi-temps M+6 |

---

## 9. Tableau de bord — les 10 KPIs

Revue hebdomadaire (1-5), mensuelle (6-10). Owner unique par KPI. Cibles alignées sur le scénario central du §5.

| # | KPI | Définition | Cible M+6 | Cible M+18 | Owner |
|---|---|---|---|---|---|
| 1 | Signups cloud /semaine | comptes créés | 40 | 220 | Marketing |
| 2 | Taux d'activation 14 j | copro + lots + 1 action clé | 45 % | 50 % | Produit |
| 3 | Conversion free→payant | % des activés, suivie en 2 cohortes : paiement perso (<90 j) et vote AG (6-12 mois) | 4 % | 5 % | Produit |
| 4 | MRR / croissance MoM | € | 360 € | 4,5 k€ | CEO |
| 5 | Churn logo mensuel **+ répartition par cause** | clients payants perdus | <4 % | <3 % | CSM |
| 6 | Trials organiques /mois | signups source SEO | 20-30 (cible actée) | 80 | Sarah |
| 7 | CVR landing→trial (landing seule, pas blended) | GA/GSC | ≥12 % (cible actée) | ≥12 % | Sarah |
| 8 | Coefficient extranet | signups attribués badge/UTM ÷ copros actives | mesuré (baseline) | ≥0,15 (requalification « canal n°1 » si ≥0,3) | Produit |
| 9 | CAC cash **et** CAC fully loaded / payback | dépenses GTM (± temps interne valorisé) ÷ nouveaux payants | mesurés (baseline honnête) | CAC cash <230 € / payback cash <12 mois | CEO |
| 10 | NPS bénévoles + étoiles comparateurs | enquête in-app trimestrielle + immocompare/Coprolab | NPS >40, listé sur 3 comparateurs | NPS >50, note ≥4,3 | CSM |

---

## Objections et réponses (devil's advocate)

Synthèse des critiques les plus fortes des deux revues (investisseur sceptique, opérateur métier) et des arbitrages retenus.

**1. « L'objectif 30 K€ MRR / 120 payants est arithmétiquement impossible avec votre propre grille (ARPU implicite 250 €). »** Accepté sans réserve. Le résumé exécutif est réaligné sur le scénario central du funnel : 150 payants, ~4,5 K€ MRR à M+18, scénario haut ~11 K€. Un seul jeu de chiffres dans tout le document.

**2. « La willingness-to-pay des bénévoles est postulée : LogicielSyndic ancre à 99 €/an, la dépense passe par un vote d'AG, et zéro client réel n'a été interviewé. »** Accepté. Interviews + Van Westendorp avant de figer la grille (action S4-S10), circuit de décision documenté, conversion modélisée à deux vitesses (perso / vote AG), kit « résolution AG prête à voter », et scénario bas 1,5-2 % vérifié soutenable en cash.

**3. « Le beachhead est gonflé : les 250-300 K copros "sans syndic déclaré" sont majoritairement dormantes et non adressables. »** Accepté. SAM requalifié à 30 000-50 000 copropriétés actives équipées [hypothèse, aligné sur `analyse-marche.md` §2.3], chiffrage bottom-up au T3. Le marché reste suffisant pour la phase 1 — inutile de le survendre.

**4. « Le funnel (CVR 11 % visiteur→signup) et le churn (2-2,5 %) sont hors benchmarks, et le benchmark freemium est appliqué à la mauvaise base. »** Accepté. CVR séparés landing (8-12 %) / contenu (1-2 %), signups M+18 ramenés de 2 750 à ~950/mois, churn central 3,5 %/mois an 1, et l'hypothèse de conversion est désormais présentée comme ambitieuse (base activée), pas prudente.

**5. « Vous vendez le décret 2005-240 à des copros qui en sont dispensées, et vous ignorez le vrai frein : la responsabilité civile du bénévole. »** Accepté — c'était une erreur de positionnement métier. Argumentaire P1 recentré sur appels de fonds, convocations/délais, impayés et responsabilité (garde-fous produit, contenu dédié, piste courtier RC) ; le décret est réservé aux >9 lots et aux pros. L'atelier salon est renommé en conséquence.

**6. « Encaisser les charges via Stripe vous approche du maniement de fonds (art. 18, ACPR) — le mur que Matera a franchi avec 100× vos moyens. »** Accepté. Audit juridique du flux avant toute mise en avant (3 k€ budgétés) ; à court terme virement référencé + rapprochement, Stripe uniquement en Connect direct vers le compte du syndicat. Même logique de prudence sur l'open banking : coût par compte séparé chiffré avant promesse.

**7. « La "boucle virale" extranet est un espoir promu asset n°1, et le badge sur les convocations est une faute de métier. »** Accepté sur les deux points. Requalifiée en canal de notoriété à coût nul (promotion en « canal n°1 » conditionnée à un coefficient mesuré ≥0,3) ; badge retiré des convocations et PV ; DPA + mentions extranet livrés dans le même sprint que le badge (les copropriétaires sont des tiers dont nous sommes sous-traitant).

**8. « Le CAC est minoré (cash-only) et la conformité RGPD à 55 % est traitée à 3 k€ alors que vous stockez des IBAN. »** Accepté. Double mesure CAC (cash et fully loaded, avec l'aveu que le payback unitaire n'est sain qu'à volume) ; chantier RGPD séparé à 15 k€, livré avant le hub conformité ; politique de support des gratuits explicitement self-serve only et coût unitaire par compte gratuit chiffré à M+3.

**Arbitrages non retenus ou nuancés** : (a) la remise annuelle ~36 % n'est pas immédiatement réduite — elle sera challengée avec les données d'interviews, car elle peut servir l'alignement sur l'exercice comptable ; (b) le salon d'octobre est maintenu malgré le creux saisonnier, comme investissement de nurturing pré-AG et de crédibilité associative, avec des objectifs divisés par trois ; (c) l'open-core reste central dans la stratégie malgré le retrait des analogies Odoo/GitLab — la douve est reformulée (coûts de sortie, réversibilité, confiance) plutôt qu'abandonnée.

---

## Annexe — dépendances produit critiques pour ce plan

Par ordre de blocage GTM : (1) fix quotas multi-tenant + gating Pro + quota lots ; (2) correction des claims landing (porte bloquante publique) ; (3) instrumentation funnel + churn par cause ; (4) socle RGPD extranet (DPA, mentions) puis badge ; (5) onboarding guidé « première AG » + kit résolution AG ; (6) import Excel puis POWIMO référentiel, cadrage reprise de balance ; (7) `PlanGuard` frontend ; (8) SEO Q2 Foundations (acté) ; (9) audit flux de paiement puis réconciliation/open banking (prérequis GTM P3). Tout le reste — y compris l'assistant IA — passe après.

*Fin du document 3/3. Documents liés : 1/3 Analyse de marché & concurrence, 2/3 Stratégie produit & pricing open-core.*
