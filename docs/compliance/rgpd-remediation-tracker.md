# Tracker de remédiation RGPD — écarts résiduels

> Date : 2026-07-16 — tracker opérationnel pour l'issue #130.
> Source de vérité de l'audit : [`docs/GDPR-COMPLIANCE-REVIEW.md`](../GDPR-COMPLIANCE-REVIEW.md)
> (note de conformité ~55 %, risque résiduel MOYEN).
>
> **Ce document ne produit aucun texte juridique.** Les livrables « politique de
> confidentialité », « DPIA » et « procédure de violation » doivent être rédigés
> ou validés par un juriste — ne pas publier de texte auto-généré comme faisant foi.

## Règle d'or marketing

Ne **jamais** écrire « conforme RGPD ». Formulation autorisée : « conçu pour la
conformité », adossée à des preuves techniques (chiffrement PII, audit trail,
export/effacement). Chaque claim de conformité passe par le juriste.
**Prérequis bloquant du hub marketing « Sécurité / Conformité ».**

## Écarts résiduels (les ~45 % restants)

| # | Écart | Article | Type de livrable | Priorité | Acceptation |
|---|---|---|---|---|---|
| 1 | Mécanisme de consentement (case + retrait + table `consent_records`) | Art. 6, 7 | Code + juridique | Haute | L'utilisateur donne/retire son consentement ; l'état est horodaté et auditable ; base légale documentée par traitement. |
| 2 | Page politique de confidentialité | Art. 12, 13, 14 | **Juridique** (rédaction) puis code (page) | Haute | Politique rédigée/validée par un juriste, publiée, accessible depuis le pied de page et l'inscription. |
| 3 | Politique de rétention documentée + purge | Art. 5(1)(e) | Code + juridique | Haute | Durées définies par catégorie (sessions, logs, PII, comptable 6–10 ans) ; purge automatique des sessions/logs expirés ; conservation comptable préservée. |
| 4 | Procédure de notification de violation (72 h) | Art. 33, 34 | Process + doc | Moyenne | Runbook de détection→notification CNIL sous 72 h ; registre des violations. |
| 5 | DPIA (analyse d'impact) | Art. 35 | **Juridique** | Moyenne | DPIA réalisée pour les traitements à risque (PII financières / IBAN, extranet). |
| 6 | Bandeau cookies / traceurs | Art. 82 LIL | Code | Moyenne | Bandeau conforme (refus aussi simple que l'accord) si des traceurs non essentiels sont posés ; sinon documenter l'absence de traceurs. |
| 7 | DPA sous-traitant (extranet, emailing, Stripe) | Art. 28 | Juridique | Moyenne | Contrats de sous-traitance / DPA en place pour chaque sous-traitant. |
| 8 | Minimisation des logs (IP/user-agent) | Art. 5(1)(c) | Code | Basse | Revue du logging : pas de PII superflue ; rétention courte (cf. #3). |

## Ordonnancement recommandé

1. **Sprint 1 (code, faible risque)** : #3 purge des sessions/logs expirés
   (durées à faire valider), #8 minimisation des logs, #6 audit des traceurs.
2. **Sprint 2 (code + juridique)** : #1 consentement (table + UI + retrait).
3. **En parallèle (juridique)** : #2 politique de confidentialité, #5 DPIA,
   #7 DPA — pilotés par le juriste, intégrés au produit une fois rédigés.
4. **Process** : #4 runbook de violation.

## Ce qui est DÉJÀ en place (ne pas refaire)

D'après l'audit : droits des personnes (Art. 15/16/17/20 — export & effacement),
audit trail infalsifiable (Art. 5(2), hash chain), chiffrement PII opt-in des IBAN
(AES-256-GCM), soft-delete pour l'effacement préservant l'intégrité comptable.

## Budget indicatif

10–20 k€ (rédaction juridique + jours de dev), à traiter **avant** le hub
conformité marketing (cf. `docs/strategy/go-to-market.md` §3.2 / §6).

## Suivi

L'issue #130 reste ouverte comme épopée ; chaque ligne du tableau devient une
sous-tâche/PR dédiée au fur et à mesure.
