import { useState } from 'react'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import {
  useExercices,
  useCreateExercice,
  useClotureExercice,
  usePlanComptable,
  useInitialiserPlanComptable,
  useJournal,
  useGrandLivre,
  useBalance,
  useGenererEcritures,
  useAnnexe1,
  useAnnexe2,
  useAnnexe3,
  useAnnexe4,
  useAnnexe5,
} from '@/hooks/useComptabiliteReglementaire'
import type { ExerciceComptable, LigneBalance } from '@/types'
import {
  BookOpen,
  Plus,
  Lock,
  RefreshCw,
  ChevronDown,
  FileText,
  List,
  Calculator,
  ClipboardList,
  Settings,
} from 'lucide-react'

type Tab = 'journal' | 'grand-livre' | 'balance' | 'annexes' | 'exercices'

const TAB_CONFIG: { key: Tab; label: string; icon: typeof BookOpen }[] = [
  { key: 'journal', label: 'Journal', icon: List },
  { key: 'grand-livre', label: 'Grand livre', icon: BookOpen },
  { key: 'balance', label: 'Balance', icon: Calculator },
  { key: 'annexes', label: 'Annexes', icon: FileText },
  { key: 'exercices', label: 'Exercices', icon: Settings },
]

function formatEur(n: number | string | null | undefined): string {
  const val = typeof n === 'string' ? parseFloat(n) : n
  if (val === null || val === undefined || isNaN(val)) return '—'
  return val.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export default function ComptabiliteReglementairePage() {
  const selectedCoproId = useCoproprieteStore((s) => s.selectedCoproprieteId)
  const [tab, setTab] = useState<Tab>('journal')
  const [selectedExerciceId, setSelectedExerciceId] = useState<number | undefined>()

  const { data: exercices, isLoading: loadingExercices } = useExercices(selectedCoproId)

  // Auto-select first exercice
  const currentExercice = exercices?.find((e) => e.id === selectedExerciceId) ?? exercices?.[0]
  const exerciceId = currentExercice?.id

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Comptabilite reglementaire</h1>
        <p className="text-muted-foreground">Journal, grand livre, balance et annexes (loi ALUR)</p>
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16">
          <BookOpen className="size-16 text-muted-foreground/40" />
          <h3 className="mt-6 text-lg font-medium text-foreground">Aucune copropriete selectionnee</h3>
          <p className="mt-2 max-w-md text-center text-muted-foreground">
            Selectionnez une copropriete dans le menu lateral.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Exercice selector */}
          {exercices && exercices.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground">Exercice :</label>
              <div className="relative">
                <select
                  value={exerciceId ?? ''}
                  onChange={(e) => setSelectedExerciceId(Number(e.target.value))}
                  className="appearance-none rounded-lg border border-input bg-background py-2 pl-3 pr-8 text-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {exercices.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.annee} ({ex.statut === 'cloture' ? 'Cloture' : 'Ouvert'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
              {currentExercice?.statut === 'cloture' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Lock className="size-3" /> Cloture
                </span>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
            {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'journal' && <JournalTab exerciceId={exerciceId} />}
          {tab === 'grand-livre' && <GrandLivreTab exerciceId={exerciceId} />}
          {tab === 'balance' && <BalanceTab exerciceId={exerciceId} />}
          {tab === 'annexes' && <AnnexesTab coproprieteId={selectedCoproId} annee={currentExercice?.annee} />}
          {tab === 'exercices' && <ExercicesTab coproprieteId={selectedCoproId} exercices={exercices} loadingExercices={loadingExercices} />}
        </div>
      )}
    </div>
  )
}

