import { User, Home, Users } from 'lucide-react'
import { useExtranetContext } from '@/components/extranet/shared'

export default function ExtranetProfilPage() {
  const { profil } = useExtranetContext()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">
          Vos informations personnelles et vos lots
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center gap-3">
            <User className="size-5 text-primary" />
            <h3 className="text-sm font-semibold">
              Informations personnelles
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">
                Nom complet
              </p>
              <p className="text-sm font-medium">
                {profil.coproprietaire.prenom}{' '}
                {profil.coproprietaire.nom}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Email
              </p>
              <p className="text-sm font-medium">
                {profil.coproprietaire.email ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Telephone
              </p>
              <p className="text-sm font-medium">
                {profil.coproprietaire.telephone ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Adresse de correspondance
              </p>
              <p className="text-sm font-medium">
                {profil.coproprietaire.adresse_correspondance ??
                  '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Lots */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center gap-3">
            <Home className="size-5 text-primary" />
            <h3 className="text-sm font-semibold">
              Mes lots ({profil.lots.length})
            </h3>
          </div>
          {profil.lots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun lot enregistre.
            </p>
          ) : (
            <div className="space-y-2">
              {profil.lots.map(lot => (
                <div
                  key={lot.id}
                  className="flex items-center justify-between rounded border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Lot {lot.numero}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lot.type} —{' '}
                      {lot.surface
                        ? `${lot.surface} m²`
                        : 'Surface non renseignee'}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {lot.tantiemes} tantiemes
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coproprietes */}
        {profil.coproprietes.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-3">
              <Users className="size-5 text-primary" />
              <h3 className="text-sm font-semibold">
                Mes coproprietes
              </h3>
            </div>
            <div className="space-y-2">
              {profil.coproprietes.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{c.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.adresse}, {c.code_postal} {c.ville}
                    </p>
                  </div>
                  {profil.conseilSyndical.some(
                    cs => cs.copropriete_id === c.id
                  ) && (
                    <span className="text-xs font-medium text-purple-600">
                      Conseil syndical
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
