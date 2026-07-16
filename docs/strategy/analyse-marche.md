# Analyse marketing & marché — CoproPilot

**Document de travail interne — Confidentiel**
**Document 1/3 : Marketing & marché** · Version finale (post-revue devil's advocate) · Rédigé le 16 juillet 2026 · Destinataires : équipe fondatrice

> Cette version intègre les critiques de deux relectures adverses (angle investisseur, angle opérateur métier). Les changements majeurs : SOM reconstruit bottom-up (÷5 à ÷7 vs le draft), TAM dégonflé, claims juridiques recadrés, prérequis produit re-priorisés (migration de données, LRE, comptes séparés), et validation terrain déplacée en *préalable* et non en jalon Q3. Voir la section finale « Objections et réponses ».

---

## 1. Résumé exécutif

CoproPilot attaque un marché structurellement favorable : ~620 000 copropriétés immatriculées en France, dont plus des deux tiers sont de petites structures mal servies par des éditeurs legacy chers et opaques, avec un calendrier réglementaire 2025–2026 (PPT généralisé, DPE collectif < 50 lots en 2026, dématérialisation par défaut) qui touche pour la première fois les petites copropriétés — notre cible. Mais ce moteur réglementaire doit être manié avec prudence : l'application des sanctions sur les petites copros est historiquement faible, et le produit n'a aujourd'hui **aucun module PPT/DPE**.

Cinq conclusions tranchées :

1. **Le marché adressable réel est nettement plus petit que le récit interne — et le SOM du draft précédent était arithmétiquement intenable.** Les comptages directs donnent 52 000 à 95 000 syndics bénévoles actifs. Reconstruit bottom-up (pénétration gratuite plausible × conversion freemium prudente), le SOM à 3 ans en organique pur est de l'ordre de **300 à 700 comptes payants, soit 100–250 K€ d'ARR en scénario central** — et non 0,7–2 M€. Atteindre le haut de fourchette (scénario haut : ~1 500 payants, ~500 K€ ARR) suppose un mur de valeur freemium réparé et une distribution partenariale (associations, assureurs). Ce recalibrage change le besoin de financement et le récit investisseurs (§2.3).
2. **Le positionnement prix doit être reformulé deux fois.** « 10x moins cher » est faux contre les logiciels bénévoles (LogicielSyndic 99 €/an) et juridiquement attaquable même contre les syndics (publicité comparative entre offres non substituables, art. L122-1 code conso : un logiciel ne remplace pas un syndic — le bénévole reprend le travail *et* la responsabilité). Formulation retenue : **« Économisez jusqu'à X € par an en passant en syndic bénévole »**, méthodologie sourcée en astérisque (§6.1).
3. **Le principal risque est produit, et il est plus large que la comptabilité.** Trois murs d'adoption sont sous-estimés dans le récit interne : (a) la **migration des données** (reprise de balance, soldes copropriétaires, tantièmes) — sans elle l'outil est inutilisable en cours d'exercice ; (b) la **LRE/LRAR** pour les convocations d'AG — sans elle, vendre « l'AG conforme » expose nos clients à des annulations d'AG en justice ; (c) les **comptes bancaires séparés** (loi ALUR/Hoguet) — sans eux, le segment cabinet est invendable. Vendre de la conformité qu'on n'a pas est le moyen le plus rapide de tuer la marque sur ce marché.
4. **Le go-to-market année 1 doit être 100 % bénévoles installés (P1/P2), en organique**, avec deux funnels distincts : les bénévoles déjà en place (décision individuelle, cycle court) et les copropriétés à convertir depuis un syndic pro (vote en AG art. 25, **cycle de 12–18 mois** calé sur la saison des AG T1–T2). Seul le premier funnel est dimensionnant en an 1. Les cabinets (P3/P4) sont hors scope avant 18 mois.
5. **Ce document précède la validation terrain — c'est son principal défaut méthodologique, assumé.** La roadmap et les personas reposent sur des analyses IA et 23 screenshots d'une seule agence POWIMO. Décision : **geler la roadmap au-delà du sprint 2** tant que 15 interviews de bénévoles + 5 présidents de CS + 3 petits cabinets et 3 devis concurrents réels ne sont pas faits — cible : sous 30 jours, pas « fin Q3 ».

---

## 2. Taille et structure du marché français de la copropriété

### 2.1 Les fondamentaux

- **619 000 à 626 700 copropriétés immatriculées** au RNIC, ~11,4 M de logements (données ANAH Q4 2025 relayées par [Le Comptoir de la Copropriété](https://www.le-comptoir-de-la-copropriete.fr/) ; [data.gouv.fr — RNIC](https://www.data.gouv.fr/datasets/registre-national-dimmatriculation-des-coproprietes)).
- **Structure massivement atomisée** : ~32 % font 1–10 lots, ~44 % font 11–50 lots (ANAH Q4 2025). Une note indépendante ([G. Brisepierre, 2022](https://gbrisepierre.fr/wp-content/uploads/2022/10/2022-GBS-note-petites-copro-et-RE-vf.pdf)) estime que 70,5 % des copropriétés sont « petites » mais ne concentrent que 19,5 % des logements.
- **Répartition par mode de gestion** (RNIC 2022, [Sogefi](https://www.sogefi-sig.com/geoservices-apis-wms/api-copro-les-coproprietes/)) : ~51 % syndic professionnel, ~6,2 % syndic bénévole/coopératif déclaré, ~42,7 % « sans syndic déclaré ».
- **Dynamique favorable** : l'ARC estime que la part des syndics bénévoles est passée de 5 % à 15 % en dix ans ([Maison à Part](https://www.maisonapart.com/edito/immobilier-logement/vie-en-copropriete/coproprietes---hausse-fulgurante-du-nombre-de-synd-10730.php)).

**Mise en garde sur les « 42,7 % sans syndic déclaré » (~265 000 copros) : ce n'est pas un marché.** Sur le terrain, cette catégorie recouvre massivement des copros de 2–4 lots en indivision de fait qui ne se vivent pas comme des copropriétés, des immatriculations non à jour, et des copropriétés en difficulté (impayés, administration judiciaire) — précisément la population la *moins* susceptible d'acheter un SaaS de conformité. Nous ne la comptons plus dans le TAM qu'à hauteur d'une fraction à documenter via les données RNIC (taille, activité) [hypothèse : 10–20 % activables, à valider].

**Mise au point réglementaire structurante (art. 14-3, loi de 1965) :** les copropriétés de moins de 10 lots avec budget < 15 000 € sont **dispensées de comptabilité d'engagement** et peuvent tenir une simple comptabilité de trésorerie. Or ~32 % des copropriétés font 1–10 lots. Conséquence : « la conformité au décret 2005-240 » n'est *pas* la douleur du bas du marché — il faut **segmenter le message compta** : « < 10 lots : simplicité et suivi de trésorerie ; ≥ 10 lots : conformité décret 2005-240 » (§6.2).

### 2.2 Mise au point sur le « 300K+ syndics bénévoles »

Le chiffre du positionnement actuel n'est pas un marché constaté : les comptages directs donnent **~52 000 syndics bénévoles actifs** ([SimpleSyndic](https://simplesyndic.fr/blog/guide-syndic-benevole) — source concurrente, à recouper), et le marché du logiciel bénévole équipé est estimé à **~30 000 copropriétés** ([LogicielSyndic](https://logicielsyndic.fr/logiciel-syndic-benevole) — idem). Reformulation retenue pour les supports : **« près de 300 000 copropriétés gérées sans syndic professionnel »** — vrai, vérifiable, moins attaquable — en gardant à l'esprit que la majorité de ce vivier est dormante (cf. §2.1).

### 2.3 TAM / SAM / SOM — reconstruit bottom-up

Le sizing du draft précédent comportait deux erreurs corrigées ici :

- **Le TAM valorisait des clients à qui nous avons décidé de ne rien facturer.** Le plan Gratuit (1 copro, ~20 lots) couvre déjà 100 % du besoin de ~76 % des copropriétés françaises. Le TAM monétisable = uniquement les copros au-delà du mur de valeur réel (AG payante, > 20 lots, multi-copros, cabinets).
- **Le funnel SOM se contredisait lui-même** : il exigeait 40–100K comptes gratuits pour un SAM déclaré de 50–80K copros — soit capter 50 à 200 % du SAM en 3 ans, en organique, avec une marque inconnue. Intenable.

| Niveau | Définition | Volume | Valeur annuelle | Hypothèses |
|---|---|---|---|---|
| **TAM monétisable** | Copros bénévoles déclarées + fraction activable des « sans syndic » + petits cabinets — *au-delà du mur freemium* | ~60–100K copros monétisables [hypothèse, à segmenter via RNIC] + ~10–15K cabinets [hypothèse] | **~15–30 M€** (vs 70–90 M€ dans le draft) | ARPU bénévole 228 €/an, cabinet 588–1 788 €/an [hypothèse] |
| **SAM** | Copros bénévoles digitalisables ≥ 10 lots ou multi-besoins + cabinets < 20 copros insatisfaits | ~30–50K copros [hypothèse] + ~2–4K cabinets [hypothèse] | ~8–15 M€ | Exclut les < 10 lots en compta trésorerie sans besoin AG outillée |
| **SOM 3 ans — central** | Self-serve organique, funnel bénévoles installés uniquement | Pénétration gratuite 10–15 % du SAM = **5–12K comptes gratuits** × conversion **1–2 %** (paywall non prouvé) à **4–6 %** (mur AG réparé et démontré) | **300–700 payants, 100–250 K€ ARR** | Conversion prudente tant que le mur AG n'est pas mesuré ; benchmark 3–5 % = *bon* pour des SaaS établis ([FirstPageSage](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/)) |
| **SOM 3 ans — haut** | Idem + distribution partenariale (ARC/ANCC, assureurs RC) + mur freemium effectif | ~1 200–1 500 payants | **~400–500 K€ ARR** | Nécessite quota lots implémenté, gating Pro corrigé, K-factor extranet mesuré > 0 [hypothèse] |

**Conséquence stratégique assumée : à cet horizon, CoproPilot est une trajectoire de PME rentable en organique, pas un récit venture-scale — sauf à documenter l'expansion (ARPU cabinets an 2–3, adjacences : assurance, LRE, open banking, état daté ; international à conditions réglementaires proches type Belgique) [hypothèse].** Cette question doit être tranchée explicitement avant toute levée.

**La boucle virale extranet est retirée des hypothèses de sizing.** « Chaque copro expose 8–40 copropriétaires » — mais ce sont des *résidents*, pas des acheteurs ; le vrai K-factor (résidents eux-mêmes gestionnaires ailleurs, qui convertissent) est inconnu et probablement minuscule. Décision : instrumenter K dès les premiers comptes, ne le réintégrer au sizing qu'une fois mesuré.

**Deux funnels, deux horloges.** Un bénévole déjà en place achète vite (décision individuelle). La bascule syndic pro → bénévole exige un **vote en AG (art. 25)** calé sur la fin de mandat du syndic : découverte en septembre, vote en avril, démarrage en juillet — cycle réel de 12–18 mois. L'an 1 se dimensionne uniquement sur les bénévoles installés ; le second funnel se travaille en nurturing calé sur la saison des AG (T1–T2).

---

## 3. Le cadre réglementaire : un moteur de demande réel, mais à dégonfler

| Obligation | Texte | Échéance | Impact CoproPilot — lecture honnête |
|---|---|---|---|
| Comptabilité d'engagement, annexes 1–5 | [Décret 2005-240](https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006051416) | En vigueur (**dispense < 10 lots et budget < 15 K€**, art. 14-3) | Barrière réelle pour les ≥ 10 lots seulement. Le produit génère les 5 annexes ; grand livre/clôture à finir |
| Immatriculation RNIC, fiche synthétique, fonds de travaux | Loi ALUR ([ANIL](https://www.anil.org/aj-copropriete-fiche-synthetique/)) | En vigueur | Score de conformité ALUR automatique : différenciateur réel |
| PPT copros +15 ans | Loi Climat & Résilience ([monimmeuble.com](https://monimmeuble.com/actualite/plan-pluriannuel-de-travaux-obligatoire-loi-climat-et-resilience)) | Toutes tailles depuis 2025 | **Le produit n'a aucun module PPT.** Angle SEO/contenu valable, promesse produit interdite tant que rien n'existe |
| DPE collectif | Idem ([Opéra Énergie](https://opera-energie.com/loi-climat-resilience-coproprietes/)) | < 50 lots : 2026 | Idem : mot-clé d'acquisition, pas de module |
| Dématérialisation par défaut, emprunt collectif | [Loi Habitat Dégradé, 9 avril 2024](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049392425) | En vigueur | Légitime le numérique ; renforce le besoin de **LRE — gap produit critique** (cf. §6.3) |

**Mise en garde d'application :** les sanctions pour les petites copros sont quasi inexistantes, et le taux de conformité historique est faible — notre propre chiffre de 42,7 % « sans syndic déclaré » le prouve. Le réglementaire est un **moteur de trafic SEO à forte intention** (« DPE collectif copropriété 30 lots obligatoire »), pas un moteur d'achat automatique. La stratégie de contenu Q4 2026 s'ordonnance sur ce calendrier, mais le sizing ne repose plus dessus. Décision : soit un **module PPT minimal** (suivi d'échéances + trame de plan) entre au sprint gelé n°2, soit les pages de contenu réglementaire redirigent vers ce que le produit fait vraiment (fonds de travaux, fiche synthétique).

---

## 4. Analyse concurrentielle

**Avertissement méthodologique : la moitié des prix ci-dessous proviennent de sources secondaires ou du marketing des concurrents eux-mêmes** (blogs SimpleSyndic/LogicielSyndic, comparateurs Coprolab/immocompare). Décision : **3 devis réels (Septeo, Vilogi, Matera) sous 30 jours, avant de figer la carte de positionnement** — et non pas seulement avant les pages /vs/.

### 4.1 Segment pro (cible secondaire, an 2+)

| Acteur | Prix | Force | Faiblesse exploitable |
|---|---|---|---|
| **Septeo ADB** (SPI Syndic, Even) | ~119 € HT/mois d'entrée, sinon devis ([Coprolab](https://coprolab.fr/comparatif-logiciel-syndic/), à confirmer par devis) | Puissance commerciale, écosystème | Perçu cher et rigide, UX datée |
| **Powimo** (Seiitra) | Devis uniquement | Profondeur fonctionnelle, base captive | Legacy, complexité, pas de self-service |
| **Bellman/Inch** | 3,90 €/lot/mois (franchise) ([Immo Matin](https://www.immomatin.com/interview/syndic-bellman-s-offre-un-nouveau-depart.html)) | UX moderne | Avis mitigés sur le service des franchisés |

Quasi aucun acteur pro ne publie ses prix : notre grille transparente est une arme sur ce segment. **Mais un prérequis absolu manque à l'analyse et au produit : la loi Hoguet et les comptes séparés.** Un cabinet exerce sous carte professionnelle, garantie financière et obligation de compte bancaire séparé par copropriété (ALUR, sans dérogation au-delà de 15 lots) : rapprochements multi-comptes, états au garant, pointage par syndicat. **Sans gestion native du multi-comptes séparés, les plans Pro/Entreprise sont invendables à un cabinet, quel que soit le prix.** Décision : comptes séparés + rapprochement multi-comptes entrent dans les prérequis P3, *avant* l'import POWIMO.

### 4.2 Segment bénévole (cible primaire)

| Acteur | Prix public | Nature | Menace |
|---|---|---|---|
| **Vilogi** | « À partir de 10 €/mois », réel sur devis ([logiciels.pro](https://www.logiciels.pro/vilogi/)) | Offre syndic bénévole tout-inclus de longue date : **compta conforme complète, connexion bancaire, LRE** | **Concurrent fonctionnel le plus dangereux : notre feuille de route, déjà livrée, à bas prix.** Devis réel bénévole = benchmark de référence à obtenir |
| **LogicielSyndic.fr** | **99 €/an** (≤ 50 lots) | SaaS « IA » bénévole | Concurrent prix frontal, mais faible sur la conformité |
| **Matera** | ~250 €/lot/an ([immocompare](https://immocompare.org/home/comparatif-syndic-en-ligne/avis-matera/)) | Plateforme + experts | Marque et moyens ; a déjà expérimenté des offres « plateforme seule » — la descente en gamme est un scénario à plan de réponse, pas à balayer (§8) |
| **Cotoit** | 190–260 €/lot/an ([cotoit.fr](https://www.cotoit.fr/tarifs/)) | Syndic pro en ligne | Faible : autre catégorie |
| **Copriciel** | 120 €/an, lots illimités | Logiciel basique | Frontale prix, faible produit |
| **SimpleSyndic** | 59–89 €/mois | SaaS milieu de gamme | Faible : trop cher pour un bénévole |
| **Syment** | Devis | Spécialiste AG conformes (LRE, visio, vote) | Preuve que l'AG se monétise seule ; **candidat partenariat LRE** |
| **Diacamma / Coprolib'** | 0 € (open source auto-hébergé) | Communautaire | Faible : ergonomie datée, pas de cloud |

*Correction majeure vs draft : Vilogi était classé « segment pro, interface vieillissante ». C'est en réalité le concurrent bénévole le plus complet fonctionnellement — le sous-estimer était une erreur de lecture des sources.*

### 4.3 Carte de positionnement (provisoire, en attente des devis réels)

Axes : prix annuel pour ~20 lots × degré de service humain.

```
Prix/an (20 lots)
5 000 €+ │                        Cotoit (~5 200 €)   Matera coop (~5 000 €)
         │                                   Bellman (franchise)
1 500 €  │  Septeo / Powimo (devis, cabinets pro)
1 000 €  │  SimpleSyndic (708–1 068 €)
  400 €  │  Vilogi bénévole (devis à obtenir) ── Syment (AG, devis)
  228 €  │  ★ CoproPilot Essentiel
  120 €  │  Copriciel ── LogicielSyndic (99 €)
    0 €  │  ★ CoproPilot Gratuit (cloud) ── Diacamma/Coprolib' (self-host)
         └──────────────────────────────────────────────────────→
           Logiciel pur          Logiciel + experts     Syndic délégué
```

**Trois espaces favorables — sans illusion de douve :**
1. **Freemium hébergé moderne** : personne n'en offre aujourd'hui. Mais **un tier gratuit n'est pas un moat** : LogicielSyndic peut en lancer un en une semaine, Septeo peut offrir son entrée de gamme via les fédérations qu'il sponsorise. Durée de vie estimée de l'avantage : 3–6 mois après première traction visible [hypothèse]. La vraie douve à construire : **conformité comptable finie + ancrage associatif (ARC/ANCC) + AGPL**.
2. **Open source + UX moderne** : réversibilité, auditabilité — différenciant face à Matera (données captives) et argument de pérennité pour P3.
3. **Bande 200–700 €/an** entre les logiciels basiques et SimpleSyndic — à condition de justifier l'écart de 2,3x avec LogicielSyndic par un différenciateur *livré* (cf. §7).

---

## 5. SWOT CoproPilot

| **Forces** | **Faiblesses** |
|---|---|
| Seul freemium cloud du marché (avantage périssable, cf. §4.3) | Comptabilité en partie double incomplète (grand livre, clôture, fournisseurs) |
| Couverture AG large (convocations, vote électronique, majorités art. 24/25/26, Yousign), 5 annexes du décret, extranet Stripe, fonds de travaux ALUR | **Pas de LRE (AR24)** : la convocation d'AG par LRAR/LRE est le vice d'annulation d'AG le plus utilisé — le claim « AG conforme » est intenable en l'état |
| Conformité valorisable : audit trail hash chain, RGPD Art. 16/17/20, chiffrement IBAN, hébergement France | **Pas de reprise de données** (balance, soldes copropriétaires, à-nouveaux, tantièmes) : mur d'adoption n°1, la fenêtre de migration réelle est la clôture d'exercice, une fois par an |
| Open source AGPL : confiance, réversibilité, canal dev | **Écarts marketing/code** : réconciliation « intelligente », prévisions de trésorerie, import Excel revendiqués sans implémentation vérifiée |
| Grille tarifaire publique et self-service (unique sur le segment pro) | Pas de comptes séparés multi-copros (loi Hoguet/ALUR) : segment cabinet invendable en l'état ; pas d'état daté, pas de DSP2, pas de SEPA récurrent |
| Stack moderne, vitesse d'exécution produit | Gating premium poreux : features Pro accessibles en Gratuit, quota 20 lots non appliqué, bug de comptage multi-tenant des quotas |
| | Marque inconnue, zéro preuve sociale, zéro client interviewé ; analyse concurrentielle interne fondée sur 23 screenshots d'une seule agence POWIMO ; audit RGPD à ~55 % |

| **Opportunités** | **Menaces** |
|---|---|
| Calendrier réglementaire 2025–2026 comme moteur SEO (pas comme promesse produit) | **Vilogi** : offre bénévole complète (compta conforme, banque, LRE) déjà livrée à bas prix |
| Croissance structurelle du bénévolat (5 % → 15 % en 10 ans, ARC) | Réplication du freemium par LogicielSyndic / offre « plateforme seule » Matera / gratuité Septeo via fédérations FNAIM-UNIS |
| SERP « logiciel syndic bénévole » peu défendue ; associations ARC/ANCC accessibles | Guerre des prix bénévole (LogicielSyndic 99 €/an) |
| **Partenariat assurance RC syndic bénévole** (le vrai frein du persona : responsabilité civile personnelle) — argument qu'aucun concurrent logiciel n'a [hypothèse à valider en interviews] | Risque juridique sur les claims comparatifs (art. L122-1) et sur « AG conforme » sans LRE |
| Open banking mûr (Powens, Bridge) pour une vraie réconciliation payante | Consolidation Septeo ; fork AGPL (faible) ; **churn structurel : des copros bénévoles repassent en syndic pro** [taux inconnu, à mesurer] |

---

## 6. Positionnement recommandé et messages clés

### 6.1 Positionnement

**Garder « Simple, moderne » — abandonner « 10x moins cher » sous toutes ses formes.** Le claim est faux contre les logiciels (LogicielSyndic 99 €/an vs Essentiel 228 €/an) et, même recadré contre les syndics, reste une publicité comparative entre offres ne répondant pas aux mêmes besoins (art. L122-1 code conso) : un logiciel ne remplace pas un syndic — le bénévole reprend le travail et la responsabilité. La FNAIM ou un réseau attaqué s'en saisirait. Formulation retenue :

> **« Gérez votre copropriété vous-même. Économisez jusqu'à X € par an en passant en syndic bénévole.\* »**
> *\*Méthodologie : honoraires moyens de syndic pro 3 750–5 250 €/an pour 15 lots ([Manda](https://www.manda.fr/ressources/articles/quel-est-le-prix-moyen-dun-syndic-par-lot-en-copropriete)) moins l'abonnement CoproPilot — on compare une décision de gouvernance, pas deux offres.*

### 6.2 Messages par segment

**P1 — Syndic bénévole (cœur, an 1).** Persona réel [hypothèse à valider en interviews] : plutôt retraité 60–70 ans, disponible mais peu digitalisé ; ses premiers freins sont la **responsabilité civile personnelle** et la charge mentale, pas le prix. Conséquences :
- Message segmenté compta : *« Moins de 10 lots ? Suivez votre trésorerie simplement. 10 lots et plus ? Vos appels de fonds et vos annexes en règle, sans être comptable. »*
- **Ne pas promettre « votre première AG conforme » tant que la LRE n'est pas intégrée** (AR24 ou partenariat Syment). Formulation autorisée : *« Préparez votre AG : ordre du jour, délai de 21 jours vérifié, feuilles de présence, calcul des majorités. »* La conformité de *notification* n'est pas promise.
- Différenciateurs à explorer : **offre packagée assurance RC syndic bénévole** (candidats : MMA, assureurs affinitaires) — potentiellement l'argument tueur du segment ; onboarding assisté (téléphonique) plutôt que « 5 minutes sans carte bancaire », et UX testée avec des 65+.
- CTA : plan Gratuit, sans carte bancaire.

**P2 — Président de conseil syndical (prescripteur, an 1).** *« Contrôlez enfin les comptes de votre syndic. »* Entre en Gratuit ; alimente le funnel long (bascule en AG, 12–18 mois — à nurturer, pas à compter dans le sizing an 1).

**P3 — Petit cabinet (an 2).** *« Un extranet moderne et une grille publique — sans devis, sans lock-in. »* AGPL = réversibilité. **Prérequis produit, dans l'ordre : comptes séparés + rapprochement multi-comptes, comptabilité complète, import POWIMO, ordres de service.**

**P4 — Cabinet établi : ne pas prospecter avant 18 mois.** Répondre aux inbound, point final.

**Open source** : hors messaging grand public (marché conservateur) ; couche 2 sur la page Sécurité/Conformité, argumentaire P3, communauté dev.

### 6.3 Le nettoyage des claims — préalable non négociable

Avant tout investissement d'acquisition : **retirer ou implémenter** « réconciliation bancaire intelligente », « prévisions de trésorerie 30/60/90 j », « régularisation post-AG en 1 clic », « tâches auto-générées », « import Excel » — et **« AG conforme »** (cf. supra). Ne jamais dire « conforme RGPD » tant que l'audit interne plafonne à ~55 % ; faire valider toute page conformité par un juriste. Sur un marché où l'acheteur craint l'erreur juridique, une seule promesse non tenue détruit la conversion — et un bénévole dont l'AG est annulée devient un avis Google destructeur.

**La migration des données n'est pas une feature, c'est LE mur d'adoption.** Sans reprise des soldes copropriétaires, à-nouveaux, tantièmes et clés de répartition, un outil comptable est inutilisable en cours d'exercice ; la fenêtre de migration réelle est la clôture d'exercice, une fois par an, par copro. Décision : **l'import de balance + soldes individuels devient le prérequis produit n°1** (avant même le grand livre complet), et les campagnes d'acquisition se synchronisent sur les débuts d'exercice comptable, pas sur les échéances DPE.

---

## 7. Pricing : analyse et arbitrages

### 7.1 Position dans le marché

| Plan | Prix | €/lot/mois (20 lots) | Référence marché |
|---|---|---|---|
| Gratuit | 0 € | 0 | Aucun équivalent hébergé (avantage périssable) |
| Essentiel | 19 €/mois (228 €/an) | 0,95 € | LogicielSyndic 99 €/an ; Vilogi bénévole (devis à obtenir) |
| Pro | 49 €/mois | — (multi-copro) | Legacy pro : « 3–8 €/lot/mois » [hypothèse, à valider par devis] |
| Entreprise | 149 €/mois | — | Septeo entrée ~119 € HT/mois [source secondaire] |

**Le premium Essentiel (2,3x LogicielSyndic) repose sur un actif en chantier.** L'écart doit être justifié par la conformité (AG + annexes) — or la compta est incomplète et la LRE absente. Arbitrage : **le prix de 228 €/an est conditionné à la livraison de la compta complète ≥ 10 lots ; d'ici là, prix de lancement (149 €/an la première année, badge « early adopter ») [hypothèse à tester]** — plutôt que de vendre au prix cible un différenciateur non livré.

### 7.2 L'incohérence 99 €/149 € : trancher pour 149 € + frais de mise en service — et dépriorisée

Trois versions coexistent dans le repo (landing/calculateur à 149 € : `PricingSection.tsx:90`, `PricingCalculator.tsx:42` ; `docs/open-core-strategy.md:42` à 99 € ; `docs/stripe-integration.md` avec une grille périmée). **Décision : 149 €/mois** — la landing est le contrat avec le client, c'est la doc interne qui est périmée ; descendre à 99 € détruirait 33 % de marge sur un segment dont la sensibilité au risque prime *probablement* sur la sensibilité au prix [hypothèse — aucune donnée client, à confronter aux 3 interviews cabinets].

**Mais 149 €/mois seul ne couvre pas le coût de servir** : une reprise comptable de cabinet (balances, soldes, historiques sur N copros) représente 2–5 jours-homme, soit 1–3 K€ [hypothèse]. Sans frais d'entrée, chaque client Entreprise est déficitaire 12–18 mois. Décision complémentaire : **frais de mise en service one-shot 990–2 490 € selon volume** — standard du marché et filtre naturel des prospects non sérieux.

**Priorité réelle de cet arbitrage : faible.** Le segment Entreprise est hors scope 18 mois ; c'est un alignement documentaire (30 minutes), pas la décision n°1. Actions : (a) aligner `open-core-strategy.md` et `stripe-integration.md` sur 0/19/49/149 ; (b) vérifier les prix Stripe production ; (c) corriger le badge « −36 % » (réel : −37 %) ; (d) la remise annuelle ~36 % est inhabituellement généreuse (20–25 % suffirait) [hypothèse ; ne pas changer avant volume].

### 7.3 Les deux problèmes de pricing structurants

1. **Le Gratuit couvre ~76 % du marché sans mur d'upgrade réel.** La limite « 20 lots » affichée n'existe pas dans le code (aucun quota de lots dans `PLAN_QUOTAS`). Le seul trigger effectif est la 2e copropriété — que la plupart des bénévoles n'auront jamais. Décision : implémenter le quota de lots à 20 (ou l'assumer et le retirer de la landing) et rendre visible le vrai mur de valeur — les écritures AG et exports déjà gatés Essentiel (la 1re AG est le moment de panique, confirmé par la relecture métier) — via un composant `PlanGuard` en UI plutôt qu'un 403 découvert par l'utilisateur. **Tant que ce mur n'est pas mesuré, toute projection de conversion > 2 % est du wishful thinking** (d'où le SOM en scénarios, §2.3).
2. **Fuite de valeur du plan Pro** : réconciliation bancaire, SSE, cash flow — les arguments de vente du plan à 49 € — ne sont pas gatés dans le code ; et le comptage des quotas n'est pas filtré par tenant (en multi-tenant cloud, le quota d'un client est consommé par les autres). Ajouter `requirePlan('pro')` et corriger le scoping avant toute campagne.

**Unit economics — le trou du document, assumé.** Ni CAC chiffré, ni LTV, ni churn, ni coût de support ne sont modélisés à ce jour. Points durs identifiés : (a) des milliers de comptes gratuits = des bénévoles non techniques avec des questions *juridiques et comptables* — le coût de support du gratuit doit être modélisé (self-service par la base de connaissances + communauté, sinon le freemium est insoutenable) [hypothèse] ; (b) le churn bénévole a une cause structurelle propre au marché : **des copropriétés repassent en syndic professionnel** (taux inconnu) ; (c) à 19 €/mois, un payback < 12 mois exige un CAC quasi nul, donc de l'organique pur ([Bantrr](https://bantrr.com/business-model/saas-metrics/cac-payback-benchmarks-for-saas-companies/)). Décision : **P&L à 3 ans avec coût de support/compte gratuit et hypothèse de churn, avant toute présentation investisseurs.**

Ordre d'exécution pricing : **(1)** corriger le scoping multi-tenant des quotas, **(2)** gater Pro, **(3)** quota de lots Gratuit + `PlanGuard` UI, **(4)** aligner les docs sur 149 € + frais de mise en service, **(5)** seulement ensuite, communiquer.

---

## 8. Risques marché

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| **Conformité produit insuffisante au moment du scale** (compta incomplète, pas de LRE, claims non tenus) | Élevée | **Critique** | Geler les claims ; livrer import de balance → LRE (ou partenariat Syment) → grand livre/clôture, dans cet ordre, avant le push acquisition |
| **Hypothèses non validées par le terrain** (personas IA, willingness-to-pay de bénévoles qui dépensent l'argent de la copro voté en AG, prix concurrents non vérifiés) | Certaine | Élevé | **Préalable, pas jalon** : 15 bénévoles + 5 présidents CS + 3 cabinets + 3 devis réels sous 30 jours ; roadmap gelée au-delà du sprint 2 d'ici là |
| **Réaction concurrentielle au freemium** (LogicielSyndic gratuit en une semaine ; Matera « plateforme seule » ; Septeo via fédérations) | Moyenne-élevée | Élevé | Plan de réponse écrit : ne pas surenchérir en gratuité, accélérer le mur AG + douve conformité/associatif/AGPL. Si Matera lance à 25 €/mois : tenir le prix, attaquer sur la réversibilité des données et l'indépendance |
| **Vilogi** (offre bénévole complète déjà livrée) | Élevée | Élevé | Devis réel + benchmark fonctionnel de référence ; différencier sur UX moderne, freemium, transparence prix |
| **Guerre des prix bénévole** (LogicielSyndic 99 €/an) | Élevée | Moyen | Le Gratuit encaisse le choc ; Essentiel se justifie par un différenciateur *livré* (sinon prix de lancement, §7.1) |
| **Faible conversion freemium** (gratuit trop généreux, mur non implémenté) | Élevée | Élevé | §7.3 ; modéliser à 1–2 % tant que non mesuré ; instrumenter dès maintenant |
| **Churn structurel** (retour au syndic pro) + coût de support du gratuit non modélisé | Inconnue | Élevé | P&L 3 ans avec ces deux lignes avant toute levée ; base de connaissances self-service dès le lancement |
| **Cycle de vente 12–18 mois** sur le gisement « conversion depuis syndic pro » | Certaine | Moyen | Deux funnels séparés ; an 1 dimensionné sur les bénévoles installés uniquement |
| **Risque juridique sur comparatifs publics** (pages /vs/, claims prix) | Moyenne | Moyen | Devis réels + sourçage avant publication ; formulation « économisez en passant en bénévole » (§6.1) ; validation juriste |
| **Consolidation Septeo / verrouillage distribution** | Faible-moyenne | Élevé | Ancrage communautaire (AGPL, ARC/ANCC) difficile à racheter ; segment pro secondaire |
| **Fork / hébergement tiers AGPL** | Faible | Faible-moyen | La cible ne self-hoste pas ; périmètre open/payant écrit et stable (leçon Cal.com/[Cal.diy](https://aitoolly.com/ai-news/article/2026-04-22-caldiy-launched-as-mit-licensed-open-source-community-fork-of-calcom-for-self-hosters)) |

---

## Annexe — Synthèse des décisions demandées à l'équipe fondatrice

1. **Validation terrain sous 30 jours, roadmap gelée au-delà du sprint 2 d'ici là** : 15 bénévoles + 5 présidents de CS + 3 petits cabinets + 3 devis concurrents réels (Septeo, Vilogi, Matera). C'est le préalable de tout le reste.
2. **Nettoyer la landing** des claims non implémentés, y compris « AG conforme » (cette semaine).
3. **Re-prioriser le produit** : import balance/soldes → LRE (AR24 ou partenariat Syment) → compta complète ≥ 10 lots → comptes séparés (P3). Le module PPT minimal ou rien — pas de promesse sans module.
4. **Corriger le gating** : scoping multi-tenant des quotas, `requirePlan('pro')`, quota 20 lots, `PlanGuard` UI (avant tout push acquisition).
5. **Adopter le sizing recalibré** (SOM central 300–700 payants / 100–250 K€ ARR à 3 ans, scénarios documentés) et trancher explicitement le récit : PME rentable ou trajectoire venture avec plan d'expansion chiffré.
6. **Reformuler les claims** : « près de 300 000 copropriétés sans syndic professionnel » ; « économisez jusqu'à X €/an en passant en syndic bénévole » avec méthodologie sourcée — abandonner « 10x moins cher ».
7. **Pricing** : Entreprise à 149 €/mois + frais de mise en service 990–2 490 € (alignement docs, priorité faible) ; Essentiel à prix de lancement tant que la compta n'est pas livrée ; segmenter le message compta < 10 lots / ≥ 10 lots.
8. **Explorer le partenariat assurance RC syndic bénévole** — potentiellement le différenciateur le plus défendable du segment cœur [hypothèse à valider en interviews].

---

## Objections et réponses (devil's advocate)

Les critiques les plus fortes des deux relectures adverses, et l'arbitrage retenu.

**1. « Le funnel SOM est arithmétiquement impossible : 40–100K comptes gratuits pour un SAM de 50–80K. »**
*Retenue intégralement.* Le SOM était construit top-down depuis un objectif d'ARR. Il est reconstruit bottom-up (§2.3) : pénétration gratuite 10–15 % du SAM × conversion 1–2 % (paywall non prouvé) = 300–700 payants / 100–250 K€ ARR à 3 ans en scénario central. Le scénario haut (~500 K€) est conditionné à un mur freemium réparé et mesuré.

**2. « La conversion 4–6 % est du wishful thinking : vous documentez vous-mêmes que le paywall est cassé. »**
*Retenue.* Modélisation à 1–2 % tant que le mur AG n'est pas prouvé par des données réelles ; les 4–6 % deviennent le scénario haut, explicitement conditionné.

**3. « Zéro client, zéro interview — ce document aurait dû être écrit après la validation terrain, pas avant. »**
*Retenue, avec nuance.* Le document reste utile comme cadrage des hypothèses à tester, mais son statut change : chaque conclusion dépendant de la willingness-to-pay est marquée [hypothèse], les interviews passent de « jalon Q3 » à « préalable sous 30 jours » (2 semaines de travail réel), et la roadmap est gelée au-delà du sprint 2 d'ici là.

**4. « Le TAM compte des clients à qui vous avez décidé de ne rien facturer, et les 265K "sans syndic déclaré" sont un vivier fantôme. »**
*Retenue.* TAM monétisable recalculé à 15–30 M€ (vs 70–90 M€) : seulement les copros au-delà du mur freemium, et une fraction documentée (10–20 % [hypothèse]) des « sans syndic », à segmenter via RNIC.

**5. « "Votre première AG conforme" est le claim le plus dangereux : sans LRE, la convocation est le vice d'annulation d'AG le plus utilisé. »**
*Retenue intégralement* — critique métier la plus grave du lot. Le messaging devient « préparez votre AG » sans promesse de conformité de notification, et la LRE (AR24 ou partenariat Syment) monte dans les prérequis produit, juste après l'import de données.

**6. « La migration des données est LE mur d'adoption, pas une feature ; et l'art. 14-3 dispense vos plus petites cibles de la compta d'engagement. »**
*Retenues toutes deux.* Import balance + soldes individuels = prérequis produit n°1 ; campagnes synchronisées sur les clôtures d'exercice ; message compta segmenté < 10 lots (trésorerie simple) / ≥ 10 lots (décret 2005-240).

**7. « Le freemium hébergé n'est pas une douve — réplicable en une semaine — et la menace Matera est évacuée par un raisonnement de confort. Vilogi est par ailleurs mal classé. »**
*Retenue.* La carte §4.3 ne parle plus d'« espaces que nous sommes seuls à pouvoir occuper » ; un plan de réponse concurrentiel est écrit (§8 : ne pas surenchérir en gratuité, accélérer le mur AG, douve = conformité livrée + associatif + AGPL) ; Vilogi est reclassé concurrent fonctionnel n°1 du segment bénévole.

**8. « Aucune unit economics : pas de CAC, pas de churn, pas de coût de support du gratuit — et 149 €/mois ne couvre même pas une migration assistée. »**
*Retenue, traitée en deux temps.* Ce document acte le trou (§7.3) et exige un P&L 3 ans (support/compte gratuit, churn structurel « retour au syndic pro », payback) avant toute présentation investisseurs ; le plan Entreprise gagne des frais de mise en service one-shot (990–2 490 €) pour couvrir le coût de servir, et l'arbitrage 99/149 € est explicitement dépriorisé — c'est un alignement documentaire, pas la décision n°1.

*Points des relectures explicitement conservés du draft : la déflation du « 300K+ syndics bénévoles » (§2.2), le gel des claims comme préalable non négociable (§6.3) et les findings de gating (§7.3) — jugés exemplaires par les deux relecteurs, ils structurent la version finale.*

---

*Chiffres marqués [hypothèse] à valider avant usage externe. Sources URL consultées le 16/07/2026. Prochaine révision de ce document : après la campagne d'interviews (J+30).*
