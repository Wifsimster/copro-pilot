# Extranet copropriétaires

Ce document décrit l'espace extranet réservé aux copropriétaires. Il permet de comprendre les données accessibles, le contrôle d'accès et le parcours utilisateur.

## Vue d'ensemble

L'extranet est une interface en **lecture seule** destinée aux copropriétaires. Chaque utilisateur accède uniquement aux données liées à ses propres lots.

```mermaid
graph LR
    A[Copropriétaire] --> B[Connexion]
    B --> C[Extranet]
    C --> D[Tableau de bord]
    C --> E[Mon profil]
    C --> F[Mon compte]
    C --> G[Documents]
    C --> H[Conseil syndical]
```

L'extranet propose un tableau de bord personnel, la consultation du profil, du compte financier, des documents et — pour les membres élus — des données du conseil syndical.

---

## Accès et authentification

### Qui peut accéder ?

Seuls les utilisateurs ayant le rôle **copropriétaire** accèdent à l'extranet. Le système vérifie :

1. L'utilisateur est authentifié (session active).
2. Son rôle est `coproprietaire`.
3. Son compte est lié à une fiche copropriétaire (table `coproprietaires.user_id`).

Si l'une de ces conditions n'est pas remplie, l'accès est refusé (erreur 403).

### Sélection de la copropriété

Si le copropriétaire possède des lots dans **plusieurs copropriétés**, un sélecteur lui permet de basculer entre elles. Toutes les données affichées sont filtrées selon la copropriété sélectionnée.

---

## Pages de l'extranet

### Tableau de bord

Vue synthétique de la situation du copropriétaire :

- **Solde du compte** — Montant dû, montant payé, solde.
- **Prochaines AG** — Les 5 prochaines assemblées planifiées ou convoquées.
- **Incidents ouverts** — Les 5 derniers incidents en cours.
- **Notifications non lues** — Nombre d'alertes en attente.
- **Membre du conseil syndical** — Badge affiché si le copropriétaire est élu.

### Mon profil

Informations personnelles et patrimoniales :

- **Coordonnées** — Nom, prénom, email, téléphone, adresse de correspondance.
- **Lots possédés** — Numéro, type, surface, tantièmes pour chaque lot.
- **Copropriétés** — Liste des copropriétés où le copropriétaire possède des lots.

Le copropriétaire peut modifier son **téléphone** et son **adresse de correspondance** (droit de rectification RGPD, article 16).

### Mon compte

Situation financière résumée :

- **Total dû** — Somme de tous les appels de fonds.
- **Total payé** — Somme de tous les paiements enregistrés.
- **Solde** — Différence entre le montant payé et le montant dû.

### Mes charges

Historique des charges sur les **2 dernières années**, ventilé par trimestre.

### Mes appels de fonds

Historique des appels de fonds sur les **3 dernières années** avec date d'émission, date d'échéance, montant et statut.

### Mon fonds de travaux

Quote-part du fonds de travaux calculée **par lot**, en fonction des tantièmes du lot rapportés au total des tantièmes de la copropriété.

### Documents

Espace documentaire filtré par catégories accessibles :

- **Règlements** de copropriété.
- **Diagnostics** techniques (DPE, amiante) avec dates d'expiration.
- **Assurances** actives.
- **Contrats** avec prestataires.
- **Procès-verbaux** des 3 dernières AG terminées.
- **Contrat de syndic** en cours.

### Conseil syndical (accès restreint)

Accessible uniquement aux **membres élus** du conseil syndical. Affiche :

- Liste complète des copropriétaires de la copropriété.
- Soldes financiers de chaque copropriétaire (total dû, payé, solde).
- Soldes des comptes bancaires de la copropriété.

---

## Différences avec l'interface syndic

| Aspect | Extranet (copropriétaire) | Interface syndic |
|--------|--------------------------|------------------|
| **Données** | Personnelles uniquement | Toutes les copropriétés |
| **Écriture** | Lecture seule (sauf profil, paiement, vote) | Création, modification, suppression |
| **Pages** | 9 pages légères | 30+ pages de gestion |
| **Finances** | Propre solde et charges | Vue complète de tous les comptes |
| **Documents** | Consultation par catégorie | Gestion complète (téléversement, classement) |

---

## Paiement en ligne

Les copropriétaires peuvent régler leurs appels de fonds directement depuis l'extranet via **Stripe Checkout**.

```mermaid
sequenceDiagram
    participant C as Copropriétaire
    participant F as Frontend extranet
    participant B as Backend
    participant S as Stripe

    C->>F: Clic "Payer en ligne"
    F->>B: POST /api/extranet/payments/checkout
    B->>S: Créer Checkout Session (mode=payment)
    S-->>B: URL Checkout
    B-->>F: Redirection
    F->>S: Page de paiement (carte ou SEPA)
    C->>S: Paiement
    S-->>F: Redirection /#/extranet/compte?payment=success&session_id=...
    F->>B: POST /api/extranet/payments/confirm
    B->>B: Créer le paiement en base
    B-->>F: Paiement confirmé
```

- **Création de la session** — `POST /api/extranet/payments/checkout` crée une session Stripe Checkout en mode `payment` acceptant les moyens `card` et `sepa_debit`.
- **Succès** — Stripe redirige vers `/#/extranet/compte?payment=success&session_id=...`, et le frontend appelle automatiquement `POST /api/extranet/payments/confirm` pour enregistrer le paiement correspondant dans la table `paiements` (mode `autre`).
- **Webhook Stripe** — Le webhook `StripeService.handleCheckoutCompleted` reconnaît les sessions de type `coproprietaire_payment` via leurs metadata et crée également le paiement côté serveur pour éviter toute perte de transaction (voir [`stripe-integration.md`](./stripe-integration.md)).

---

## Mise à jour du profil (rectification RGPD Art. 16)

Le copropriétaire dispose de deux endpoints self-service pour exercer son **droit de rectification** (RGPD Art. 16) :

| Méthode | Route | Champs modifiables |
|---------|-------|-------------------|
| PUT | `/api/extranet/mon-profil` | téléphone, adresse de correspondance |
| PUT | `/api/extranet/mon-compte` | préférences de communication, email de contact |

Les modifications sont tracées dans le journal d'audit inviolable (voir [`GDPR-COMPLIANCE-REVIEW.md`](./GDPR-COMPLIANCE-REVIEW.md)).

---

## Vote électronique

Les copropriétaires ayant un compte lié (table `coproprietaires.user_id` renseignée) peuvent voter à distance aux assemblées générales depuis l'extranet.

- **Endpoint** — `POST /api/votes` (auth requise, rôle `coproprietaire`).
- **Pré-requis** — L'AG doit être au statut `convoquee` ou `en_cours` et autoriser le vote par correspondance.
- **Un vote par résolution** — Le vote est unique et ne peut pas être modifié après validation.
- **Traçabilité** — Chaque vote est horodaté et enregistré dans le journal d'audit.

---

## Conformité Loi ALUR

Un indicateur de conformité **Loi ALUR** est affiché sur la `CoproprieteDetailPage` via le composant `ComplianceCard`. Il récapitule :

- Immatriculation au registre national des copropriétés (numéro + date).
- Carnet d'entretien à jour.
- DTG (Diagnostic Technique Global) — présence et date.
- Fonds de travaux — provisionnement conforme.
- Fiche synthétique disponible pour les copropriétaires.

Chaque ligne affiche un statut (conforme, à vérifier, manquant) et un lien vers la ressource correspondante dans l'extranet.
