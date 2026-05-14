# SEO Improvement Meeting — CoproPilot

**Date :** 2026-05-14
**Format :** Virtual roundtable (subagent personas)
**Branche :** `claude/subagents-seo-meeting-VrPMC`
**Présidente :** Camille Rousseau (PM)
**Participants :**

- **Sarah Lemaire** — Senior Technical SEO Specialist
- **Marc Dubois** — Principal Frontend Engineer
- **Léa Moreau** — Performance Engineer
- **Thomas Bernard** — B2B Content & SEO Strategist (proptech FR)
- **Camille Rousseau** — Senior Product Manager (chair)

---

## 0. État des lieux (avant la réunion)

Audit éclair de l'existant :

- `apps/frontend/index.html` : un seul `<title>`, aucun `meta description`, aucun OG/Twitter Card, aucun JSON-LD.
- `apps/frontend/src/routes/index.tsx` : `createHashRouter` → URLs en `/#/...`, fragment invisible aux crawlers non-JS.
- `apps/frontend/public/` : pas de `robots.txt`, pas de `sitemap.xml`.
- `apps/backend/src/index.js` : `connect-history-api-fallback` déjà câblé (bonne nouvelle pour une future migration BrowserRouter).
- `apps/backend/src/createApp.js` : pas de middleware `compression`.
- Surface publique réelle : essentiellement la landing page (`components/landing/`) + `PolitiqueConfidentialite`. Tout le reste est gated derrière Better Auth.

**Verdict d'entrée :** le site est techniquement invisible à Google au-delà de la racine. Le produit est solide mais la couche de visibilité est à zéro.

---

## 1. Sarah Lemaire — Technical SEO Audit

> **Diagnostic en deux phrases.** « Votre site est aujourd'hui invisible à Google. La combinaison HashRouter + zéro meta tags + zéro structured data + zéro sitemap fait que les moteurs traitent CoproPilot comme un outil interne, pas comme un SaaS B2B. »

### Top 5 issues critiques

| # | Problème | Fichier |
|---|---|---|
| P0.1 | `createHashRouter` → URLs `/#/...` non indexées | `apps/frontend/src/routes/index.tsx:76` |
| P0.2 | `<title>` unique, aucun `meta description` | `apps/frontend/index.html:1-27` |
| P0.3 | Aucun OpenGraph / Twitter Card → previews LinkedIn cassées | `apps/frontend/index.html` |
| P0.4 | Aucun JSON-LD (SoftwareApplication, FAQPage, Organization) | landing |
| P0.5 | Pas de `robots.txt`, pas de `sitemap.xml` | `apps/frontend/public/` |

### Plan P0 / P1 / P2

- **P0 (ce sprint) :** ajouter `robots.txt` + `sitemap.xml`, injecter meta tags + OG sur la landing via `react-helmet-async`, ajouter le JSON-LD `SoftwareApplication` + `Organization` + `FAQPage`.
- **P1 (sprint suivant) :** migrer `createHashRouter` → `createBrowserRouter`. Le fallback Express existe déjà, donc le coût backend est nul. Vérifier que le reverse proxy ne mange pas les routes.
- **P2 (trimestre suivant) :** prerender statique de la landing (`vite-plugin-prerender-spa` ou équivalent). Pas de SSR / Next.js — overkill pour notre cas.

### Recommandation architecturale

Pragmatique pour une petite équipe :

1. BrowserRouter + Helmet → **3-4 jours**, ~70 % du gain SEO.
2. Prerender de la landing → **2-3 jours**, finition publique.
3. **Ne pas** sauter sur Next.js / SSR maintenant. Le backend Express reste, il sert juste du HTML prérendu pour les routes publiques.

### Spicy take

> « Vous avez construit un superbe produit pour des gens qui vivent et meurent par les recherches Google, puis vous vous êtes rendus invisibles à Google. HashRouter, c'est fine pour les outils internes — CoproPilot est un SaaS *customer-facing*. Chaque mois passé en `/#/` est du revenue qui s'en va chez la concurrence. »

---

## 2. Marc Dubois — Frontend Architecture

> **Verdict.** « Soyons clairs avec Camille : *seule* la landing page doit être SEO-targeted, plus éventuellement `PolitiqueConfidentialite`. Le reste est gated — pas la peine d'investir dessus. »

