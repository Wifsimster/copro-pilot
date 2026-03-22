# Base de connaissances — Application legacy POWIMO

> Source : 23 captures d'ecran de l'application de production POWIMO (Square Habitat), prises le 13/03/2026.
> URL de production : `https://adb2.squarehabitat.fr`

---

## 1. Vue d'ensemble

POWIMO est un logiciel de gestion de syndic de copropriete edite par Square Habitat (filiale du Credit Agricole). L'application se compose de **deux couches** :

1. **Interface web moderne** (SPA) — accessible via navigateur, UI mauve/violet, responsive
2. **Application desktop legacy** (client lourd type Uniface/Windows) — accessible via un lien "Foire aux Questions" ou des modules specifiques (comptabilite, travaux, AG), UI classique Windows avec menus et barres d'outils

L'utilisateur navigue entre les deux couches de maniere transparente.

---

## 2. Navigation et structure

### 2.1 Barre laterale gauche (interface web)

Icones verticales donnant acces aux modules principaux :

| Icone | Module | URL |
|-------|--------|-----|
| Maison | **Tableau de bord** (Accueil) | `/accueil` |
| Personnage | **Tiers** (contacts) | `/tiers` |
| Immeuble | **Immeubles** (patrimoine) | `/patrimoine/immeubles` |
| Dossier | **Dossiers** (interventions) | `/gestion-des-interventions/liste-dossiers` |
| Fichier | **Documents** | — |
| Tableau | **Comptes** (comptabilite) | `/compta/comptes` |

### 2.2 Barre superieure

- **Logo POWIMO** centre
- **Barre de recherche** ("Rechercher vos tiers...")
- **Icones d'action** : statistiques (graphique), validations, parametres, synchronisation, outils
- **Profil utilisateur** en haut a droite (ex: "Christelle GAILLARD", avec lien Filtrer/Mes...)
- **Conversation** (icone bulle en haut a droite)

### 2.3 Menu de l'application desktop

Barre de menus classique Windows :
- **Choix de l'application** / **Gerance** / **Syndic** / **Banque** / **Analyses** / **Travaux** / **Finance** / **Edition** / **Window**

---

## 3. Modules detailles

### 3.1 Tableau de bord (`/accueil`)

**Composants :**
- **Dernieres modifications sur vos dossiers** : carrousel horizontal de cartes montrant les dossiers recemment modifies
  - Chaque carte affiche : titre du dossier, statut (badge colore : "En attente de reponse (2/3)", "Clos (4/4)", "Termine (3/3)"), type (GDI, AG)
  - Types de dossiers observes : GDI (Gestion Des Interventions), AG (Assemblee Generale)
- **Taches** : section avec agenda integre
  - Vue calendrier mensuelle (lun-dim)
  - Message "Cliquez sur + afin d'ajouter une ou plusieurs taches" quand vide
  - Bascule entre vue calendrier et vue liste
- **Vos Rappels** (dans le client lourd) : Aujourd'hui / A 5 jours / total
- **Vos Taches** (dans le client lourd) : Aujourd'hui / A 5 jours / En retard / total

**Exemples de dossiers observes :**
- "REPRISE JOINT SEUIL INFILTRANT SINISTRE MACOTTA" — GDI, En attente de reponse (2/3)
- "COREN : CHIFFRAGE URGENT SUITE CHOC VEHICULE" — GDI, En attente de reponse (3/3)
- "Assemblee generale de 27 RUE DU CHATEAU D'EAU" — AG, Clos (4/4)
- "ROUSSEL / reglage temporisation eclairage sous sol" — GDI, En attente de reponse (2/3)
- "JARDINS ET SERVICES DES GRAVES : DEMANDE D'INTERVENTION" — GDI, En attente de reponse (2/3)
- "ABC NETTOYAGE" — GDI, Termine (3/3)

### 3.2 Tiers (`/tiers`)

**Liste des tiers** — Annuaire de tous les contacts lies a la gestion.

**Filtres par type (onglets) :**
- **Tous** (defaut) — 10 000 resultats
- **Coproprietaire**
- **Fournisseur**
- **Garant**
- **Locataire**
- **Proprietaire**
- **Prospect locataire**

