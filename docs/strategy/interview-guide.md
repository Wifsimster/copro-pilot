# Guide d'entretien — validation terrain (préalable bloquant)

> Date : 2026-07-16 — livrable de l'issue **#159**. Ce guide est l'outillage ; **les entretiens eux-mêmes sont à conduire par l'équipe** (recrutement, appels, synthèse). Objectif : passer d'une stratégie fondée sur des personas IA à des hypothèses testées, **sous 30 jours**, roadmap gelée au-delà du sprint 2 d'ici là.

## Cible d'échantillon

| Segment | N | Recrutement |
|---|---|---|
| Syndics bénévoles (P1) | 15 | ARC/ANCC, forums (Universimmo, groupes Facebook copropriété), r/vosfinances, panels rémunérés, utilisateurs du plan Gratuit |
| Présidents de conseil syndical (P2) | 5 | mêmes canaux + réseau |
| Petits cabinets < 20 copros (P3) | 3 | annuaires, LinkedIn, comparateurs |

Incitation : 30-50 € (bon d'achat) pour 45 min ; les utilisateurs Gratuit peuvent être sollicités in-app.

## Hypothèses à trancher (rappel — doc 2/3 §4.1)

- **H1** — la douleur n°1 est le *job juridique/comptable* (peur de l'erreur qui engage la responsabilité), pas la vitesse au clic.
- **H2** — un mur d'upgrade *par la valeur* (LRE, compta, encaissement, reprise) convertirait ; le mur « 20 lots » est mort.
- **H3** — la reprise de gestion prend 2-4 h avec accompagnement (pas « 5 min »).
- **H5** — willingness-to-pay réelle vs ancrage ~99 €/an (LogicielSyndic).
- **Frein RC** — la responsabilité civile personnelle est le frein n°1 d'adoption.
- **Circuit de décision** — paiement perso vs vote en AG (art. 24).
- **Assurance RC packagée** — différenciateur réel ou hypothèse creuse ?

## Trame d'entretien P1 (bénévole) — 45 min

**1. Mise en contexte (5 min)** — sans mentionner CoproPilot.
- Depuis quand êtes-vous syndic bénévole ? Combien de lots ? Pourquoi avoir pris le mandat (ou quitté un syndic pro) ?
- Décrivez votre dernière AG, de la convocation au PV. Qu'est-ce qui a été pénible ?

**2. Douleurs & job-to-be-done (15 min)** — laisser parler, ne pas suggérer.
- Qu'est-ce qui vous inquiète le plus dans ce rôle ? *(écouter si « responsabilité » émerge spontanément — test H1 + frein RC)*
- Avez-vous déjà eu peur de faire une erreur ? Laquelle ? Que risquiez-vous personnellement ?
- Comment tenez-vous les comptes aujourd'hui (Excel, logiciel, papier) ? Qu'est-ce qui casse ?
- Comment avez-vous récupéré les données en reprenant la gestion ? Combien de temps ? *(test H3)*

**3. Outils & alternatives (5 min)**
- Quels outils avez-vous essayés ? Pourquoi les avez-vous gardés/abandonnés ?
- Connaissez-vous LogicielSyndic, Vilogi, Matera, Copriciel ? Qu'en pensez-vous ?

**4. Test du frein responsabilité civile (5 min)**
- Êtes-vous assuré en responsabilité civile pour ce mandat ? Y avez-vous pensé ?
- Si un outil vous disait « je vérifie vos délais et vos calculs pour éviter l'erreur qui vous engage », quelle valeur y mettriez-vous ?
- *(sonder H « assurance RC packagée ») :* si l'abonnement incluait une assurance RC syndic bénévole, cela changerait-il votre décision ?

**5. Prix — Van Westendorp (8 min)** — 4 questions canoniques, pour un outil « qui gère AG, appels de fonds, compta simplifiée, extranet » :
- À quel prix annuel le jugeriez-vous **trop cher** pour l'envisager ?
- À quel prix **cher, mais envisageable** ?
- À quel prix **bon marché / bonne affaire** ?
- À quel prix **trop bas** pour être crédible / sérieux ?
- Puis : **qui paierait** — vous personnellement, ou la copropriété via un vote en AG ? Avez-vous déjà fait voter une dépense d'outil en AG ? *(circuit de décision)*

**6. Clôture (2 min)** — accepteriez-vous d'être recontacté / de tester un prototype ?

## Trame P2 (président de CS) — variations
- Votre rôle vis-à-vis du syndic (pro ou bénévole) ? Contrôlez-vous les comptes ? Comment ?
- Un outil de contrôle/lecture des comptes vous intéresserait-il ? Le feriez-vous adopter en AG ?
- *(test de la thèse « prescripteur, pas payeur » — doc 2/3 §3.1)*

## Trame P3 (cabinet) — variations
- Quel logiciel utilisez-vous ? Coût ? Ce qui vous manque ?
- Comment gérez-vous les **comptes séparés** par copropriété et le **contrôle du garant** (loi Hoguet) ?
- Une migration depuis POWIMO/Thetrawin : qu'est-ce qui vous ferait basculer ? Qu'est-ce qui vous bloque ?
- Willingness-to-pay pour un plan Pro à 49 € + 3 €/copro ?

## Grille de synthèse (à remplir après chaque entretien)

| Champ | Valeur |
|---|---|
| Segment / nb lots | |
| Douleur n°1 (verbatim) | |
| « Responsabilité » citée spontanément ? (O/N) | |
| H1 confirmée ? (job juridique = motif n°1) | |
| Temps de reprise déclaré (H3) | |
| Van Westendorp : trop cher / cher / bon marché / trop bas | |
| Qui paie (perso / vote AG) | |
| Intérêt assurance RC packagée (1-5) | |
| Outils connus / utilisés | |
| Recontact OK ? | |

## Seuils de décision (doc 2/3 §4.2)

- **Signal** : « job juridique » (H1) motif n°1 dans **≥ 12/20** entretiens P1+P2.
- **Pivot** : priorisation POWIMO-centrée invalidée → re-prioriser la roadmap.
- **Prix** : la zone de prix acceptable (Van Westendorp, intersection des courbes) tranche le débat Essentiel 19 € vs ancrage 99 €/an et alimente le scénario ARPU (9 € vs 19 €).
- **Assurance RC** : go/no-go sur l'axe — ne pas en faire l'argument central sans ≥ 60 % d'intérêt fort.

**Livrable de sortie** : synthèse des 23 entretiens + décision sur H1/H3/H5, fourchette de prix, et go/no-go assurance RC — qui débloque la roadmap et alimente le modèle financier (#158) et le SAM (#160).