// ---- Journal Tab ----
function JournalTab({ exerciceId }: { exerciceId: number | undefined }) {
  const [filterCompte, setFilterCompte] = useState('')
  const { data: ecritures, isLoading } = useJournal(exerciceId, filterCompte ? { compteCode: filterCompte } : undefined)
  const generer = useGenererEcritures()

  const totalDebit = ecritures?.reduce((s, e) => s + Number(e.debit), 0) ?? 0
  const totalCredit = ecritures?.reduce((s, e) => s + Number(e.credit), 0) ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={filterCompte}
            onChange={(e) => setFilterCompte(e.target.value)}
            placeholder="Filtrer par compte..."
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {exerciceId && (
          <button
            onClick={() => { if (confirm('Regenerer les ecritures automatiques ? Les ecritures existantes seront remplacees.')) generer.mutate(exerciceId) }}
            disabled={generer.isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${generer.isPending ? 'animate-spin' : ''}`} />
            {generer.isPending ? 'Generation...' : 'Generer ecritures'}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-muted" />
          ))}
        </div>
      ) : !ecritures?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12">
          <List className="size-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-base font-medium">Aucune ecriture</h3>
          <p className="mt-1 text-sm text-muted-foreground">Generez les ecritures automatiques ou saisissez-en manuellement.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Compte</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Libelle</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Piece</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Debit</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ecritures.map((e) => (
                <tr key={e.id} className="hover:bg-accent/30">
                  <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                    {new Date(e.date_ecriture).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{e.compte_code}</td>
                  <td className="px-3 py-2">{e.libelle}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">{e.piece_ref ?? '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">{Number(e.debit) > 0 ? formatEur(e.debit) : ''}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">{Number(e.credit) > 0 ? formatEur(e.credit) : ''}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/50 font-medium">
              <tr>
                <td colSpan={4} className="px-3 py-2 text-right">Totaux</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">{formatEur(totalDebit)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">{formatEur(totalCredit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

// ---- Grand Livre Tab ----
function GrandLivreTab({ exerciceId }: { exerciceId: number | undefined }) {
  const { data, isLoading } = useGrandLivre(exerciceId)
  const [expandedCompte, setExpandedCompte] = useState<string | null>(null)

  const totals = data?.totals ?? []
  const ecritures = data?.ecritures ?? []

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-muted" />
          ))}
        </div>
      ) : !totals.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12">
          <BookOpen className="size-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-base font-medium">Aucune donnee</h3>
          <p className="mt-1 text-sm text-muted-foreground">Generez d'abord les ecritures dans l'onglet Journal.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {totals.map((t) => {
            const isExpanded = expandedCompte === t.compte_code
            const compteEcritures = ecritures.filter((e) => e.compte_code === t.compte_code)
            return (
              <div key={t.compte_code} className="rounded-lg border border-border">
                <button
                  onClick={() => setExpandedCompte(isExpanded ? null : t.compte_code)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">{t.compte_code}</span>
                    <span className="text-sm text-muted-foreground">({compteEcritures.length} ecritures)</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm">D: {formatEur(t.total_debit)}</span>
                    <span className="text-sm">C: {formatEur(t.total_credit)}</span>
                    <span className="text-sm font-medium">
                      Solde: {formatEur(Number(t.total_debit) - Number(t.total_credit))}
                    </span>
                    <ChevronDown className={`size-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {isExpanded && compteEcritures.length > 0 && (
                  <div className="border-t border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="px-4 py-1.5 text-left text-xs font-medium text-muted-foreground">Date</th>
                          <th className="px-4 py-1.5 text-left text-xs font-medium text-muted-foreground">Libelle</th>
                          <th className="px-4 py-1.5 text-right text-xs font-medium text-muted-foreground">Debit</th>
                          <th className="px-4 py-1.5 text-right text-xs font-medium text-muted-foreground">Credit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {compteEcritures.map((e) => (
                          <tr key={e.id}>
                            <td className="whitespace-nowrap px-4 py-1.5 text-muted-foreground">
                              {new Date(e.date_ecriture).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 py-1.5">{e.libelle}</td>
                            <td className="whitespace-nowrap px-4 py-1.5 text-right">{Number(e.debit) > 0 ? formatEur(e.debit) : ''}</td>
                            <td className="whitespace-nowrap px-4 py-1.5 text-right">{Number(e.credit) > 0 ? formatEur(e.credit) : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---- Balance Tab ----
function BalanceTab({ exerciceId }: { exerciceId: number | undefined }) {
  const { data: balance, isLoading } = useBalance(exerciceId)

  const totalDebit = balance?.reduce((s, l) => s + Number(l.total_debit), 0) ?? 0
  const totalCredit = balance?.reduce((s, l) => s + Number(l.total_credit), 0) ?? 0
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const classeLabels: Record<number, string> = {
    1: 'Classe 1 - Capitaux',
    4: 'Classe 4 - Tiers',
    5: 'Classe 5 - Tresorerie',
    6: 'Classe 6 - Charges',
    7: 'Classe 7 - Produits',
  }

  // Group by classe
  const grouped = balance?.reduce((acc, l) => {
    const cls = l.classe
    if (!acc[cls]) acc[cls] = []
    acc[cls].push(l)
    return acc
  }, {} as Record<number, LigneBalance[]>) ?? {}

  return (
    <div className="space-y-4">
      {/* Balance status */}
      {balance && balance.length > 0 && (
        <div className={`rounded-lg border p-3 text-sm ${isBalanced ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
          {isBalanced
            ? `Balance equilibree — Total: ${formatEur(totalDebit)}`
            : `Balance desequilibree — Debit: ${formatEur(totalDebit)} / Credit: ${formatEur(totalCredit)} (ecart: ${formatEur(Math.abs(totalDebit - totalCredit))})`}
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-muted" />
          ))}
        </div>
      ) : !balance?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12">
          <Calculator className="size-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-base font-medium">Aucune donnee</h3>
          <p className="mt-1 text-sm text-muted-foreground">Generez d'abord les ecritures dans l'onglet Journal.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b)).map(([classe, lignes]) => (
            <div key={classe}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {classeLabels[Number(classe)] ?? `Classe ${classe}`}
              </h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Compte</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Libelle</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total debit</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total credit</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Solde</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lignes.map((l) => (
                      <tr key={l.compte_code} className="hover:bg-accent/30">
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{l.compte_code}</td>
                        <td className="px-3 py-2">{l.libelle}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-right">{formatEur(l.total_debit)}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-right">{formatEur(l.total_credit)}</td>
                        <td className={`whitespace-nowrap px-3 py-2 text-right font-medium ${Number(l.solde) < 0 ? 'text-red-600' : ''}`}>
                          {formatEur(l.solde)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---- Annexes Tab ----
function AnnexesTab({ coproprieteId, annee }: { coproprieteId: number; annee: number | undefined }) {
  const [selectedAnnexe, setSelectedAnnexe] = useState<number | null>(null)
  const year = annee ?? new Date().getFullYear()

  const { data: annexe1 } = useAnnexe1(selectedAnnexe === 1 ? coproprieteId : undefined, selectedAnnexe === 1 ? year : undefined)
  const { data: annexe2 } = useAnnexe2(selectedAnnexe === 2 ? coproprieteId : undefined)
  const { data: annexe3 } = useAnnexe3(selectedAnnexe === 3 ? coproprieteId : undefined, selectedAnnexe === 3 ? year : undefined)
  const { data: annexe4 } = useAnnexe4(selectedAnnexe === 4 ? coproprieteId : undefined, selectedAnnexe === 4 ? year : undefined)
  const { data: annexe5 } = useAnnexe5(selectedAnnexe === 5 ? coproprieteId : undefined, selectedAnnexe === 5 ? year : undefined)

  const ANNEXES = [
    { num: 1, title: 'Annexe 1 — Etat financier', desc: 'Charges et produits de l\'exercice' },
    { num: 2, title: 'Annexe 2 — Situation de tresorerie', desc: 'Soldes des comptes bancaires et mouvements non rapproches' },
    { num: 3, title: 'Annexe 3 — Creances et dettes', desc: 'Etat des impayes par coproprietaire' },
    { num: 4, title: 'Annexe 4 — Fonds de travaux', desc: 'Cotisations et solde du fonds travaux (loi ALUR)' },
    { num: 5, title: 'Annexe 5 — Budget previsionnel', desc: 'Postes de depenses previsionnels vs realises' },
  ]

   
  const annexeData: Record<number, any> = { 1: annexe1, 2: annexe2, 3: annexe3, 4: annexe4, 5: annexe5 }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Annexes reglementaires a presenter en Assemblee Generale (decret du 14 mars 2005) — Exercice {year}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ANNEXES.map(({ num, title, desc }) => (
          <button
            key={num}
            onClick={() => setSelectedAnnexe(selectedAnnexe === num ? null : num)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              selectedAnnexe === num
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Annexe detail */}
      {selectedAnnexe && annexeData[selectedAnnexe] && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">{ANNEXES[selectedAnnexe - 1].title} — {year}</h3>
          <pre className="max-h-96 overflow-auto rounded bg-muted p-3 text-xs">
            {JSON.stringify(annexeData[selectedAnnexe], null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

// ---- Exercices Tab ----
function ExercicesTab({ coproprieteId, exercices, loadingExercices }: { coproprieteId: number; exercices: ExerciceComptable[] | undefined; loadingExercices: boolean }) {
  const createExercice = useCreateExercice()
  const clotureExercice = useClotureExercice()
  const initPlan = useInitialiserPlanComptable()
  const { data: planComptable } = usePlanComptable(coproprieteId)

  const handleCreateExercice = () => {
    const year = new Date().getFullYear()
    createExercice.mutate({
      copropriete_id: coproprieteId,
      annee: year,
      date_debut: `${year}-01-01`,
      date_fin: `${year}-12-31`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Plan comptable status */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Plan comptable</h3>
            <p className="text-xs text-muted-foreground">
              {planComptable?.length
                ? `${planComptable.length} comptes configures`
                : 'Aucun plan comptable configure'}
            </p>
          </div>
          {!planComptable?.length && (
            <button
              onClick={() => initPlan.mutate(coproprieteId)}
              disabled={initPlan.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Settings className="size-4" />
              {initPlan.isPending ? 'Initialisation...' : 'Initialiser le plan'}
            </button>
          )}
        </div>
        {planComptable && planComptable.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Actif', count: planComptable.filter((c) => c.type === 'actif').length },
              { label: 'Passif', count: planComptable.filter((c) => c.type === 'passif').length },
              { label: 'Charges', count: planComptable.filter((c) => c.type === 'charge').length },
              { label: 'Produits', count: planComptable.filter((c) => c.type === 'produit').length },
            ].map((s) => (
              <div key={s.label} className="rounded border border-border px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-semibold">{s.count}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exercices list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Exercices comptables</h3>
          <button
            onClick={handleCreateExercice}
            disabled={createExercice.isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="size-4" />
            Nouvel exercice
          </button>
        </div>

        {loadingExercices ? (
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded bg-muted" />
            ))}
          </div>
        ) : !exercices?.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8">
            <Settings className="size-10 text-muted-foreground/40" />
            <h3 className="mt-3 text-sm font-medium">Aucun exercice</h3>
            <p className="mt-1 text-xs text-muted-foreground">Creez un exercice comptable pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {exercices.map((ex) => (
              <div key={ex.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold">{ex.annee}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      ex.statut === 'cloture'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {ex.statut === 'cloture' ? 'Cloture' : 'Ouvert'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Du {new Date(ex.date_debut).toLocaleDateString('fr-FR')} au {new Date(ex.date_fin).toLocaleDateString('fr-FR')}
                    {ex.date_cloture && ` — Cloture le ${new Date(ex.date_cloture).toLocaleDateString('fr-FR')}`}
                  </p>
                </div>
                {ex.statut === 'ouvert' && (
                  <button
                    onClick={() => { if (confirm(`Cloturer l'exercice ${ex.annee} ? Cette action est irreversible.`)) clotureExercice.mutate(ex.id) }}
                    disabled={clotureExercice.isPending}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                  >
                    <Lock className="size-3.5" />
                    Cloturer
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