**Colonnes du tableau :**
| Colonne | Description |
|---------|-------------|
| Designation | Nom complet (civilite + nom + prenom, ou "M. et Mme NOM1/NOM2 Prenom1 / Prenom2") |
| Telephone | Numero de telephone |
| Email | Adresse email |
| Adresse | Adresse postale |
| CP - Ville | Code postal et ville |
| Qualites | Badge colore indiquant le role (L = Locataire, etc.) |

**Filtres avances :**
- Reference
- Designation
- Icone filtre avance

**Pagination :** 20 resultats par page, navigation 1-2-3-4-5...500

**Personnalisation :** Lien "Personnalisation de la liste" pour configurer les colonnes

### 3.3 Fiche Tiers (detail)

**Onglets de la fiche :**
- **General** : informations de base
- **Coproprietaire** : coproprietes liees

**Section General :**
- Avatar avec initiales
- Reference interne (ex: TIERS_793512)
- Badges : "General", "Coproprietaire" (onglets cliquables)
- Notification badge (chiffre sur l'onglet Coproprietaire)
- **Coordonnees :**
  - Email
  - Telephone (avec indicateur +1 pour plusieurs numeros)
  - Adresse complete (Chemin, Batiment, Appt, Residence, Entree, CP, Ville, Pays)
  - Langue (ex: Francais)
- **Espace Client :**
  - Toggle "Ouvrir l'acces" (on/off)
  - Identifiant (email / code)
  - Mot de passe (masque)
  - Bouton "Envoyer les identifiants par mail"
  - Lien "Acceder a l'Espace Client"
  - Tiers regroupes : possibilite de lier d'autres tiers

**Section Coproprietaire :**
- Liste des coproprietes auxquelles le tiers est rattache
- Chaque copropriete affiche :
  - Reference copropriete (ex: CPTE_520 - RCE SARIGNAN BAT A)
  - Adresse
  - Numero de compte (badge vert, ex: S.520.52650)
  - Gestionnaire (ex: GRAU Beverly)
  - Nombre de lots (ex: 2 lots)
  - Solde avec indication DB (debit) ou CR (credit) et montant en euros (ex: 761,50 EUR DB)
- Fonctions : Tout reduire, Rechercher

### 3.4 Immeubles / Patrimoine (`/patrimoine/immeubles`)

**Liste des immeubles :**

**Filtres :**
- Agence (ex: GAILLARD Christe...)
- Immigration (?)
- Internet
- Plus de filtres

**Colonnes :**
| Colonne | Description |
|---------|-------------|
| Nom de gestion | Reference interne (ex: IMME_10, IMME_15, IMME_20...) |
| Adresse ? | Numero et rue |
| Designation | Nom/adresse de l'immeuble |
| Ville | Ville |
| CP | Code postal |
| Ville | Ville |

**Resultats :** 157 resultats, filtre "448 1440 Montabo"

**Personnalisation :** "Personnalisation de la liste"

### 3.5 Fiche Immeuble (detail)

**En-tete :**
- Breadcrumb : Immeubles > Fiche
- Nom : "10 RUE PAS ST GEORGES"
- Badges : General (violet), Copropriete, Diffus
- Gestionnaire principal : C - Square Habitat (CAAA) / GAILLARD Christelle
- Icone immeuble avec reference (IMME_10)
- Type : Immeuble
- Adresse complete
- Label : Copropriete +1
- **Bouton "Demarrer une action"** (bleu, en haut a droite)

**Onglets :**
1. **Suivi** — Dernieres modifications (cartes d'AG clos), Taches, Agenda
2. **Acces** — Informations d'acces a l'immeuble
3. **Tiers** — Liste des tiers lies a l'immeuble
4. **Patrimoine** — Structure physique (lots)

**Sous-onglet Tiers :**
- Sous-filtres : Qualite, Entreprise
- Colonnes : Reference, Designation, Telephone, Email, Lien, Qualites
- Qualites representees par des etoiles colorees (jaune)
- Types de tiers : AUDI & A.E.E. (expert), EAF ABC NETTOYAGE (fournisseur), SARL POINTURE (prestataire), etc.

**Sous-onglet Patrimoine (Lots) :**
- Structure hierarchique : Entrees > Lots
- Entree (ex: "BATIMENT UNIQUE") avec selection visuelle
- Tableau des lots :

| Colonne | Description |
|---------|-------------|
| N° | Numero du lot |
| Entree | Nom de l'entree |
| Escalier | Numero d'escalier |
| Etage | Etage (RDC, 1, 2, 3, 4...) |
| Type | Type de lot (6M, T2, T2b...) |
| Designation | Description (Local commercial, APT T2...) |
| Categorie | Categorie (HA = Habitation) |
| Usage | Usage (HA = Habitation) |

### 3.6 Dossiers / Gestion des interventions

**Liste des dossiers (`/gestion-des-interventions/liste-dossiers`) :**

**Filtres :**
- Type de dossier
- Etat
- Agence (ex: GAILLARD Christe...)
- Recherche textuelle

**Colonnes :**
| Colonne | Description |
|---------|-------------|
| Reference | Code interne (ex: GDI_73961, AGE_74988, AGE_24807...) |
| Designation | Titre du dossier |
| Date de mise a jour | Date derniere modification |
| Etat | Statut (En attente de reponse, Clos...) |

**Types de references :**
- **GDI_** : Gestion Des Interventions (sinistres, reparations, entretien)
- **AGE_** : Assemblees Generales
- **ORI_** : Ordre de service (?)
- **DEV_** : Devis

**Etats observes :**
- En attente de reponse
- Clos
- (vide/en cours)

### 3.7 Fiche Dossier / Intervention (detail)

**En-tete :**
- Module : "Gestion des interventions"
- Breadcrumb : Gestion des interventions > Liste des dossiers
- Titre du dossier
- Badge d'etat (ex: "En attente de reponse")
- Icone editable (crayon)

**Informations du dossier :**
- Gestionnaire copropriete
- Dossier des interventions / Dossier comptable
- Reference : GDI_13861
- Cree le : date
- Etat : En attente de reponse

**Onglets :**
- **Actions** — Flux d'activite
- **Detail** — Informations detaillees

**Section Description et commentaires :**
- Texte libre decrivant l'intervention demandee
- Mots-cles / Etiquettes (ex: Syndic, Parties communes)

**Flux d'activite (timeline) :**
Chaque action dans le dossier est tracee chronologiquement :

1. **Ordre de service** :
   - Titre : "Ordre de service - ADRET : DEVIS REPRISE SINISTRE MACOTTA"
   - De : GAILLARD Christelle, A : ADRET
   - Responsable : DOENS PASSEMARD Stephanie
   - Reference : 370819
   - Contenu : description de la demande
   - **Montant provisionnel** affiche (ex: 3 635,5 EUR)
   - Badge d'etat : "En attente de reponse"
   - Bouton : **"Repondre a la place du fournisseur"**

2. **Message d'information** :
   - "Envoi d'une copie de l'Ordre de service n° 362365"
   - De : GAILLARD Christelle
   - Destinataires : liste des personnes informees

3. **Ordre de service (abandonne)** :
   - Meme structure mais avec statut "Abandonne"
   - Montant provisionnel different

**Bouton principal :** "Ajouter une action" (en haut a droite)

### 3.8 Comptes / Comptabilite (`/compta/comptes`)

**Interface web :**
- Titre : "Consulter les comptes"
- **Onglets de type de compte :**
  - Tous (defaut)
  - Syndic
  - Gerance
  - Monopolpropriete (mono-propriete?)
  - Image

- **Filtres :**
  - Agence
  - Proprietaire
  - Immeuble
  - Classe
  - Solde
  - Recherches enregistrees

- Illustration POWIMO (mascotte pecheur) quand aucune recherche n'est lancee

### 3.9 Application desktop — Copropriete (client lourd)

L'application desktop s'ouvre dans un cadre de type Uniface/application Windows native. Elle est accessible depuis l'interface web via certains liens.

**Onglets de la fiche copropriete :**
1. **Designation** — Informations generales
2. **Divers** — Sections critiques
3. **Prod** — Production / parametres

#### Onglet Designation :
- **Enregistrement** : numero d'identification
- Regime de gestion
- Type de copropriete (dropdown)
- **Mandat :**
  - Date debut mandat
  - Duree du mandat
  - Cle debut mandat
  - Date fin prevue
  - (cases a cocher liees au mandat)
- **Chantier des coproprietaires :**
  - Fin de l'adresse
  - Complement d'adresse
  - Code postal
  - Ville (dropdown)
  - Pays/Ville T.A.
  - Departement
  - Fraction N° 1 a 6

- **Section droite :**
  - Destination
  - Charges
  - (plusieurs champs specifiques au syndic)

- **Vendeur / Acheteur** : sections pour mutations

#### Onglet Divers :
- Sections critiques (grilles de donnees) :
  - Regroupement
  - Mode de codification
  - (parametres comptables)
- **Section "Sections critiques"** avec tableau
- Date et configuration

#### Onglet Prod :
- Lien d'affichage sur le site
- Images disponibles
- Annonces de Conso

### 3.10 Application desktop — Assemblees Generales

**Ecran "Assemblees Generales" :**
- Tableau chronologique des AG avec colonnes :
  - Date AG
  - Exercice
  - Exercice copropriete
  - Heure
  - Responsable
  - Lieu

- Chaque ligne est coloree (rouge = element important, vert = clos)
- Dates observees : 2014-2025, montrant l'historique complet

**Section details AG (bas de l'ecran) :**
- Date de presence
- Envoi des convocations le : date
- Date envoi du P.V : date
- Nombre de personnes convoquees
- Nombre de presents et de mandants
- Nombre de resolutions enregistrees
- **Regularisation de charges** :
  - Date depart / Ex periode / N° Partie / N° d'evenement
  - Boutons "Editer Repartition"

**Sections courrier :**
- Date des editions (cas a cocher) :
  - Feuilles, Recommandes, Lettre simple, Rappel des, Procuration
  - Convocations, CR, Pouvoirs

### 3.11 Application desktop — Saisie d'offres / Devis

**Ecran de saisie de devis :**
- **En-tete :**
  - Numero, Login, Activite (ex: CHARPENTIER TOITURE)
  - Modele, Date
  - Proprietaire, Conjoint, Responsable (ex: COLETTA)
- **Objet du devis** : texte libre
- **Dates :**
  - Date limite d'envoi
  - Date apres limite
  - Date limite reception
  - Demande relance
- **Interlocuteurs :**
  - Syndic (code + nom)
  - Ton/place (?)
- **Selection des fournisseurs :**
  - Case a cocher "Cas d'Urgence" / "Cas a l'Amiable"
- **Emetteur :**
  - Numero
  - Adresse (ex: "ERA CHIFFRAGE CONTROLE DE L'ENSEMBLE DES VOITURES/TOIL...")
- **Caracteristiques :**
  - Groupement
  - Discipline
  - Sous-discipline
  - A la piece / A regler
  - Garantie prevue

**Actions :** Reglement, Mandat de conds(?), Tolerance, Types de charges, Penalites contractuelles, Appels d'offres, Appels de fonds, Ordre de service

### 3.12 Application desktop — Immeuble (fiche complete)

**Onglets de l'immeuble dans le client lourd :**
1. **Description**
2. **Photos**
3. **Divers**
4. **Police d'assurance**
5. **TVA**
6. **Equipements**
7. **Chauffage**
8. **Frais accessoires**

#### Onglet Description :
- Identifiant (reference)
- Noms
- Groupement (ex: PAU)
- Responsable T.V : nom
- Responsable Gle : nom
- Adresse complete
- Labels (ex: CPTE, SARIGNAN)
- **Date d'acquisition**
- **Lots :**
  - En Syndic (checkbox), En gerance (checkbox)
  - Fonds : 4 champs numeriques
  - Immobilise : 4 champs numeriques
  - Comptabilisation
- **Caracteristiques :**
  - FLTX
  - Date Logement
  - Nbr Logement
  - Possibilite Teletrans
  - Societe Teletrans
- **Hospitalisation / Annexes :**
  - Cellule de crise
  - Frequence d'entretien, Frequence d'aspiration, date
- **Ascenseur** : lien vers contrats

#### Onglet Divers :
- Constructeur
- Permis de construire (numero, date)
- Donnees modification (date)
- **Achevement des Travaux :**
  - Date d'achevement
  - Date de reception
  - Date de conformite
  - Compagnie
- **Police Dommages et Ouvrages :**
  - Denomination, Compagnie, Courtier, Numero de police
- **Assurance Multirisque :**
  - Type, Compagnie (ex: GENERALI / ALLIANZ / FOUGERE / S...)
  - Courtier, Numero de police
  - Debut convention, Date d'echeance
- **Autres assurances** : denomination, courtier, numero de contrat
- **Adresse IGN :** code, libelle, code postal, ville, parcelle cadastrale

#### Onglet Equipements :
- Liste de checkboxes pour les equipements de l'immeuble :
  - Societe gardiennage, Eau chaude collective, Local Video/Poussettes
  - Societe nettoyage, MNC, Montee charges
  - Antenne TV, Collection monnaie, Production chauffage
  - Visiophone, Suppletif, Societe Espaces Verts
  - Cable (TV), Telecommunication
  - Interphone, Espace lectromagn.
  - Ascenseur video-phonique, Sonde electronique, Numero loge
  - Code, Telephone loge
  - Local jardin, Telesurveillance, Cle du registre
  - Loge gardien, Compteurs automatiques, Ratio consommation ECS/chauffage
  - Portail automatique, Traitement des eaux, Chaudiere presence cursive
  - Digipode, SBI, Energies consommees N-1
  - Fibre de chateau, Chaudiere presence cursive, Energies consommees N-2
  - Traitement des eaux, Exportit visuel ext (e-MK), Date inspection chaudiere
  - Panneau affichage, prise de protection des enseignements, Panneaux TV
  - Securite au niveau d'accessionement, Prise telephonique

### 3.13 Application desktop — Module Syndic

**Menu principal Syndic (panneau lateral) :**

**Arborescence :**
- Syndic
  1. **Postes de frais** >
  2. Calcul Honoraires gestion
  3. Calcul Frais forfaitaires
  4. =>Purge frais gestion SV
  5. Saisie de frais unitaire
  6. =>Consultation saisie
  7. **Validation des frais**
  8. =>Voir les ecritures
  9. Mise a jour comptabilite
  10. Edition des factures
  11. **Annulation de frais** >
  12. **Historiques** >

- Votre choix : champ de saisie numerique

**Rappels et taches visibles en permanence** (panneau gauche)

### 3.14 Application desktop — Module Comptabilite

**Menu principal Comptabilite (panneau lateral) :**

**Arborescence :**
1. **Encaissements**
2. Facture : Saisie/Placement
3. Comptabilite - OD & Etats
4. Traitements Coproprietes
5. Banque
6. Administration Copropriete
7. Gestion Technique
8. Fichiers de base
9. Etats & statistiques

---

## 4. Entites et relations metier

### 4.1 Entites principales

| Entite | Description | Reference |
|--------|-------------|-----------|
| **Tiers** | Tout contact (personne ou entreprise) | TIERS_XXXXX |
| **Immeuble** | Batiment physique | IMME_XX |
| **Copropriete** | Entite juridique de copropriete | CPTE_XXX |
| **Lot** | Unite dans un immeuble (appartement, local...) | Numero sequentiel |
| **Dossier** | Dossier de suivi (intervention, AG...) | GDI_XXXXX, AGE_XXXXX |
| **Ordre de service** | Demande envoyee a un fournisseur | Reference numerique |
| **Assemblee Generale** | Reunion de copropriete | Date + exercice |
| **Compte** | Compte comptable | S.XXX.XXXXX |
| **Devis** | Demande de chiffrage | DEV_XXXX |

### 4.2 Relations

```
Tiers (1) ──── (N) Copropriete (via role : coproprietaire, locataire, etc.)
Immeuble (1) ──── (N) Lots
Immeuble (1) ──── (N) Entrees ──── (N) Lots
Immeuble (1) ──── (N) Tiers (via qualites : fournisseur, gestionnaire, etc.)
Immeuble (1) ──── (N) Copropriete
Copropriete (1) ──── (N) Assemblees Generales
Copropriete (1) ──── (1) Gestionnaire (Tiers)
Dossier/Intervention (1) ──── (N) Ordres de service
Dossier/Intervention (1) ──── (N) Messages
Ordre de service ──── (1) Fournisseur (Tiers)
```

### 4.3 Roles des tiers (Qualites)

- **Coproprietaire** — proprietaire d'un ou plusieurs lots
- **Locataire** — locataire d'un lot
- **Fournisseur** — prestataire de services (nettoyage, reparation, etc.)
- **Garant** — garant d'un locataire
- **Proprietaire** — proprietaire en gerance
- **Prospect locataire** — candidat locataire
- **Gestionnaire** — employe du syndic responsable d'immeubles

---

## 5. Workflows identifies

### 5.1 Workflow de gestion d'intervention (GDI)

```
1. Creation du dossier (titre, description, copropriete, mots-cles)
2. Emission d'un ordre de service a un fournisseur
   → Montant provisionnel
   → Statut : "En attente de reponse"
3. Envoi de messages d'information aux parties prenantes
4. Suivi des reponses fournisseurs
   → Le gestionnaire peut "Repondre a la place du fournisseur"
5. Eventuellement abandon d'un ordre de service et creation d'un nouveau
6. Cloture du dossier quand toutes les actions sont terminees
```

**Statuts du dossier :** En attente de reponse (X/Y) → Clos (X/Y) | Termine (X/Y) | Abandonne

Le format (X/Y) indique le nombre de reponses recues sur le total attendu.

### 5.2 Workflow d'assemblee generale (AG)

```
1. Planification de l'AG (date, heure, lieu, exercice)
2. Envoi des convocations (avec date d'envoi)
3. Tenue de l'AG
   → Enregistrement des presences et mandats
   → Vote des resolutions
4. Envoi du P.V. (proces-verbal)
5. Regularisation de charges
   → Lien vers repartition
6. Archivage (statut Clos)
```

### 5.3 Workflow comptable (Syndic)

```
1. Definition des postes de frais
2. Calcul des honoraires de gestion
3. Calcul des frais forfaitaires
4. Saisie des frais unitaires
5. Validation des frais
6. Visualisation des ecritures
7. Mise a jour de la comptabilite
8. Edition des factures
```

### 5.4 Workflow de devis / appel d'offres

```
1. Creation du devis (objet, interlocuteurs, dates limites)
2. Selection des fournisseurs (urgence vs amiable)
3. Envoi des demandes
4. Reception et comparaison des offres
5. Validation et emission d'un ordre de service
```

### 5.5 Workflow d'encaissement

```
1. Encaissements
2. Saisie de factures / Placement
3. Operations diverses (OD) et Etats
4. Traitements Coproprietes
5. Rapprochement bancaire
6. Administration Copropriete
```

---

## 6. Fonctionnalites cles observees

### 6.1 Gestion des tiers
- Annuaire complet avec 10 000+ contacts
- Filtrage par type (coproprietaire, fournisseur, locataire, etc.)
- Fiche detaillee avec coordonnees, adresse, langue
- **Espace Client** : portail web pour les coproprietaires avec gestion des identifiants
- Regroupement de tiers (liens entre personnes)
- Vision multi-copropriete par tiers (soldes, lots, gestionnaires)

### 6.2 Gestion du patrimoine
- Inventaire des immeubles avec adresses et gestionnaires
- Structure hierarchique : Immeuble → Entrees → Lots
- Lots avec typologie detaillee (type, designation, categorie, usage, etage, escalier)
- Equipements de l'immeuble (longue liste de checkboxes)
- Assurances (multirisque, dommages-ouvrage)
- Dates cles (acquisition, achevement travaux, reception, conformite)
- Adresse IGN / parcelle cadastrale

### 6.3 Gestion des interventions
- Dossiers structures avec timeline d'actions
- Ordres de service avec montants provisionnels
- Suivi des reponses fournisseurs
- Possibilite de repondre a la place du fournisseur
- Messages d'information automatiques
- Statuts granulaires (en attente X/Y, clos, termine, abandonne)

### 6.4 Comptabilite
- Comptes par type (Syndic, Gerance, Mono-propriete)
- Filtrage multi-criteres (agence, proprietaire, immeuble, classe, solde)
- Recherches enregistrees
- Soldes avec indication DB/CR (debit/credit)

### 6.5 Assemblees Generales
- Historique complet des AG (2014-2025+)
- Gestion des convocations et PV
- Suivi des presences et mandats
- Enregistrement des resolutions
- Regularisation de charges post-AG

### 6.6 Devis et appels d'offres
- Saisie structuree avec interlocuteurs
- Dates limites multiples (envoi, reception)
- Categorisation (groupement, discipline, sous-discipline)
- Selection fournisseurs par urgence

---

## 7. Patterns UI/UX a retenir

### 7.1 Interface web moderne
- **Couleur dominante** : violet/mauve (theme Square Habitat)
- **Cartes horizontales** pour les dossiers recents (carrousel)
- **Badges colores** pour les statuts (vert = clos, orange = en attente, rouge = termine)
- **Onglets** pour les sections de fiches
- **Tableaux paginés** avec personnalisation des colonnes
- **Breadcrumbs** pour la navigation hierarchique
- **Bouton CTA** "Demarrer une action" en haut a droite des fiches
- **Timeline** pour le suivi d'activite (messages, ordres de service)
- **Calendrier** integre dans le tableau de bord
- **Recherche globale** permanente dans la barre superieure
- **Avatar avec initiales** pour les contacts sans photo

### 7.2 Application desktop (client lourd)
- **Formulaires denses** avec beaucoup de champs par ecran
- **Onglets multiples** (8+ par fiche)
- **Checkboxes massives** pour les equipements
- **Menus hierarchiques** (arborescence numerotee)
- **Grilles de donnees** colorees (rouge/vert) pour les AG
- **Barres d'outils** avec icones

---

## 8. Donnees et volumes observes

| Donnee | Volume |
|--------|--------|
| Tiers | 10 000+ |
| Immeubles | 157+ (pour une agence) |
| Dossiers | Centaines (multiples pages) |
| AG par immeuble | ~10 ans d'historique |
| Lots par immeuble | 5+ par entree |

---

## 9. Informations techniques

- **URL** : `https://adb2.squarehabitat.fr`
- **Editeur** : Square Habitat (Credit Agricole)
- **Architecture** : Hybride web + client lourd
- **Client lourd** : Probablement Uniface ou technologie similaire (formulaires Windows natifs)
- **Utilisateur observe** : Christelle GAILLARD (gestionnaire syndic)
- **Agence** : Square Habitat (CAAA / CAAAT)
- **Regions observees** : Bordeaux, Biscarrosse, Aurillac, Saint-Pierre-D'Aurillac, Talence, Merignac

---

## 10. Ecarts avec CoproPilot actuel

### Fonctionnalites presentes dans POWIMO mais absentes ou partielles dans CoproPilot :

1. **Espace Client coproprietaire** — portail web dedie avec identifiants
2. **Ordres de service** — workflow structure avec fournisseurs et montants provisionnels
3. **Devis / Appels d'offres** — module complet de chiffrage
4. **Equipements d'immeuble** — liste exhaustive (30+ types)
5. **Assurances** — multirisque, dommages-ouvrage, polices detaillees
6. **Historique AG sur 10+ ans** — archive longue duree
7. **Tiers regroupes** — liens entre personnes (couples, etc.)
8. **Repondre a la place du fournisseur** — fonction operationnelle cle
9. **Recherches enregistrees** — sauvegarde de filtres comptables
10. **Module Syndic complet** — frais, honoraires, factures, annulation
11. **Parcelle cadastrale / Adresse IGN** — geolocalisation precise
12. **Achevement travaux** — dates de reception, conformite
13. **Taches et rappels** — systeme de taches avec echeances (aujourd'hui, a 5 jours, en retard)
14. **Messages d'information** — notifications automatiques aux parties prenantes
15. **Regularisation de charges post-AG** — lien direct AG → comptabilite
16. **Multi-agence** — filtrage par agence
17. **Personnalisation des listes** — colonnes configurables par utilisateur
18. **Conversation** — messagerie integree
