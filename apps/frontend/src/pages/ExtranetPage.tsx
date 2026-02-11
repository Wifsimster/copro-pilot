import { useState } from 'react'
import {
  useExtranetProfil,
  useExtranetDocuments,
  useExtranetCompte,
  useExtranetCharges,
  useExtranetAppelsFonds,
  useExtranetFondsTravaux,
  useExtranetConseilSyndical,
} from '@/hooks/useExtranet'
import {
  User,
  Home,
  FileText,
  CreditCard,
  Receipt,
  PiggyBank,
  Users,
  ChevronDown,
  Download,
  Calendar,
  Shield,
  Handshake,
  ClipboardList,
  AlertCircle,
} from 'lucide-react'
import { documentsApi } from '@/api/documents'

type Tab = 'profil' | 'documents' | 'compte' | 'charges' | 'appels' | 'fonds' | 'conseil'

const TAB_CONFIG: { key: Tab; label: string; icon: typeof User; conseilOnly?: boolean }[] = [
  { key: 'profil', label: 'Mon profil', icon: User },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'compte', label: 'Mon compte', icon: CreditCard },
  { key: 'charges', label: 'Mes charges', icon: Receipt },
  { key: 'appels', label: 'Appels de fonds', icon: ClipboardList },
  { key: 'fonds', label: 'Fonds travaux', icon: PiggyBank },
  { key: 'conseil', label: 'Conseil syndical', icon: Users, conseilOnly: true },
]

