import { useState } from 'react'
import { FileText, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { SEOHead } from '@/components/SEO/SEOHead'
import { generateResolutionText } from '@/lib/resolutionAg'

const PLANS = [
  { label: 'Essentiel', prix: 144 },
  { label: 'Pro', prix: 375 },
  { label: 'Entreprise', prix: 1140 },
]

export default function ResolutionAgPage() {
  const [coproName, setCoproName] = useState('')
  const [planIdx, setPlanIdx] = useState(0)
  const [exercice, setExercice] = useState('2026')
  const [copied, setCopied] = useState(false)

  const plan = PLANS[planIdx]
  let text = ''
  let error: string | null = null
  try {
    if (coproName.trim()) {
      text = generateResolutionText({
        coproName,
        plan: plan.label,
        prixAnnuel: plan.prix,
        exercice: parseInt(exercice, 10),
      })
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Entrée invalide.'
  }

  function copy() {
    if (!text) return
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Générateur de résolution d'AG prête à voter | CoproPilot"
        description="Générez gratuitement une résolution d'assemblée générale prête à inscrire à l'ordre du jour pour adopter CoproPilot, avec le devis annuel."
        canonical="/outils/resolution-ag"
      />
      <LandingHeader />

      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
            <FileText className="size-6 text-amber-500 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Résolution d'AG prête à voter
          </h1>
          <p className="mt-3 text-muted-foreground">
            Générez le texte à inscrire à l'ordre du jour de votre assemblée
            générale pour adopter CoproPilot.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6">
          <label className="block">
            <span className="text-sm font-medium">Nom de la copropriété</span>
            <input
              type="text"
              value={coproName}
              onChange={e => setCoproName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Résidence Les Tilleuls"
            />
          </label>
          <div className="flex gap-4">
            <label className="block flex-1">
              <span className="text-sm font-medium">Formule</span>
              <select
                value={planIdx}
                onChange={e => setPlanIdx(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PLANS.map((p, i) => (
                  <option key={p.label} value={i}>
                    {p.label} — {p.prix} €/an
                  </option>
                ))}
              </select>
            </label>
            <label className="block w-32">
              <span className="text-sm font-medium">Exercice</span>
              <input
                type="number"
                value={exercice}
                onChange={e => setExercice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          {text && !error && (
            <div className="space-y-3">
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                {text}
              </pre>
              <Button onClick={copy} variant="outline" className="w-full">
                {copied ? (
                  <>
                    <Check className="size-4" /> Copié
                  </>
                ) : (
                  <>
                    <Copy className="size-4" /> Copier le texte
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Modèle indicatif à adapter à votre situation. La majorité applicable
          (art. 24/25) dépend de votre règlement et de l'ordre du jour.
        </p>
      </main>

      <LandingFooter />
    </div>
  )
}