### Le problème HashRouter (vue dev)

- URLs `example.com/#/login` → le `#` est un fragment client-only, jamais transmis au serveur.
- Googlebot exécute JS et finit par voir ça, mais Bing/Yandex/LinkedIn/Slack-bot non.
- Métadonnées par route impossibles : tous les crawlers voient le même `index.html`.

**Coût de migration vers `createBrowserRouter` : ~2 h.**
La raison : `connect-history-api-fallback` est **déjà câblé** dans `apps/backend/src/index.js`. Il exclut `/api/*` et rabat le reste sur `index.html`. C'est 80 % du job déjà fait.

### SSR vs Prerender vs Meta Injection

| Option | Verdict |
|---|---|
| SSR (Vike, Next, Remix) | Overkill. État auth côté serveur, déploiement complexifié, coût permanent. **Non.** |
| Prerender statique | Bon pour la landing, inutile pour les routes auth. **Oui, à terme.** |
| `react-helmet-async` + meta dynamique | **Le bon choix immédiat.** Léger, suffisant pour la landing. |

### Plan semaine 1

- **J1-J2 :** `createHashRouter` → `createBrowserRouter` dans `apps/frontend/src/routes/index.tsx`. Test direct URL → backend renvoie `index.html`.
- **J2-J3 :** install `react-helmet-async`. Créer `apps/frontend/src/components/SEO/Helmet.tsx` + `apps/frontend/src/hooks/usePageMeta.ts`. Wrapper la `LandingPage`.
- **J3-J4 :** prerender de la landing via `vite-plugin-prerender-spa` (config séparée).

Fichiers à créer/modifier :

```
apps/frontend/src/routes/index.tsx                    [MODIFY]
apps/frontend/src/components/SEO/Helmet.tsx           [CREATE]
apps/frontend/src/hooks/usePageMeta.ts                [CREATE]
apps/frontend/src/pages/LandingPage.tsx               [MODIFY]
apps/frontend/index.html                              [MODIFY]
apps/frontend/vite.config.js                          [MODIFY?]
apps/frontend/package.json                            [MODIFY]
```

### Le truc que le consultant SEO oublie

> « Toutes vos routes sont en `React.lazy()`, **y compris la landing**. C'est correct pour les performances de l'app mais ça veut dire que votre page de conversion attend un chunk JS avant le render. Importez la `LandingPage` *eagerly* (`import LandingPage from '@/pages/LandingPage'`). +20kB sur le bundle initial, –800ms LCP, beaucoup plus de conversions. Les crawlers s'en fichent ; vos prospects non. »

---

## 3. Léa Moreau — Performance & Core Web Vitals

> **CWV = ranking factor depuis 2021.** Ce n'est pas du nice-to-have.

### Diagnostic CWV

- **LCP** : à risque. Hero animé (Framer Motion), fonts Google sans `preload`, lazy load de la landing. Estimation **2.5-3.2s en 4G**.
- **INP** : risque modéré. Suite Radix UI complète + `recharts` + `motion` → jank possible sur appareils lents.
- **CLS** : correct. `initializeTheme()` avant render évite le flash sombre. Risque résiduel sur images sans `aspect-ratio`.

### Quick wins (< 1 jour chacun)

1. **Preload fonts + DNS-prefetch** → `apps/frontend/index.html` lignes 4-11 :
   ```html
   <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
   <link rel="preload" as="style" href="..." />
   ```
2. **Compression Express** → `apps/backend/src/createApp.js` après le `helmet()` :
   ```js
   import compression from 'compression'
   app.use(compression({ level: 6 }))
   ```
   Gain : -40 à -60 % sur JS/CSS.
3. **Sourcemaps off en prod** → `apps/frontend/vite.config.js:107` (`sourcemap: false` en prod, ~300kB économisés).
4. Cache headers : déjà bons (`maxAge: 1y`, `etag`, `lastModified` actifs).

### Mid-term (1-2 semaines)

- **Manual chunks** dans Vite (vendor-ui = Radix, vendor-charting = recharts, vendor-form = RHF/Zod, vendor-query = react-query). Radix seul ~120kB, recharts ~80kB.
- **Image pipeline** : `<picture>` + AVIF/WebP + `loading="lazy"` + `srcset`.
- **Font subset** Latin uniquement sur Cormorant Garamond.

