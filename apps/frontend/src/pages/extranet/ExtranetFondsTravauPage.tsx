import { useExtranetFondsTravaux } from '@/hooks/useExtranet'
import { formatEur } from '@/components/extranet/shared'

export default function ExtranetFondsTravauPage() {
  const { data: fonds, isLoading } = useExtranetFondsTravaux()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fonds travaux</h1>
        <p className="text-muted-foreground">
          Detail de vos fonds travaux par lot
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-32 rounded bg-muted" />
      ) : !fonds?.length ? (
        <p className="text-sm text-muted-foreground">
          Aucune donnee fonds travaux disponible.
        </p>
      ) : (
        <div className="space-y-3">
          {fonds.map((f: any, i: number) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Lot {f.lot_numero} - {f.copropriete_nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {f.tantiemes} tantiemes
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatEur(f.quote_part)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Quote-part {f.annee}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
