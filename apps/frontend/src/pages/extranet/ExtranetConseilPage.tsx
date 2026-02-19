import { useExtranetConseilSyndical } from '@/hooks/useExtranet'
import { Users, CreditCard } from 'lucide-react'
import {
  useExtranetContext,
  formatEur,
  Section,
} from '@/components/extranet/shared'

export default function ExtranetConseilPage() {
  const { currentCoproId } = useExtranetContext()
  const { data, isLoading } =
    useExtranetConseilSyndical(currentCoproId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conseil syndical</h1>
        <p className="text-muted-foreground">
          Donnees reservees aux membres du conseil syndical
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded bg-muted" />
          ))}
        </div>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">
          Acces reserve aux membres du conseil syndical.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Coproprietaires list */}
          <Section
            title={`Coproprietaires (${data.coproprietaires?.length ?? 0})`}
            icon={Users}
          >
            {data.coproprietaires?.map(c => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {c.prenom} {c.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.email ?? '—'} — {c.telephone ?? '—'}
                  </p>
                </div>
              </div>
            ))}
          </Section>

          {/* Soldes */}
          {data.soldes?.length > 0 && (
            <Section
              title="Soldes et etats de charges"
              icon={CreditCard}
            >
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Coproprietaire
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                        Appele
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                        Paye
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                        Solde
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.soldes.map(s => (
                      <tr
                        key={s.coproprietaire_id}
                        className="hover:bg-accent/30"
                      >
                        <td className="px-3 py-2">
                          {s.prenom} {s.nom}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatEur(s.total_du)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatEur(s.total_paye)}
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-medium ${Number(s.solde) > 0 ? 'text-red-600' : ''}`}
                        >
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
            <Section
              title="Releves bancaires"
              icon={CreditCard}
            >
              {data.comptesBancaires.map((cb: any) => (
                <div
                  key={cb.id}
                  className="flex items-center justify-between rounded border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {cb.banque} — {cb.libelle ?? cb.type}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {cb.iban}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatEur(cb.solde)}
                  </p>
                </div>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  )
}
