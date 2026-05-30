import { Check, X, Minus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { SEOHead } from '@/components/SEO/SEOHead'
import { SITE_URL } from '@/lib/siteUrl'

interface Row {
  feature: string
  coproPilot: 'yes' | 'no' | 'partial' | string
  traditional: 'yes' | 'no' | 'partial' | string
  excel: 'yes' | 'no' | 'partial' | string
}

const rows: Row[] = [
  {
    feature: 'Plan gratuit (jusqu’à 20 lots)',
    coproPilot: 'yes',
    traditional: 'no',
    excel: 'yes',
  },
  {
    feature: 'Tarif affiché publiquement',
    coproPilot: 'yes',
    traditional: 'no',
    excel: 'yes',
  },
  {
    feature: 'Mise en route',
    coproPilot: '5 minutes',
    traditional: 'Plusieurs semaines',
    excel: 'Des heures',
  },
  {
    feature: 'Engagement contractuel',
    coproPilot: 'Aucun',
    traditional: 'Annuel typiquement',
    excel: 'Aucun',
  },
  {
    feature: 'Interface moderne (post-2020)',
    coproPilot: 'yes',
    traditional: 'partial',
    excel: 'no',
  },
  {
    feature: 'Comptabilité réglementaire ALUR',
    coproPilot: 'yes',
    traditional: 'yes',
    excel: 'no',
  },
  {
    feature: 'Gestion des AG (convocations, PV, votes)',
    coproPilot: 'yes',
    traditional: 'yes',
    excel: 'no',
  },
  {
    feature: 'Vote électronique & procurations',
    coproPilot: 'yes',
    traditional: 'partial',
    excel: 'no',
  },
  {
    feature: 'Signature électronique intégrée',
    coproPilot: 'yes',
    traditional: 'partial',
    excel: 'no',
  },
  {
    feature: 'Extranet copropriétaires inclus',
    coproPilot: 'yes',
    traditional: 'partial',
    excel: 'no',
  },
  {
    feature: 'API publique & webhooks',
    coproPilot: 'yes',
    traditional: 'no',
    excel: 'no',
  },
  {
    feature: 'Code source auditable (open core)',
    coproPilot: 'yes',
    traditional: 'no',
    excel: '—',
  },
  {
    feature: 'Données hébergées en France',
    coproPilot: 'yes',
    traditional: 'partial',
    excel: '—',
  },
  {
    feature: 'Journal d’audit infalsifiable',
    coproPilot: 'yes',
    traditional: 'partial',
    excel: 'no',
  },
  {
    feature: 'Export RGPD en un clic (Art. 20)',
    coproPilot: 'yes',
    traditional: 'partial',
    excel: 'no',
  },
  {
    feature: 'Sauvegardes quotidiennes',
    coproPilot: 'yes',
    traditional: 'yes',
    excel: 'no',
  },
  {
    feature: 'Import depuis Excel',
    coproPilot: 'yes',
    traditional: 'partial',
    excel: 'yes',
  },
]

const migrationSteps = [
  {
    title: 'Exportez vos données',
    body:
      'La plupart des outils traditionnels exportent en Excel ou CSV. ' +
      'Si vous êtes encore sur tableur, vous avez déjà le format prêt.',
  },
  {
    title: 'Importez en quelques clics',
    body:
      'CoproPilot accepte les imports Excel pour les copropriétaires, lots, ' +
      'parties communes, comptes bancaires et règlement de copropriété.',
  },
  {
    title: 'Repérez les écarts',
    body:
      'Le rapprochement bancaire et la balance ALUR mettent en évidence ' +
      'les incohérences historiques. Vous corrigez avant l’AG suivante.',
  },
  {
    title: 'Donnez accès au conseil syndical',
    body:
      'L’extranet copropriétaires est inclus dès le plan gratuit. Aucune ' +
      'option payante à activer pour ouvrir l’accès aux résidents.',
  },
]

const pageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'CoproPilot vs logiciels de syndic traditionnels',
  url: `${SITE_URL}/vs/logiciels-traditionnels`,
  description:
    'Comparatif fonctionnel entre CoproPilot et les logiciels de gestion de copropriété traditionnels (POWIMO, ICS Naxos, Thetrawin) : prix, mise en route, conformité ALUR, extranet, API.',
  inLanguage: 'fr-FR',
  isPartOf: {
    '@type': 'WebSite',
    name: 'CoproPilot',
    url: SITE_URL,
  },
}