### PWA / caching

- `NetworkFirst` sur `/api/*` : OK.
- Install prompt UI (`PwaInstallPrompt`, `AppUpdatePrompt`) : à lazy-loader, peut bloquer FCP.
- PWA n'aide pas directement le ranking, seulement les CWV repeat-visit.

### Plan de mesure

1. **Lighthouse CI** dans le pipeline (fail si LCP > 2.5s, INP > 100ms, CLS > 0.1).
2. **RUM** via la lib `web-vitals` → envoi sur `/api/metrics` (déjà en place).
3. **CrUX Dashboard** depuis Search Console.
4. **Sentry Performance** (30 min de wiring).

### Contrarian opinion

> « Vous sur-optimisez la PWA et sous-optimisez les CWV de l'entrée SEO. Le PWA install prompt n'a jamais fait gagner un point de ranking. **Dé-lazy-loadez la LandingPage** : -800ms LCP pour +20kB de bundle initial gzipé. C'est la meilleure trade que vous pouvez faire aujourd'hui. »

---

## 4. Thomas Bernard — Content & Keyword Strategy

### Le marché FR proptech syndic

Mid-volume, high-intent, low-competition. Goldmine si on l'occupe.

| Tier | Exemples |
|---|---|
| Transactional | `logiciel syndic copropriété`, `alternative POWIMO`, `alternative ICS Naxos`, `gestion immeuble collectif` |
| Commercial | `meilleur logiciel copropriété`, `comparatif logiciel syndic`, `comptabilité copropriété en ligne` |
| Informational | `loi ALUR obligations syndic`, `loi Climat & Résilience copropriété`, `guide appel de fonds`, `registre national immatriculation`, `syndic bénévole responsabilités` |

### Audit landing actuel

**Ce qui marche :**
- `HeroSection.tsx` : punchline « 10x moins cher » = le meilleur levier conversion.
- `PainReliefSection.tsx` : pain points alignés sur les frustrations syndic réelles.
- `PricingSection.tsx` : transparence freemium + per-lot.

**Ce qui manque (critique SEO) :**
- **Aucune page de comparaison nommée** (POWIMO, ICS Naxos, Thetrawin). `ComparisonSection.tsx` compare à « Logiciels traditionnels » (fantôme). ~30 % du traffic qualifié perdu.
- **Aucun JSON-LD** : `SoftwareApplication`, `FAQPage`, `Organization`, `BreadcrumbList` absents.
- **Hiérarchie H1/H2 cassée** : sauts H1 → H3 dans `HeroSection`, sections sans H1 page-level.
- **Pas de footer Resources/Blog** → 60 % des requêtes informationnelles ignorées.

**Voix éditoriale :** trop d'hypothèses de connaissance (jargon syndic non expliqué). On parle aux 40 % qui savent déjà, on perd les 60 % en transition Excel→outil.

### Piliers de contenu (3-4 hubs, ~30 articles)

1. **Guide pratique du syndic bénévole** (35 % du TAM) — responsabilités, appels de fonds, AG, règlement, conseil syndical, RGPD…
2. **Loi ELAN / ALUR / Climat & Résilience pour copropriété** — moat SEO, autorité réglementaire.
3. **Comparatifs & migration** — `POWIMO vs CoproPilot`, `ICS Naxos vs CoproPilot`, checklist migration, ROI calculator.
4. **Resources copropriétaires & conseil syndical** — extranet cross-sell, droits, paiement charges, litiges.

### Pages de conversion manquantes

- **Case studies chiffrées** (h années économisées × valeur horaire).
- **Hub `/vs/`** : `/vs/powimo`, `/vs/ics-naxos`, `/vs/thetrawin`.
- **Page Intégrations & API** (Stripe, Yousign, SMTP, webhooks).
- **ROI Calculator réel** (pas juste lots × prix).
- **Hub Sécurité / Conformité** : hébergement FR, CNIL, chiffrement, audit trail, 2FA, SLA, incident response.

### Spicy take

