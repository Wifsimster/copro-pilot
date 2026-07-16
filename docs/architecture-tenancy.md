# Architecture — modèle de tenancy et sémantique des quotas

> Date : 2026-07-16 — clarifie le modèle réel de multi-locataire (tenancy) de
> CoproPilot suite à l'analyse de l'issue #120.

## Constat

CoproPilot est aujourd'hui **mono-locataire par déploiement** (single-tenant
per instance) : un syndic = une instance = une base de données.

Preuve dans le schéma : les entités métier (`coproprietes`, `lots`,
`coproprietaires`, comptabilité…) n'ont **aucune colonne de rattachement à un
propriétaire ou à une organisation** (`organization_id`, `owner_id`, `tenant_id`
sont absents de toutes les migrations). Seuls l'abonnement et le plan vivent sur
la table `user` (`user.plan`) et dans `subscriptions` (clé `user_id`).

## Conséquence sur les quotas

Les middlewares `requireCoproprieteQuota` et `requireLotQuota`
(`apps/backend/src/middleware/requireQuota.js`) comptent **toutes** les lignes de
la table :

```js
const [{ count }] = await db('coproprietes').count('id as count')
```

Dans un déploiement mono-locataire, ce compte global **est** le compte du
locataire — le comportement est donc correct pour l'architecture actuelle. Le
quota est une limite « par déploiement », pas « par utilisateur ».

L'issue #120 supposait un déploiement multi-locataire où ce compte fuiterait
d'un client à l'autre. Ce scénario **ne peut pas se produire** avec
l'architecture actuelle, faute de données partagées entre plusieurs syndics dans
une même base.

## Ce que la vraie multi-tenancy exigerait (épopée séparée)

Passer à une base mutualisée multi-locataire est un chantier structurel, pas un
correctif :

1. Introduire une entité `organization` (ou `tenant`) et une colonne
   `organization_id` sur **toutes** les tables métier (migration + backfill).
2. Scoper **chaque** requête de lecture/écriture par `organization_id`
   (middleware de contexte + revue exhaustive des modèles Knex).
3. Rattacher `user`, `subscriptions` et les quotas à l'organisation plutôt qu'à
   l'utilisateur individuel.
4. Isolation de sécurité (row-level security PostgreSQL ou garde applicative
   systématique) pour empêcher toute fuite inter-locataire.
5. Adapter l'audit trail, les exports RGPD et les sauvegardes au périmètre
   locataire.

Tant que ce chantier n'est pas mené, **conserver** le comptage global : le
« scoper au locataire courant » sans modèle de tenancy introduirait un faux
sentiment de sécurité sans isolation réelle.

## Décision

- Aucune modification du comptage des quotas (comportement correct en
  mono-locataire).
- Commentaire d'avertissement ajouté dans `requireQuota.js` pour éviter un
  « faux correctif » futur.
- L'issue #120 est requalifiée : ce n'est pas un bug, mais le point de départ
  d'une éventuelle épopée « multi-tenancy » à arbitrer côté produit/infra.
