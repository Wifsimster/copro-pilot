# Audit du flux de paiement extranet — maniement de fonds

> Date : 2026-07-16 — brief d'audit interne pour l'issue #131.
> **Ce document n'est pas un avis juridique.** Il structure les questions et les
> risques à soumettre à un avocat spécialisé (droit de la copropriété + droit
> bancaire/ACPR) avant de développer davantage l'encaissement extranet.

## 1. Ce que fait le code aujourd'hui

Fichier : `apps/backend/src/services/ExtranetPaymentService.js`.

- Un copropriétaire règle son appel de fonds depuis l'extranet via **Stripe
  Checkout** en mode `payment` (paiement unique), moyens `card` et `sepa_debit`.
- La session Checkout est créée **sans Stripe Connect** : aucun
  `payment_intent_data.transfer_data`, aucune `destination`, aucun
  `on_behalf_of`. **Les fonds sont donc encaissés sur le compte Stripe de la
  plateforme CoproPilot**, puis (implicitement) reversés au syndicat via le
  compte bancaire relié à ce compte Stripe.
- Le paiement est ensuite enregistré en base (`paiements`, `mode: 'autre'`).

## 2. Le risque juridique

Les appels de fonds appartiennent au **syndicat des copropriétaires**, pas à
l'éditeur du logiciel. En encaissant ces sommes sur son propre compte, CoproPilot
**manie des fonds pour le compte de tiers**. Deux corpus se cumulent :

### a. Droit de la copropriété (loi ALUR / art. 18 loi de 1965)

- Le syndic doit détenir les fonds du syndicat sur un **compte bancaire séparé**
  ouvert au nom du syndicat. Un flux qui fait transiter ces fonds par un compte
  tiers (l'éditeur) contrevient à l'esprit de la séparation des fonds.
- Question à trancher : le rôle de CoproPilot dans ce flux est-il celui d'un
  simple prestataire technique (les fonds ne font que transiter) ou celui d'un
  encaisseur pour compte de tiers ?

### b. Droit bancaire (Code monétaire et financier / ACPR)

- Encaisser des fonds pour le compte d'autrui relève des **services de
  paiement** (art. L521-1 s. CMF). Sans exemption, cela requiert un statut agréé
  (établissement de paiement, ou statut d'**agent** d'un prestataire agréé).
- L'exemption « agent commercial » ou « mandataire » (art. L521-3) doit être
  vérifiée : elle est étroite.
- Stripe fournit l'infrastructure, mais **le titulaire du compte Stripe reste
  responsable** de la qualification réglementaire du flux.

## 3. Options de mise en conformité (à valider par le conseil)

| Option | Principe | Effort | Remarque |
|---|---|---|---|
| **A. Stripe Connect (destination)** | Chaque copropriété = un compte connecté ; les fonds vont **directement** au syndicat, CoproPilot ne fait que router + prélever une commission via `application_fee`. | Élevé | Aligne le flux sur la séparation des fonds ; nécessite l'onboarding KYC de chaque syndicat. Dépend de #132 (comptes séparés). |
| **B. Prélèvement au nom du syndicat** | CoproPilot déclenche un paiement dont le bénéficiaire est le compte du syndicat, sans jamais détenir les fonds. | Moyen | Suppose l'accès au compte séparé du syndicat (open banking / mandat SEPA au nom du syndicat). |
| **C. Sortir l'encaissement du produit** | L'extranet affiche l'IBAN du syndicat et un QR/RIB ; le copropriétaire paie directement. Pas d'encaissement par CoproPilot. | Faible | Supprime le risque réglementaire ; dégrade l'expérience (pas de réconciliation auto). |
| **D. Devenir agent d'un PSP agréé** | Contractualiser un statut d'agent auprès d'un établissement de paiement agréé ACPR. | Élevé | Lourd, mais lève l'ambiguïté si l'encaissement est stratégique. |

Recommandation d'audit : **geler toute promotion de l'encaissement extranet**
tant que l'option n'est pas tranchée ; privilégier A (aligné avec la roadmap
comptes séparés #132) ou C à court terme.

## 4. Questions précises pour l'avocat

1. Le flux actuel (encaissement sur le compte Stripe de l'éditeur puis reversement)
   constitue-t-il un service de paiement soumis à agrément ACPR ?
2. L'art. 18 de la loi de 1965 (compte séparé du syndicat) est-il enfreint par ce
   transit ?
3. L'option A (Stripe Connect destination) suffit-elle à qualifier CoproPilot de
   simple prestataire technique hors champ de l'agrément ?
4. Quel régime de responsabilité en cas de défaillance de l'éditeur alors que des
   fonds du syndicat sont en transit ?

## 5. Décision produit en attendant l'avis

- Ne pas mettre en avant l'encaissement extranet dans le marketing (déjà retiré
  des claims non étayés, cf. #118).
- Documenter dans le code (`ExtranetPaymentService`) que le flux est en cours de
  revue juridique.
- Lier ce chantier à #132 (comptes bancaires séparés) : l'option A en dépend.
