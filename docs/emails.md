# Système d'emails

Ce document décrit la configuration et les emails transactionnels envoyés par CoproPilot.

## Vue d'ensemble

```mermaid
graph LR
    A[Action] --> B[Service]
    B --> C{Environnement}
    C -->|Production| D[Serveur SMTP]
    C -->|Développement| E[Console logs]
    D --> F[Boîte de réception]
```

En production, les emails sont envoyés via SMTP (Nodemailer). En développement, ils sont affichés dans la console pour faciliter le débogage.

## Emails envoyés

| Email | Déclencheur | Destinataire |
|-------|-------------|-------------|
| **Vérification d'email** | Inscription d'un utilisateur | Nouvel utilisateur |
| **Code OTP** | Connexion par code à usage unique | Utilisateur demandeur |
| **Réinitialisation de mot de passe** | Demande de réinitialisation | Utilisateur demandeur |
| **Bienvenue copropriétaire** | Création de compte en masse | Nouveau copropriétaire |
| **Ajout à une copropriété** | Liaison d'un compte existant | Copropriétaire existant |

## Parcours des emails

### Vérification d'email

- Envoyé automatiquement à l'inscription
- Contient un lien de vérification valide **24 heures**
- Connexion automatique après vérification

### Code OTP (One-Time Password)

- Code à **6 chiffres** affiché en grand format
- Valide **15 minutes**
- Utilisé pour la première connexion des copropriétaires

### Réinitialisation de mot de passe

- Lien valide **1 heure**
- Déclenché par l'utilisateur ou par un administrateur

### Bienvenue copropriétaire

- Envoyé lors de la création de comptes en masse par le syndic
- Contient l'adresse email comme identifiant
- Bouton "Activer mon compte" vers la page de première connexion
- L'échec d'envoi ne bloque pas la création du compte

### Ajout à une copropriété

- Envoyé quand un utilisateur existant est lié à une nouvelle copropriété
- Informatif uniquement, aucune action requise

## Configuration SMTP

| Variable | Description | Défaut |
|----------|-------------|--------|
| `SMTP_HOST` | Serveur SMTP | _(requis en production)_ |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_USER` | Identifiant SMTP | _(requis en production)_ |
| `SMTP_PASSWORD` | Mot de passe SMTP | _(requis en production)_ |
| `SMTP_FROM` | Adresse d'expédition | `noreply@copropilot.fr` |

En développement, aucune configuration SMTP n'est nécessaire. Les emails sont affichés dans les logs du serveur.

## Design des emails

Tous les emails partagent un gabarit commun :

- **En-tête :** logo CoproPilot avec dégradé bleu
- **Corps :** texte personnalisé avec bouton d'action
- **Pied de page :** mention "Ne pas répondre" + copyright
- **Largeur :** 560 px maximum, responsive
- **Police :** système (-apple-system, Segoe UI, Roboto)
