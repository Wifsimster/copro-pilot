import { useState } from 'react'
import { Calculator, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { SEOHead } from '@/components/SEO/SEOHead'
import { SITE_URL } from '@/lib/siteUrl'
import { computeQuotePart } from '@/lib/calculators'

function formatEur(n: number): string {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export default function CalculateurTantiemesPage() {
  const [total, setTotal] = useState('1000')
  const [lot, setLot] = useState('')
  const [montant, setMontant] = useState('')

  let result: { pourcentage: number; quotePart: number } | null = null
  let error: string | null = null

  const totalN = parseFloat(total)
  const lotN = parseFloat(lot)
  const montantN = parseFloat(montant)

  if (lot !== '' && montant !== '' && total !== '') {
    try {
      const r = computeQuotePart({
        totalTantiemes: totalN,
        lotTantiemes: lotN,
        montantTotal: montantN,
      })
      result = { pourcentage: r.pourcentage, quotePart: r.quotePart }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Entrée invalide.'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Calculateur de répartition par tantièmes | CoproPilot"
        description="Calculez gratuitement la quote-part de charges d'un lot de copropriété à partir de ses tantièmes. Outil simple et sans inscription."
        canonical="/calculateurs/repartition-tantiemes"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Calculateur de répartition par tantièmes',
          applicationCategory: 'FinanceApplication',
          offers: { '@type': 'Offer', price: '0' },
          url: `${SITE_URL}/calculateurs/repartition-tantiemes`,
        }}
      />
      <LandingHeader />

      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
            <Calculator className="size-6 text-amber-500 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Calculateur de répartition par tantièmes
          </h1>
          <p className="mt-3 text-muted-foreground">
            Calculez la quote-part de charges d'un lot à partir de ses
            tantièmes. Gratuit, sans inscription.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6">
          <label className="block">
            <span className="text-sm font-medium">
              Total des tantièmes de la copropriété
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={total}
              onChange={e => setTotal(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="1000"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">
              Tantièmes du lot
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={lot}
              onChange={e => setLot(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="150"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">
              Montant total à répartir (€)
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={montant}
              onChange={e => setMontant(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="12000"
            />
          </label>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          {result && !error && (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Quote-part de ce lot ({result.pourcentage} %)
              </p>
              <p className="mt-1 text-3xl font-bold">
                {formatEur(result.quotePart)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 rounded-xl border border-dashed p-6 text-center">
          <p className="font-medium">
            Gérez la répartition automatiquement avec CoproPilot
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Clés de répartition, appels de fonds et régularisation, sans
            tableur.
          </p>
          <Button asChild className="mt-4">
            <a href="#/login">
              Créer un compte gratuit
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
