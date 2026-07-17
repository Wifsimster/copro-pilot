import { useState } from 'react'
import {
  Wand2,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  useCreateAssemblee,
  useCreateResolution,
} from '@/hooks/useAssemblees'
import {
  MAJORITE_OPTIONS,
  verifierDelaiConvocation,
  type TypeMajorite,
} from '@/lib/agBuilder'

interface AGBuilderWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onCreated?: () => void
}

interface DraftResolution {
  titre: string
  majorite: TypeMajorite
}

const STEPS = ['Convocation', 'Ordre du jour', 'Vérification']

function today() {
  return new Date().toISOString().split('T')[0]
}
function inDays(n: number) {
  return new Date(Date.now() + n * 86400000).toISOString().split('T')[0]
}

export function AGBuilderWizard({
  open,
  onOpenChange,
  coproprieteId,
  onCreated,
}: AGBuilderWizardProps) {
  const [step, setStep] = useState(0)
  const [dateConvocation, setDateConvocation] = useState(today())
  const [dateAG, setDateAG] = useState(inDays(25))
  const [heure, setHeure] = useState('18:00')
  const [lieu, setLieu] = useState('')
  const [type, setType] = useState<'ordinaire' | 'extraordinaire'>('ordinaire')
  const [resolutions, setResolutions] = useState<DraftResolution[]>([
    { titre: '', majorite: 'article_24' },
  ])

  const createAG = useCreateAssemblee()
  const createResolution = useCreateResolution()

  const delai = verifierDelaiConvocation(dateConvocation, dateAG)
  const validResolutions = resolutions.filter(r => r.titre.trim())

  const canProceed =
    (step === 0 && !!dateAG && !!lieu.trim() && !!dateConvocation) ||
    (step === 1 && validResolutions.length > 0) ||
    step === 2

  function setResolution(i: number, patch: Partial<DraftResolution>) {
    setResolutions(rs => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  }

  async function submit() {
    const agRes = await createAG.mutateAsync({
      copropriete_id: coproprieteId,
      date: dateAG,
      heure,
      lieu,
      type,
      date_convocation: dateConvocation,
    })
    const agId = agRes.data.id
    let numero = 1
    for (const r of validResolutions) {
      await createResolution.mutateAsync({
        ag_id: agId,
        numero: numero++,
        titre: r.titre.trim(),
        majorite: r.majorite,
      })
    }
    onCreated?.()
    onOpenChange(false)
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
  const submitting = createAG.isPending || createResolution.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="size-5 text-emerald-600" />
            Nouvelle AG — assistant guidé
          </DialogTitle>
          <DialogDescription>
            {STEPS[step]} · étape {step + 1}/{STEPS.length}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? 'bg-emerald-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="space-y-4 py-2">
          {step === 0 && (
            <>
              <div className="flex gap-4">
                <label className="flex-1">
                  <span className="text-sm font-medium">Date de convocation</span>
                  <input
                    type="date"
                    className={inputCls}
                    value={dateConvocation}
                    onChange={e => setDateConvocation(e.target.value)}
                  />
                </label>
                <label className="flex-1">
                  <span className="text-sm font-medium">Date de l'AG</span>
                  <input
                    type="date"
                    className={inputCls}
                    value={dateAG}
                    onChange={e => setDateAG(e.target.value)}
                  />
                </label>
              </div>
              <div className="flex gap-4">
                <label className="w-32">
                  <span className="text-sm font-medium">Heure</span>
                  <input
                    type="time"
                    className={inputCls}
                    value={heure}
                    onChange={e => setHeure(e.target.value)}
                  />
                </label>
                <label className="flex-1">
                  <span className="text-sm font-medium">Type</span>
                  <select
                    className={inputCls}
                    value={type}
                    onChange={e =>
                      setType(e.target.value as 'ordinaire' | 'extraordinaire')
                    }
                  >
                    <option value="ordinaire">Ordinaire</option>
                    <option value="extraordinaire">Extraordinaire</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium">Lieu</span>
                <input
                  type="text"
                  className={inputCls}
                  value={lieu}
                  onChange={e => setLieu(e.target.value)}
                  placeholder="Salle commune, 12 rue…"
                />
              </label>
              {delai.ok ? (
                <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  Délai de convocation : {delai.jours} jours — conforme (≥ 21 j).
                </p>
              ) : (
                <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {delai.message}
                </p>
              )}
            </>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Ajoutez les résolutions à soumettre au vote, chacune avec sa
                majorité. La majorité conditionne la validité du vote.
              </p>
              {resolutions.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      className={inputCls}
                      value={r.titre}
                      onChange={e => setResolution(i, { titre: e.target.value })}
                      placeholder={`Résolution ${i + 1} — ex : approbation des comptes`}
                    />
                    <select
                      className={inputCls}
                      value={r.majorite}
                      onChange={e =>
                        setResolution(i, {
                          majorite: e.target.value as TypeMajorite,
                        })
                      }
                    >
                      {MAJORITE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {resolutions.length > 1 && (
                    <button
                      type="button"
                      className="mt-2 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setResolutions(rs => rs.filter((_, j) => j !== i))
                      }
                      aria-label="Supprimer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setResolutions(rs => [
                    ...rs,
                    { titre: '', majorite: 'article_24' },
                  ])
                }
              >
                <Plus className="size-4" /> Ajouter une résolution
              </Button>
            </div>
          )}

          {step === 2 && (
            <dl className="space-y-1 rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">AG {type}</dt>
                <dd className="font-medium">
                  {dateAG} {heure}
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Convocation</dt>
                <dd className="font-medium">
                  {dateConvocation} ({delai.jours} j)
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Lieu</dt>
                <dd className="font-medium">{lieu}</dd>
              </div>
              <div className="border-t pt-2">
                <dt className="mb-1 text-muted-foreground">
                  {validResolutions.length} résolution(s)
                </dt>
                <ol className="list-inside list-decimal">
                  {validResolutions.map((r, i) => (
                    <li key={i}>{r.titre}</li>
                  ))}
                </ol>
              </div>
            </dl>
          )}
        </div>

        <DialogFooter>
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(s => s - 1)}
            >
              <ArrowLeft className="size-4" /> Retour
            </Button>
          )}
          {step < 2 ? (
            <Button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed}
            >
              Continuer <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={submitting}>
              <Check className="size-4" />
              {submitting ? 'Création…' : "Créer l'AG"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
