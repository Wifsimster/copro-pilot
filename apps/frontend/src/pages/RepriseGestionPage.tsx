import { useState } from 'react'
import {
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertTriangle,
  CircleCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NoCoproprieteSelected } from '@/components/layout/NoCoproprieteSelected'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import {
  useValiderBalance,
  useImporterBalance,
} from '@/hooks/useRepriseGestion'
import type { BalanceValidation } from '@/api/reprise-gestion'
import {
  PASSATION_CHECKLIST,
  parseBalanceInput,
  controleTantiemes,
} from '@/lib/repriseGestion'

const STEPS = ['Passation', 'Balance', 'Tantièmes', 'Prêt']

function eur(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export default function RepriseGestionPage() {
  const coproprieteId = useCoproprieteStore(s => s.selectedCoproprieteId)
  const [step, setStep] = useState(0)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [balanceText, setBalanceText] = useState('')
  const [validation, setValidation] = useState<BalanceValidation | null>(null)
  const [totalTantiemes, setTotalTantiemes] = useState('')
  const [base, setBase] = useState<1000 | 10000>(10000)
  const [annee, setAnnee] = useState(new Date().getFullYear())
  const [imported, setImported] = useState<number | null>(null)

  const valider = useValiderBalance()
  const importer = useImporterBalance()

  if (!coproprieteId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Reprise de gestion
        </h1>
        <NoCoproprieteSelected message="Sélectionnez la copropriété que vous reprenez." />
      </div>
    )
  }

  const parsed = parseBalanceInput(balanceText)
  const tantiemesCtrl = controleTantiemes(
    parseInt(totalTantiemes || '0', 10),
    base
  )

  async function validateBalance() {
    const res = await valider.mutateAsync({ coproprieteId: coproprieteId!, lignes: parsed })
    setValidation(res.data)
  }

  async function importBalance() {
    const res = await importer.mutateAsync({
      coproprieteId: coproprieteId!,
      annee,
      lignes: parsed,
    })
    setImported(res.data.ecritures_count)
  }

  const canProceed =
    (step === 0) ||
    (step === 1 && validation?.valid === true) ||
    (step === 2 && tantiemesCtrl.ok) ||
    step === 3

  const inputCls =
    'mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
          <ClipboardCheck className="size-5 text-amber-500 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reprise de gestion — assistant de passation
          </h1>
          <p className="text-sm text-muted-foreground">
            Reprenez proprement une copropriété en cours d'exercice, sans
            perdre un solde.
          </p>
        </div>
      </div>

      {/* progress */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className={`h-1.5 rounded-full ${
                i <= step ? 'bg-emerald-500' : 'bg-muted'
              }`}
            />
            <span className="mt-1 block text-center text-[11px] text-muted-foreground">
              {s}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        {step === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Réclamez ces pièces au syndic sortant avant de démarrer. Cochez
              ce que vous avez déjà récupéré.
            </p>
            {PASSATION_CHECKLIST.map(item => (
              <label
                key={item.key}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={!!checked[item.key]}
                  onChange={e =>
                    setChecked(c => ({ ...c, [item.key]: e.target.checked }))
                  }
                />
                <span>
                  <span className="font-medium">{item.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {item.note}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium">
                Balance de clôture (collez depuis Excel ou le PDF du sortant)
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Une ligne par compte : <code>compte&nbsp;libellé&nbsp;débit&nbsp;crédit</code>{' '}
                (séparés par tabulation ou point-virgule).
              </span>
              <textarea
                className={`${inputCls} h-40 font-mono`}
                value={balanceText}
                onChange={e => {
                  setBalanceText(e.target.value)
                  setValidation(null)
                }}
                placeholder={'512\tBanque\t12000\t0\n450\tCopropriétaires\t0\t12000'}
              />
            </label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={validateBalance}
                disabled={parsed.length === 0 || valider.isPending}
              >
                {valider.isPending
                  ? 'Vérification…'
                  : `Vérifier la balance (${parsed.length} lignes)`}
              </Button>
            </div>

            {validation && (
              <div className="space-y-2">
                {validation.valid ? (
                  <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <CircleCheck className="size-4" /> Balance équilibrée :
                    débit {eur(validation.totals.debit)} = crédit{' '}
                    {eur(validation.totals.credit)}.
                  </p>
                ) : (
                  <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    Balance déséquilibrée — écart de{' '}
                    {eur(validation.totals.ecart)}. Corrigez avant de
                    reprendre : un déséquilibre fausse tous les comptes.
                  </p>
                )}
                {validation.lineErrors.length > 0 && (
                  <ul className="text-xs text-destructive">
                    {validation.lineErrors.slice(0, 5).map(e => (
                      <li key={`${e.index}-${e.message}`}>
                        Ligne {e.index + 1} : {e.message}
                      </li>
                    ))}
                  </ul>
                )}
                {validation.duplicateComptes.length > 0 && (
                  <p className="text-xs text-amber-600">
                    Comptes en double : {validation.duplicateComptes.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Contrôle contradictoire des tantièmes : la somme doit valoir
              exactement la base du règlement.
            </p>
            <div className="flex gap-4">
              <label className="flex-1">
                <span className="text-sm font-medium">
                  Somme des tantièmes saisis
                </span>
                <input
                  type="number"
                  className={inputCls}
                  value={totalTantiemes}
                  onChange={e => setTotalTantiemes(e.target.value)}
                  placeholder="10000"
                />
              </label>
              <label className="w-40">
                <span className="text-sm font-medium">Base</span>
                <select
                  className={inputCls}
                  value={base}
                  onChange={e => setBase(Number(e.target.value) as 1000 | 10000)}
                >
                  <option value={10000}>10 000</option>
                  <option value={1000}>1 000</option>
                </select>
              </label>
            </div>
            {totalTantiemes !== '' &&
              (tantiemesCtrl.ok ? (
                <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <CircleCheck className="size-4" /> Tantièmes cohérents.
                </p>
              ) : (
                <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  Écart de {tantiemesCtrl.ecart} par rapport à {base}. Vérifiez
                  la répartition avant de reprendre.
                </p>
              ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <CircleCheck className="mx-auto size-10 text-emerald-500" />
            <p className="font-medium">Reprise vérifiée — prêt à démarrer.</p>
            <p className="text-sm text-muted-foreground">
              Balance équilibrée et tantièmes cohérents. Importez la balance
              comme à-nouveaux de l'exercice pour démarrer votre comptabilité.
            </p>
            {imported == null ? (
              <div className="flex items-center justify-center gap-3">
                <label className="text-sm">
                  Exercice&nbsp;
                  <input
                    type="number"
                    className="w-24 rounded-lg border border-input bg-background px-2 py-1 text-sm"
                    value={annee}
                    onChange={e => setAnnee(Number(e.target.value))}
                  />
                </label>
                <Button
                  type="button"
                  onClick={importBalance}
                  disabled={parsed.length === 0 || importer.isPending}
                >
                  {importer.isPending
                    ? 'Import…'
                    : 'Importer la balance en comptabilité'}
                </Button>
              </div>
            ) : (
              <p className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                <Check className="size-4" /> {imported} à-nouveaux importés dans
                l'exercice {annee}.
              </p>
            )}
            {importer.isError && (
              <p className="text-sm text-destructive">
                {(importer.error as Error)?.message ||
                  "Échec de l'import (une reprise existe peut-être déjà)."}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(s => s - 1)}
          >
            <ArrowLeft className="size-4" /> Retour
          </Button>
        )}
        {step < 3 && (
          <Button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed}
          >
            Continuer <ArrowRight className="size-4" />
          </Button>
        )}
        {step === 3 && (
          <Button asChild>
            <a href="/charges">
              <Check className="size-4" /> Aller aux charges
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
