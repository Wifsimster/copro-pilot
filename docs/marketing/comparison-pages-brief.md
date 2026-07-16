# Brief — pages comparatives `/vs/<concurrent>`

> Date : 2026-07-16 — brief pour l'issue #136. **Statut : BLOQUÉ.**
> Ne pas publier tant que des devis concurrents réels ne sont pas obtenus.

## Pourquoi c'est bloqué

Les pages `/vs/powimo`, `/vs/thetrawin`, etc. ciblent un fort intent d'achat,
mais elles reposent sur des **prix concurrents non sourcés** (l'hypothèse interne
« POWIMO 4–6 €/lot/mois » n'est pas vérifiée). Publier une comparaison chiffrée
inexacte expose à deux risques :

- **Publicité comparative illicite** (art. L122-1 s. code de la consommation) : la
  comparaison doit porter sur des biens/services répondant aux mêmes besoins,
  être objective, vérifiable et non trompeuse.
- **Dénigrement** (responsabilité civile) si les faits avancés sur un concurrent
  nommé sont faux ou invérifiables.

## Dépendance bloquante

Obtenir, pour chaque concurrent cité, au moins une **source vérifiable et datée**
du prix et des fonctionnalités :

- devis commercial réel (idéalement via un prospect/partenaire) ;
- grille publique horodatée (capture + URL + date) ;
- à défaut, ne pas citer de chiffre pour ce concurrent.

Cette collecte fait partie de l'action « 10–20 interviews + devis concurrents
réels » du plan GTM (`docs/strategy/go-to-market.md` §3.1).

## Modèle de données (à utiliser une fois débloqué)

Chaque page comparative doit être construite à partir d'un enregistrement
structuré, où **chaque affirmation chiffrée porte sa source** :

```jsonc
{
  "competitor": "POWIMO",
  "slug": "powimo",
  "last_verified": "2026-07-16",       // date de vérification obligatoire
  "price": {
    "value": null,                      // null tant que non sourcé → pas de chiffre affiché
    "unit": "€/lot/mois",
    "source_url": "",                   // obligatoire si value != null
    "source_label": ""                  // ex: "devis commercial 07/2026"
  },
  "claims": [
    {
      "dimension": "Multi-copropriété",
      "copropilot": "Inclus (Pro)",
      "competitor": "Inclus",
      "source_url": ""                  // obligatoire pour toute affirmation sur le concurrent
    }
  ],
  "disclaimer": "Comparatif établi le {last_verified} à partir de sources publiques/devis. Les offres évoluent — vérifiez auprès de l'éditeur."
}
```

## Garde-fous d'implémentation (quand la page sera construite)

1. **Aucun chiffre sans `source_url`** : le composant de rendu doit masquer toute
   valeur dont la source est vide (ne jamais afficher un prix non sourcé).
2. **Date de vérification visible** sur la page + disclaimer.
3. **Relecture juridique** de chaque page avant mise en ligne.
4. **Neutralité de ton** : comparer des faits, pas dénigrer.
5. Revue périodique (les prix concurrents changent) — `last_verified` doit rester
   récent, sinon dépublier.

## Décision

- Pas de développement de la page tant que les devis ne sont pas collectés.
- Ce brief + le modèle de données servent de point de départ dès déblocage.
- L'issue #136 reste ouverte, marquée bloquée par la collecte de devis.
