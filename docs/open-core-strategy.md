# Stratégie Open-Core CoproPilot

## Modèle de distribution

CoproPilot adopte un modèle **open-core** :
- Le **code source complet** est distribué sous licence **AGPL-3.0**
- Une **version cloud hébergée** propose des fonctionnalités premium via abonnement mensuel
- Le modèle s'inspire du playbook GitLab/Odoo : code ouvert, valeur ajoutée sur l'hébergement, l'automatisation et le support

## Pourquoi AGPL-3.0

L'AGPL-3.0 (Affero General Public License) a été choisie pour :
- **Protéger le moat** : tout fork hébergé publiquement doit ouvrir ses modifications
- **Signal de confiance** : dans un marché conservateur (syndics), la transparence du code réduit le risque perçu de vendor lock-in
- **Distribution gratuite** : les syndics bénévoles tech-savvy peuvent auto-héberger sans friction, devenant des évangélistes du produit

## Positionnement marché

### Message principal
**"Simple, moderne, 10x moins cher"** — pas "open-source"

Le terme "open-source" est un signal de confiance (transparence, auditabilité), mais ne doit jamais être le message principal vers les syndics. Les syndics bénévoles ne savent pas ce que signifie "open-source" et les professionnels l'associent à "non fini" ou "sans support".

### Cible primaire : syndics bénévoles (300K+ en France)
- Sous-servis par les outils existants
- Price-sensitive (souvent bénévoles non rémunérés)
- Non-techniques (Excel/papier comme outils actuels)
- Deviennent les évangélistes du produit par bouche-à-oreille

### Cible secondaire : syndics professionnels
- Utilisent des outils coûteux (3–8 €/lot/mois : POWIMO, Thetrawin, Clic-Syndic)
- Convertissent via le bouche-à-oreille des bénévoles et les partenariats expert-comptable

## Grille tarifaire

| Tier | Prix | Cible | Inclus |
|------|------|-------|--------|
| **Community** (self-hosted) | Gratuit | Développeurs / tech-savvy | Tout le code AGPL, Docker deploy |
| **Cloud Gratuit** | 0 € / mois | Syndics bénévoles | 1 copropriété, 20 lots, CRUD complet |
| **Essentiel** | 19 € / mois | Bénévoles avancés | 1 copropriété, 50 lots, AG + docs + compta export |
| **Pro** | 49 € / mois | Syndics pro (< 20 copros) | Multi-copropriété, workflows, bank reconciliation, SSE |
| **Entreprise** | 99 €+ / mois | Syndics pro (20+ copros) | SSO, API, audit trail, SLA, migration assistée |

### Règle d'or
> Ne jamais gater le CRUD de base — gater l'automatisation, le scale et la compliance.

### Split Free vs Premium

**Free (open-source core) :**
- Copropriétés, lots, copropriétaires, parties communes
- Incidents, documents, dashboard basique
- Conseil syndical, règlement, fiche synthétique

**Premium :**
- Multi-copropriété (> 1)
- AG workflow automatisé (convocations, PV)
- Réconciliation bancaire
- Cash flow prévisionnel
- SSE temps réel
- Workflows structurés (ordres de service)
- Exports comptables réglementaires
- RGPD automation
- SSO / Azure AD
- API & intégrations

## Stratégie d'acquisition client

### Phase 1 — Bénévoles (mois 1–3)
- **SEO** : "logiciel syndic bénévole gratuit", "alternative POWIMO gratuite"
- **Content** : comparatif CoproPilot vs Matera vs Excel, guide "devenir syndic bénévole"
- **Forums** : forum-copropriete.com, groupes Facebook syndic bénévole
- **Partenariat ARC/UNARC** : accès direct à des dizaines de milliers de bénévoles
- **Launch** : ProductHunt France, awesome-selfhosted, AlternativeTo

### Phase 2 — Monétisation (mois 4–8)
- Intégration Stripe pour le billing
- Upgrade prompts in-app au moment du besoin (2ème copro, AG, export compta)
- Cible : 50 clients payants à M8

### Phase 3 — Segment professionnel (mois 9–14)
- Partenariat expert-comptables copropriété (commission 15–20 % recurring)
- 1 événement régional FNAIM/UNIS (stand 2–5 K€, 10 leads qualifiés)
- White paper conformité réglementaire co-signé avec juriste
- Outil de migration CSV depuis POWIMO/Thetrawin

## Architecture technique du gating

### Backend
- Middleware `requirePlan('premium')` — même pattern que `requireAuth()`
- Variable d'environnement `LICENSING_MODE=self-hosted|cloud` — en self-hosted, le middleware est no-op
- Table `subscriptions` avec `stripe_customer_id`, `plan`, `status`, `current_period_end`

### Frontend
- Composant `PlanGuard` — affiche un upgrade CTA au lieu de la feature si le plan est insuffisant
- Les CTAs de la landing page passent `?plan=<tier>` au signup pour préparer le checkout Stripe

### Stripe
- Stripe Checkout (redirect, pas embedded) pour les plans payants
- Flow : signup → account creation → Stripe Checkout → webhook → plan activation
- 4 endpoints backend : `checkout-session`, `webhook`, `subscription`, `portal-session`

## Risques et mitigations

| Risque | Mitigation |
|--------|-----------|
| Fork compétitif bien financé | AGPL force l'ouverture des modifications. Le moat = service hébergé + support |
| Conversion faible (bénévoles restent sur gratuit) | Free tier limité en copropriétés, pas en features. Trigger = scale ou automatisation |
| Non-conformité réglementaire (self-hosted) | SaaS = path recommandé par défaut. Disclaimer légal clair pour self-hosted |
| Marché conservateur envers "open-source" | Ne pas lead avec "open-source" dans le messaging. Lead avec simplicité et prix |
