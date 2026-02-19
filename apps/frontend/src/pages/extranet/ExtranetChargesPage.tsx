import { useExtranetCharges } from '@/hooks/useExtranet'
import { formatEur } from '@/components/extranet/shared'

export default function ExtranetChargesPage() {
  const { data: charges, isLoading } = useExtranetCharges()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes charges</h1>
        <p className="text-muted-foreground">
          Charges des 2 derniers exercices
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-muted" />
          ))}
        </div>
      ) : !charges?.length ? (
        <p className="text-sm text-muted-foreground">
          Aucune charge sur les 2 derniers exercices.
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
                  Montant
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {charges.map(c => (
                <tr key={c.id} className="hover:bg-accent/30">
                  <td className="px-3 py-2">{c.annee}</td>
                  <td className="px-3 py-2">T{c.trimestre}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    {formatEur(c.montant)}
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
                    charges.reduce(
                      (s, c) => s + Number(c.montant),
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
