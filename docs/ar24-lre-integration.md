# Intégration AR24 (LRE eIDAS) — état & activation

> Date : 2026-07-16. Fournisseur LRE pour les convocations d'AG. La LRE
> conditionne la défendabilité de « AG conforme » (une convocation sans preuve
> d'envoi est le vice d'annulation d'AG le plus courant).

## Ce qui est implémenté

Derrière la couche `LreService` (seam du #126) :

- **`services/lre/ar24Signature.js`** — signature de requête et déchiffrement de
  réponse AR24 : AES-256-CBC de la date, clé = `SHA-256(date + private_key)`,
  IV = `SHA-256(SHA-256(private_key))` (interprétation compatible openssl PHP :
  clé = 32 premiers caractères hex, IV = 16 premiers). Déterministe, testé.
- **`services/lre/Ar24LreProvider.js`** — provider (`name: 'ar24'`) : auth
  token + date + signature, POST vers l'endpoint eIDAS, déchiffrement des
  réponses (les erreurs sont en clair), mapping du `trackingId`/statut.
- **Câblage** : `LRE_PROVIDER=ar24` active le provider si `AR24_TOKEN` et
  `AR24_PRIVATE_KEY` sont présents ; sinon retour automatique au `noop`
  (jamais d'envoi silencieux qui prétendrait à une LRE).
- **Flux de convocation** : `ConvocationAGService.envoyerConvocation` appelle
  `lreService.send()` pour les modes recommandés (`courrier_recommande`,
  `les_deux`) et persiste le résultat provider par destinataire
  (`lre_provider`, `lre_tracking_id`, `lre_proof_url`, `lre_statut` — migration
  `20260717000001`). Tant que le provider est `noop`, ces colonnes portent
  `not_configured` : la plomberie est prête, seul le renseignement des
  credentials AR24 fait passer les envois en LRE réelle. Les règles pures
  (éligibilité, payload, mapping) sont isolées et testées dans
  `services/lre/convocationLre.js`.

## Activation

```bash
LRE_PROVIDER=ar24
AR24_TOKEN=...            # fourni par AR24 à la création de l'accès API
AR24_PRIVATE_KEY=...      # idem — sert à signer et déchiffrer
AR24_ENV=sandbox         # sandbox | prod
```

- Sandbox : `https://sandbox.ar24.fr/api` (limite ~100 envois / 24 h).
- Prod : `https://app.ar24.fr/api`.

## Ce qui reste à confirmer contre le bac à sable (bloqué sur credentials)

L'implémentation suit la documentation et le client PHP de référence, mais n'a
**pas encore été exécutée en live** (nécessite un compte AR24 avec accès API
provisionné — étape commerciale externe). À vérifier avec la **collection
Postman** fournie par AR24 :

1. **Chemin d'endpoint et noms de paramètres** exacts de l'envoi eIDAS
   (placeholder `/user/eidas/` dans `Ar24LreProvider.send`, marqué TODO).
2. **Flux OTP eIDAS** : la LRE eIDAS exige aujourd'hui un OTP récupéré
   manuellement par l'expéditeur (cf. client PHP). Décision à prendre :
   - soit intégrer une étape de saisie/récupération d'OTP dans le parcours
     convocation ;
   - soit utiliser la **LRE simple** (sans OTP) tant que l'automatisation eIDAS
     n'est pas cadrée — en n'employant « AG conforme eIDAS » qu'une fois l'OTP
     géré.
3. **Webhooks de statut** (accusé de réception / preuve) : à brancher pour
   mettre à jour `lre_statut`/`lre_proof_url` du destinataire au fil du cycle
   de vie (dépôt → AR signé). L'envoi initial persiste déjà
   `trackingId`/`proofUrl` retournés par AR24.

## Prochaine étape produit

`lreService.send()` est déjà branché dans le flux de convocation (le résultat
provider est persisté par destinataire). Reste, une fois les credentials
sandbox obtenus : vérifier l'aller-retour réel, trancher l'OTP, brancher les
webhooks de statut. Tant que la LRE n'est pas confirmée en live, ne pas
afficher « AG conforme » (règle du #118).