> « Vous donnez votre meilleur avantage compétitif. `ComparisonSection.tsx` compare à « Logiciels traditionnels » — un fantôme. Créez **`/vs/logiciels-traditionnels`** avec matrice nommée (POWIMO 4-6€/lot, ICS Naxos 3-5€/lot, CoproPilot 0-0.95€/lot), Playbook de migration en PDF gated, ads LinkedIn ciblées groupes syndic. Cette seule page peut tripler l'acquisition SMB. »

---

## 5. Camille Rousseau (chair) — Synthèse & décisions

### Cadrage business

- **TAM réel** : ~4 000 syndics professionnels FR, 30-40 % digitalement matures → ~1 200-1 600 comptes adressables. Pas 10 M+ de keywords.
- **Volumes recherche** : `logiciel gestion copropriété` ~200-400/mois, `syndic copropriété` ~500/mois. Long-tail, faible volume.
- **GTM** : sales-led (founder calls, asso syndic, LinkedIn). L'organique ne sera **pas** le moteur de croissance.
- **SEO = crédibilité, pas CAC.** Ranker sur 5-10 termes = table stakes de confiance.

### Matrice de priorisation

| Workstream | Impact | Effort | Quarter 2026 | Owner |
|---|---|---|---|---|
| Meta tags + Helmet + H1/H2 | M | L | Q2 (sem 1-4) | Sarah + Marc |
| Schema markup (Organization, FAQ, SoftwareApp) | M | L | Q2 (sem 5-6) | Sarah |
| `robots.txt` + `sitemap.xml` | M | L | Q2 (sem 4) | Sarah |
| Core Web Vitals (LCP, compression, preload) | H | M | Q2 (sem 5-10) | Léa |
| **BrowserRouter migration** | H | M | Q3 (sem 9-12) | Marc |
| Prerender landing | M | M | Q3 (sem 11-12) | Marc + Léa |
| Pages `/vs/<competitor>` (3 pages) | M | M | Q3 (sem 12+) | Thomas |
| Blog / piliers de contenu | L | H | Q4 | Thomas |

### Ce qu'on **ne fait pas**

- Pas de blog de 20 posts en Q2 — on n'a pas le réseau de distribution.
- Pas d'agence SEO à 5k€ — 2-3 jours de Sarah suffisent.
- Pas d'A/B test landing avant que Google sache qu'on existe.
- Pas de chasse à un Lighthouse 95+ avant que les meta tags soient là.

### Plan 30-60-90

#### J1-J30 (mai 2026) — Foundations
**Owner :** Sarah + Marc

- Semaine 1 : GSC setup, crawl Screaming Frog, identifier broken links et meta manquants.
- Semaine 2 : audit H1/H2 dans `components/landing/`. Corriger semantic HTML.
- Semaine 3-4 : `react-helmet-async` + meta tags sur `/`, `/login`, `/politique-confidentialite`. `robots.txt` + `sitemap.xml`. Compression Express. Preload fonts. Dé-lazy LandingPage.

**Deliverable :** toutes les routes publiques ont title (50-60 c.), meta description (150-160 c.), canonical, OG, compression activée, fonts préchargées.

#### J31-J60 (juin 2026) — CWV + Schema
**Owner :** Léa + Sarah

- Profilage LCP (DashboardMockup Framer Motion = suspect n°1). Cible <2.5s.
- Défer animations Framer Motion après FCP.
- Manual chunks Vite (vendor-ui / vendor-charting / vendor-form / vendor-query).
- Sourcemaps off en prod.
- JSON-LD `Organization` + `FAQPage` + `SoftwareApplication`.

**Deliverable :** Lighthouse Mobile >80, schema validé sur Rich Results Test, RUM `web-vitals` en place.

#### J61-J90 (juillet 2026) — Router + Content seeds
**Owner :** Marc + Thomas

- BrowserRouter migration (feature branch, test E2E, vérif reverse proxy).
- Prerender landing.
- Pages `/vs/logiciels-traditionnels`, 2 case studies chiffrées, 1 guide ALUR/ELAN.
- Submission sitemap à GSC. Baseline impressions.

**Deliverable :** toutes routes publiques indexables, 4 contenus publiés, calendrier Q3 défini.

### KPIs (pas de vanity metrics)