function formatEur(n: number | string | null | undefined): string {
  const val = typeof n === 'string' ? parseFloat(n) : n
  if (val === null || val === undefined || isNaN(val)) return '—'
  return val.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export default function ExtranetPage() {
  const [tab, setTab] = useState<Tab>('profil')
  const [selectedCoproId, setSelectedCoproId] = useState<number | undefined>()

  const { data: profil, isLoading: loadingProfil, error: profilError } = useExtranetProfil()

  const coproprietes = profil?.coproprietes ?? []
  const currentCoproId = selectedCoproId ?? coproprietes[0]?.id
  const isConseil = profil?.conseilSyndical?.some((cs) => cs.copropriete_id === currentCoproId) ?? false

  if (loadingProfil) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Espace coproprietaire</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (profilError || !profil) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Espace coproprietaire</h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16">
          <AlertCircle className="h-16 w-16 text-muted-foreground/40" />
          <h3 className="mt-6 text-lg font-medium">Acces non disponible</h3>
          <p className="mt-2 max-w-md text-center text-muted-foreground">
            Votre compte utilisateur n'est pas lie a un profil coproprietaire.
            Contactez votre syndic pour obtenir l'acces.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Espace coproprietaire</h1>
        <p className="text-muted-foreground">
          Bienvenue {profil.coproprietaire.prenom} {profil.coproprietaire.nom}
        </p>
      </div>

      {/* Copropriete selector */}
      {coproprietes.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">Copropriete :</label>
          <div className="relative">
            <select
              value={currentCoproId ?? ''}
              onChange={(e) => setSelectedCoproId(Number(e.target.value))}
              className="appearance-none rounded-lg border border-input bg-background py-2 pl-3 pr-8 text-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {coproprietes.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          {isConseil && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              <Users className="size-3" /> Conseil syndical
            </span>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/50 p-1">
        {TAB_CONFIG.filter((t) => !t.conseilOnly || isConseil).map(({ key, label, icon: Icon }) => (
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
      {tab === 'profil' && <ProfilTab profil={profil} />}
      {tab === 'documents' && <DocumentsTab coproprieteId={currentCoproId} />}
      {tab === 'compte' && <CompteTab />}
      {tab === 'charges' && <ChargesTab />}
      {tab === 'appels' && <AppelsFondsTab />}
      {tab === 'fonds' && <FondsTravauxtab />}
      {tab === 'conseil' && isConseil && <ConseilTab coproprieteId={currentCoproId} />}
    </div>
  )
}

// ---- Profil Tab ----
function ProfilTab({ profil }: { profil: NonNullable<ReturnType<typeof useExtranetProfil>['data']> }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <User className="size-5 text-primary" />
          <h3 className="text-sm font-semibold">Informations personnelles</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Nom complet</p>
            <p className="text-sm font-medium">{profil.coproprietaire.prenom} {profil.coproprietaire.nom}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{profil.coproprietaire.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Telephone</p>
            <p className="text-sm font-medium">{profil.coproprietaire.telephone ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Adresse de correspondance</p>
            <p className="text-sm font-medium">{profil.coproprietaire.adresse_correspondance ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Lots */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <Home className="size-5 text-primary" />
          <h3 className="text-sm font-semibold">Mes lots ({profil.lots.length})</h3>
        </div>
        {profil.lots.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun lot enregistre.</p>
        ) : (
          <div className="space-y-2">
            {profil.lots.map((lot) => (
              <div key={lot.id} className="flex items-center justify-between rounded border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Lot {lot.numero}</p>
                  <p className="text-xs text-muted-foreground">{lot.type} — {lot.surface ? `${lot.surface} m²` : 'Surface non renseignee'}</p>
                </div>
                <span className="text-sm text-muted-foreground">{lot.tantiemes} tantiemes</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coproprietes */}
      {profil.coproprietes.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Mes coproprietes</h3>
          <div className="space-y-2">
            {profil.coproprietes.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{c.nom}</p>
                  <p className="text-xs text-muted-foreground">{c.adresse}, {c.code_postal} {c.ville}</p>
                </div>
                {profil.conseilSyndical.some((cs) => cs.copropriete_id === c.id) && (
                  <span className="text-xs text-purple-600 font-medium">Conseil syndical</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Documents Tab ----
function DocumentsTab({ coproprieteId }: { coproprieteId: number | undefined }) {
  const { data: docs, isLoading } = useExtranetDocuments(coproprieteId)

  if (isLoading) return <div className="animate-pulse space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded bg-muted" />)}</div>
  if (!docs) return <p className="text-sm text-muted-foreground">Aucune donnee disponible.</p>

  return (
    <div className="space-y-6">
      {/* Documents */}
      {docs.documents?.length > 0 && (
        <Section title="Documents de la copropriete" icon={FileText}>
          {docs.documents.map((doc) => (
            <DocRow key={doc.id} nom={doc.nom} categorie={doc.categorie} fichierNom={doc.fichier_nom} docId={doc.id} />
          ))}
        </Section>
      )}

      {/* PV d'AG */}
      {docs.pvAG?.length > 0 && (
        <Section title="Proces-verbaux des dernieres AG" icon={Calendar}>
          {docs.pvAG.map((ag) => (
            <div key={ag.id} className="rounded border border-border px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">AG {ag.type} du {new Date(ag.date).toLocaleDateString('fr-FR')}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ag.statut === 'terminee' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700'}`}>
                  {ag.statut}
                </span>
              </div>
              {ag.resolutions && ag.resolutions.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">{ag.resolutions.length} resolution(s)</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Diagnostics */}
      {docs.diagnostics?.length > 0 && (
        <Section title="Diagnostics techniques" icon={ClipboardList}>
          {docs.diagnostics.map((d: any, i: number) => (
            <div key={i} className="flex items-center justify-between rounded border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">{d.type}</p>
                <p className="text-xs text-muted-foreground">{d.organisme} — {new Date(d.date_realisation).toLocaleDateString('fr-FR')}</p>
              </div>
              {d.date_expiration && (
                <span className="text-xs text-muted-foreground">Expire: {new Date(d.date_expiration).toLocaleDateString('fr-FR')}</span>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Assurances */}
      {docs.assurances?.length > 0 && (
        <Section title="Assurances en vigueur" icon={Shield}>
          {docs.assurances.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">{a.compagnie}</p>
                <p className="text-xs text-muted-foreground">{a.type} — Police {a.numero_police ?? '—'}</p>
              </div>
              <span className="text-sm">{formatEur(a.prime_annuelle)}/an</span>
            </div>
          ))}
        </Section>
      )}

      {/* Contrats */}
      {docs.contrats?.length > 0 && (
        <Section title="Contrats en cours" icon={Handshake}>
          {docs.contrats.map((c: any, i: number) => (
            <div key={i} className="flex items-center justify-between rounded border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">{c.objet}</p>
                <p className="text-xs text-muted-foreground">{c.prestataire_nom}</p>
              </div>
              <span className="text-sm">{formatEur(c.montant_annuel)}/an</span>
            </div>
          ))}
        </Section>
      )}

      {/* Contrat syndic */}
      {docs.contratSyndic && (
        <Section title="Contrat de syndic" icon={FileText}>
          <div className="rounded border border-border px-3 py-2">
            <p className="text-sm font-medium">{(docs.contratSyndic as any).syndic_nom}</p>
            <p className="text-xs text-muted-foreground">
              Du {new Date((docs.contratSyndic as any).date_debut).toLocaleDateString('fr-FR')} au {new Date((docs.contratSyndic as any).date_fin).toLocaleDateString('fr-FR')}
              {' — '}{formatEur((docs.contratSyndic as any).honoraires_annuels)}/an
            </p>
          </div>
        </Section>
      )}
    </div>
  )
}

// ---- Compte Tab ----
function CompteTab() {
  const { data: compte, isLoading } = useExtranetCompte()

  if (isLoading) return <div className="animate-pulse h-32 rounded bg-muted" />
  if (!compte) return <p className="text-sm text-muted-foreground">Aucune donnee.</p>

  const solde = Number(compte.solde)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total appele" value={formatEur(compte.total_du)} />
        <StatCard label="Total paye" value={formatEur(compte.total_paye)} />
        <StatCard
          label="Solde"
          value={formatEur(solde)}
          color={solde > 0 ? 'text-red-600' : solde < 0 ? 'text-green-600' : undefined}
        />
      </div>
      {solde > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          Vous avez un solde debiteur de {formatEur(solde)}. Merci de regulariser votre situation.
        </div>
      )}
    </div>
  )
}

// ---- Charges Tab ----
function ChargesTab() {
  const { data: charges, isLoading } = useExtranetCharges()

  if (isLoading) return <div className="animate-pulse space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 rounded bg-muted" />)}</div>
  if (!charges?.length) return <p className="text-sm text-muted-foreground">Aucune charge sur les 2 derniers exercices.</p>

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Annee</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Trimestre</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Montant</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {charges.map((c) => (
            <tr key={c.id} className="hover:bg-accent/30">
              <td className="px-3 py-2">{c.annee}</td>
              <td className="px-3 py-2">T{c.trimestre}</td>
              <td className="px-3 py-2 text-right font-medium">{formatEur(c.montant)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-muted/50 font-medium">
          <tr>
            <td colSpan={2} className="px-3 py-2 text-right">Total</td>
            <td className="px-3 py-2 text-right">{formatEur(charges.reduce((s, c) => s + Number(c.montant), 0))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ---- Appels de Fonds Tab ----
function AppelsFondsTab() {
  const { data: appels, isLoading } = useExtranetAppelsFonds()

  if (isLoading) return <div className="animate-pulse space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 rounded bg-muted" />)}</div>
  if (!appels?.length) return <p className="text-sm text-muted-foreground">Aucun appel de fonds sur les 3 dernieres annees.</p>

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Annee</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Trimestre</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Montant appele</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {appels.map((a) => (
            <tr key={a.id} className="hover:bg-accent/30">
              <td className="px-3 py-2">{a.annee}</td>
              <td className="px-3 py-2">T{a.trimestre}</td>
              <td className="px-3 py-2 text-right font-medium">{formatEur(a.montant)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-muted/50 font-medium">
          <tr>
            <td colSpan={2} className="px-3 py-2 text-right">Total</td>
            <td className="px-3 py-2 text-right">{formatEur(appels.reduce((s, a) => s + Number(a.montant), 0))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ---- Fonds Travaux Tab ----
function FondsTravauxtab() {
  const { data: fonds, isLoading } = useExtranetFondsTravaux()

  if (isLoading) return <div className="animate-pulse h-32 rounded bg-muted" />
  if (!fonds?.length) return <p className="text-sm text-muted-foreground">Aucune donnee fonds travaux disponible.</p>

  return (
    <div className="space-y-3">
      {fonds.map((f: any, i: number) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Lot {f.lot_numero} — {f.copropriete_nom}</p>
              <p className="text-xs text-muted-foreground">{f.tantiemes} tantiemes</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{formatEur(f.quote_part)}</p>
              <p className="text-xs text-muted-foreground">Quote-part {f.annee}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---- Conseil Syndical Tab ----
function ConseilTab({ coproprieteId }: { coproprieteId: number | undefined }) {
  const { data, isLoading } = useExtranetConseilSyndical(coproprieteId)

  if (isLoading) return <div className="animate-pulse space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded bg-muted" />)}</div>
  if (!data) return <p className="text-sm text-muted-foreground">Acces reserve aux membres du conseil syndical.</p>

  return (
    <div className="space-y-6">
      {/* Coproprietaires list */}
      <Section title={`Coproprietaires (${data.coproprietaires?.length ?? 0})`} icon={Users}>
        {data.coproprietaires?.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">{c.prenom} {c.nom}</p>
              <p className="text-xs text-muted-foreground">{c.email ?? '—'} — {c.telephone ?? '—'}</p>
            </div>
          </div>
        ))}
      </Section>

      {/* Soldes */}
      {data.soldes?.length > 0 && (
        <Section title="Soldes et etats de charges" icon={CreditCard}>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Coproprietaire</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Appele</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Paye</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Solde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.soldes.map((s) => (
                  <tr key={s.coproprietaire_id} className="hover:bg-accent/30">
                    <td className="px-3 py-2">{s.prenom} {s.nom}</td>
                    <td className="px-3 py-2 text-right">{formatEur(s.total_du)}</td>
                    <td className="px-3 py-2 text-right">{formatEur(s.total_paye)}</td>
                    <td className={`px-3 py-2 text-right font-medium ${Number(s.solde) > 0 ? 'text-red-600' : ''}`}>
                      {formatEur(s.solde)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Bank accounts */}
      {data.comptesBancaires?.length > 0 && (
        <Section title="Releves bancaires" icon={CreditCard}>
          {data.comptesBancaires.map((cb: any) => (
            <div key={cb.id} className="flex items-center justify-between rounded border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">{cb.banque} — {cb.libelle ?? cb.type}</p>
                <p className="text-xs text-muted-foreground font-mono">{cb.iban}</p>
              </div>
              <p className="text-sm font-medium">{formatEur(cb.solde)}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ---- Shared components ----
function Section({ title, icon: Icon, children }: { title: string; icon: typeof FileText; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="size-5 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function DocRow({ nom, categorie, fichierNom, docId }: { nom: string; categorie: string; fichierNom: string; docId: number }) {
  return (
    <div className="flex items-center justify-between rounded border border-border px-3 py-2">
      <div>
        <p className="text-sm font-medium">{nom}</p>
        <p className="text-xs text-muted-foreground">{fichierNom} — {categorie}</p>
      </div>
      <a
        href={documentsApi.getDownloadUrl(docId)}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        title="Telecharger"
      >
        <Download className="size-4" />
      </a>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-semibold ${color ?? ''}`}>{value}</p>
    </div>
  )
}
