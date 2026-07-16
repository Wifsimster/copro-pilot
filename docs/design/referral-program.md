# Design — programme de parrainage

> Date : 2026-07-16 — design pour l'issue #137. **Statut : différé (test au mois 9).**
> À ne pas construire avant d'avoir (a) une base d'utilisateurs actifs et (b) le
> funnel instrumenté (#123) pour mesurer l'effet. Ce document fige le design
> pour un déblocage rapide le moment venu.

## Objectif

Formaliser le bouche-à-oreille entre syndics bénévoles, moteur d'acquisition
central du GTM, en une mécanique mesurable — **sans** la sur-construire avant de
prouver qu'il y a un flux à amplifier.

## Récompense (hypothèse à tester)

- **3 mois du plan Essentiel offerts** par copropriété parrainée **activée**
  (pas seulement inscrite — l'activation évite le fraude/vanity).
- Plafond initial (p.ex. 12 mois cumulés) pour limiter le coût.

## Déclencheur : activation, pas inscription

Le crédit ne se déclenche qu'à l'**activation** du filleul (même définition que
la north-star du funnel, p.ex. « première AG créée » ou « copropriété + N lots »).
Cela aligne la récompense sur la valeur réelle et bloque le parrainage fictif.

## Modèle de données (esquisse)

```
referrals
  id             uuid pk
  referrer_user  string  → user.id      (parrain)
  code           string  unique          (code de parrainage partageable)
  referred_user  string  nullable → user.id (filleul, une fois inscrit)
  status         enum('pending','signed_up','activated','rewarded','expired')
  reward_months  int      default 3
  created_at     timestamptz
  activated_at   timestamptz nullable
  rewarded_at    timestamptz nullable
```

- Un `code` par parrain (généré à la demande).
- `status` progresse pending → signed_up → activated → rewarded.
- La récompense est appliquée via un crédit d'abonnement (coupon Stripe ou
  extension de `current_period_end`) — à cadrer avec l'intégration Stripe.

## Parcours

1. Le parrain récupère son lien (`?ref=<code>`) depuis son espace.
2. Le filleul s'inscrit via ce lien → `referrals.referred_user` renseigné,
   `status = signed_up`, event funnel `signup` avec `source = referral`.
3. À l'activation du filleul → `status = activated`, event `activation`.
4. Un job applique le crédit au parrain → `status = rewarded`.

## Anti-abus

- Récompense sur **activation** uniquement.
- Un filleul ne peut être parrainé qu'une fois ; auto-parrainage bloqué
  (referrer ≠ referred, e-mails/domaines distincts).
- Plafond de crédits cumulés par parrain.

## Mesure (dépend de #123)

- Taux d'activation des filleuls vs acquisition organique.
- Coût par activation parrainée (mois offerts × marge) vs CAC des autres canaux.
- K-factor du parrainage.

## Critère de lancement

Ne lancer que si, au mois 9 : base active suffisante + funnel instrumenté +
au moins un signal de bouche-à-oreille spontané à amplifier. Sinon, repousser.

## Pourquoi pas de code maintenant

Livrer une table + une UI de parrainage inertes avant d'avoir un flux à
amplifier serait du code mort à maintenir. Ce design permet un déblocage en
1–2 sprints le moment venu. L'issue #137 reste ouverte, différée.