| KPI | Source | Baseline Q2 | Cible Q4 |
|---|---|---|---|
| Indexation ratio routes publiques | GSC | inconnu | ≥ 95 % |
| Trial signups attribués organique | UTM + analytics | ~5-10/mois | 20-30/mois |
| Landing → Trial CVR | analytics | ~8 % | ≥ 12 % |
| Lighthouse Mobile (landing) | PSI + CI | inconnu | ≥ 90 |

**Skipped :** sessions organiques, users organiques, position moyenne. Outputs, pas drivers.

### Risques

1. **BrowserRouter déborde sur Q4.** Mitigation : prototype `dev.copropilot.fr` avant merge. Budget 8 semaines, pas 6.
2. **Contenu dilue le focus.** Enforcement strict : infra avant contenu. Thomas attend Q3.
3. **CWV plafonne à ~78.** Plan B : animations en CSS pur, ou défer-on-interaction, ou accepter et avancer.

### Décision de réunion

> Roadmap SEO en trois phases : **Q2 = foundations (meta + schema + CWV + robots/sitemap), Q3 = migration (BrowserRouter + prerender + pages `/vs/`), Q4 = content compounding**. On traite l'organique comme **table stakes de crédibilité**, pas comme canal de growth. Sarah owns la roadmap, Marc + Léa report bi-hebdo, Thomas attend Q3. Budget : ~1.5 FTE cumulé. Outcome attendu fin 2026 : ranking sur 5-8 termes FR syndic, 20-30 trials organiques/mois, LCP landing < 2.2s. **Go.**

---

## Annexe — Action items consolidés (checklist)

### P0 — ce sprint (Sarah + Marc, ~5 jours)

- [ ] `apps/frontend/public/robots.txt`
- [ ] `apps/frontend/public/sitemap.xml`
- [ ] `npm install react-helmet-async --workspace=copro-pilot-frontend`
- [ ] `apps/frontend/src/components/SEO/Helmet.tsx`
- [ ] `apps/frontend/src/hooks/usePageMeta.ts`
- [ ] Meta tags + OG + Twitter Card dans `apps/frontend/index.html`
- [ ] Wrap `LandingPage.tsx` avec Helmet (title, description, OG)
- [ ] JSON-LD `SoftwareApplication` + `Organization` + `FAQPage` sur la landing
- [ ] Corriger hiérarchie H1/H2 dans `components/landing/*`

### P0 — performance (Léa, ~2 jours)

- [ ] `npm install compression --workspace=@copro-pilot/backend`
- [ ] Ajouter `compression()` dans `apps/backend/src/createApp.js` après `helmet()`
- [ ] Preload Cormorant Garamond + Outfit dans `apps/frontend/index.html`
- [ ] `sourcemap: process.env.NODE_ENV !== 'production'` dans `apps/frontend/vite.config.js`
- [ ] Dé-lazy `LandingPage` dans `apps/frontend/src/routes/index.tsx`

### P1 — sprint suivant (Marc, ~5 jours)

- [ ] `createHashRouter` → `createBrowserRouter` dans `apps/frontend/src/routes/index.tsx`
- [ ] Vérifier `connect-history-api-fallback` couvre toutes les routes publiques
- [ ] Manual chunks Vite (vendor-ui / vendor-charting / vendor-form / vendor-query)
- [ ] Lazy-load `PwaInstallPrompt` + `AppUpdatePrompt`
- [ ] Tests E2E direct URL access

### P1 — mesure (Léa, ~1 jour)

- [ ] Lighthouse CI dans `.github/workflows/ci.yml` (warn si LCP > 2.5s)
- [ ] `web-vitals` → POST `/api/metrics`
- [ ] Inscription CrUX Dashboard depuis GSC

### P2 — trimestre suivant (Thomas + Marc)

- [ ] `vite-plugin-prerender-spa` configuré pour la landing
- [ ] Page `/vs/logiciels-traditionnels` avec matrice POWIMO / ICS Naxos / Thetrawin
- [ ] 2 case studies chiffrées (ROI, heures économisées)
- [ ] 1 guide pilier ALUR/ELAN (~2000 mots)
- [ ] ROI Calculator interactif
- [ ] Hub Sécurité / Conformité (CNIL, chiffrement, audit trail, SLA)

---

*Fin de la réunion. Prochaine sync : revue P0 à J+14.*