function CellValue({ value }: { value: string }) {
  if (value === 'yes') {
    return (
      <span className="inline-flex items-center justify-center size-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40">
        <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
      </span>
    )
  }
  if (value === 'no') {
    return (
      <span className="inline-flex items-center justify-center size-7 rounded-full bg-red-50 dark:bg-red-950/30">
        <X className="size-4 text-red-400 dark:text-red-500" />
      </span>
    )
  }
  if (value === 'partial') {
    return (
      <span className="inline-flex items-center justify-center size-7 rounded-full bg-amber-50 dark:bg-amber-950/30">
        <Minus className="size-4 text-amber-500 dark:text-amber-400" />
      </span>
    )
  }
  return (
    <span className="text-sm text-stone-700 dark:text-stone-300">
      {value}
    </span>
  )
}

export default function VsTraditionnelsPage() {
  return (
    <div className="min-h-screen font-body antialiased">
      <SEOHead
        title="Alternative aux logiciels syndic traditionnels — CoproPilot"
        description="Comparatif honnête de CoproPilot face aux logiciels de gestion de copropriété traditionnels (POWIMO, ICS Naxos, Thetrawin) : prix transparent, mise en route en 5 min, conformité ALUR, extranet inclus, API publique."
        canonical="/vs/logiciels-traditionnels"
        jsonLd={pageJsonLd}
      />
      <LandingHeader />

      <section className="pt-32 pb-16 bg-[#FAF8F5] dark:bg-stone-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-4">
            Comparatif logiciels syndic
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.1]">
            CoproPilot vs logiciels{' '}
            <span className="italic text-emerald-700 dark:text-emerald-400">
              traditionnels
            </span>
          </h1>
          <p className="mt-6 text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Vous évaluez POWIMO, ICS Naxos, Thetrawin, ou un autre outil
            historique ? Voici les différences concrètes, fonction par
            fonction, sans devis à demander.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-base px-8 h-12 rounded-xl shadow-lg shadow-emerald-700/20 group"
            >
              <a href="/login">
                Essayer gratuitement
                <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="text-base h-12 rounded-xl border-stone-300 dark:border-stone-700"
            >
              <a href="mailto:contact@copropilot.fr?subject=Migration%20depuis%20un%20outil%20existant">
                Demander une migration
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-stone-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-50 text-center mb-3">
            Comparatif fonctionnel détaillé
          </h2>
          <p className="text-center text-sm text-stone-500 dark:text-stone-400 mb-10 max-w-2xl mx-auto">
            Les colonnes « logiciels traditionnels » et « Excel / papier »
            reflètent ce qu’on retrouve typiquement sur le marché français
            en 2026. Tous les éditeurs ne se valent pas - vérifiez avec
            votre outil actuel.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800">
                  <th className="py-4 pl-6 pr-4 text-left text-sm font-medium text-stone-400 dark:text-stone-500 w-2/5">
                    Fonctionnalité
                  </th>
                  <th className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      CoproPilot
                    </span>
                  </th>
                  <th className="py-4 px-4 text-center text-sm font-medium text-stone-400 dark:text-stone-500">
                    Logiciels traditionnels
                  </th>
                  <th className="py-4 pr-6 pl-4 text-center text-sm font-medium text-stone-400 dark:text-stone-500">
                    Excel / Papier
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={
                      i % 2 === 0
                        ? 'bg-stone-50/50 dark:bg-stone-950/30'
                        : ''
                    }
                  >
                    <td className="py-3.5 pl-6 pr-4 text-sm font-medium text-stone-700 dark:text-stone-300">
                      {row.feature}
                    </td>
                    <td className="py-3.5 px-4 text-center bg-emerald-50/30 dark:bg-emerald-950/10">
                      <CellValue value={row.coproPilot} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <CellValue value={row.traditional} />
                    </td>
                    <td className="py-3.5 pr-6 pl-4 text-center">
                      <CellValue value={row.excel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#FAF8F5] dark:bg-stone-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-50 text-center mb-12">
            Migrer depuis un outil existant : 4 étapes
          </h2>
          <ol className="space-y-6">
            {migrationSteps.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-5 rounded-xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 p-5"
              >
                <span className="shrink-0 inline-flex items-center justify-center size-10 rounded-lg bg-emerald-700/10 dark:bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-display text-xl font-semibold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-medium text-stone-900 dark:text-stone-50">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-stone-900">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-50">
            Vous restez bloqué sur la migration ?
          </h2>
          <p className="mt-4 text-stone-500 dark:text-stone-400 max-w-xl mx-auto">
            Pour les copropriétés &gt; 50 lots, nous prenons en charge
            l’import et la reprise d’antériorité. Aucun engagement requis
            avant d’avoir vu la donnée dans CoproPilot.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-base px-8 h-12 rounded-xl"
            >
              <a href="/login">Démarrer gratuitement</a>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-base h-12 rounded-xl">
              <a href="/securite">Voir notre sécurité &amp; conformité</a>
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
