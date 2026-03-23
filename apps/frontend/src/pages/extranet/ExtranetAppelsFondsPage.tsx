import { useExtranetAppelsFonds } from '@/hooks/useExtranet'
import { formatEur } from '@/components/extranet/shared'

export default function ExtranetAppelsFondsPage() {
  const { data: appels, isLoading } = useExtranetAppelsFonds()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appels de fonds</h1>
        <p className="text-muted-foreground">
          Appels de fonds des 3 dernieres annees
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-muted" />
          ))}
        </div>
      ) : !appels?.length ? (
        <p className="text-sm text-muted-foreground">
          Aucun appel de fonds sur les 3 dernières années.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Annee
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Trimestre
                </th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Montant appele
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appels.map(a => (
                <tr key={a.id} className="hover:bg-accent/30">
                  <td className="px-3 py-2">{a.annee}</td>
                  <td className="px-3 py-2">T{a.trimestre}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    {formatEur(a.montant)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/50 font-medium">
              <tr>
                <td
                  colSpan={2}
                  className="px-3 py-2 text-right"
                >
                  Total
                </td>
                <td className="px-3 py-2 text-right">
                  {formatEur(
                    appels.reduce(
                      (s, a) => s + Number(a.montant),
                      0
                    )
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
