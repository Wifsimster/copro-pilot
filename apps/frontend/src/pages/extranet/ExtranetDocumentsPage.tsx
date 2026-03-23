import { useExtranetDocuments } from '@/hooks/useExtranet'
import {
  FileText,
  Calendar,
  ClipboardList,
  Shield,
  Handshake,
} from 'lucide-react'
import {
  useExtranetContext,
  formatEur,
  Section,
  DocRow,
} from '@/components/extranet/shared'

export default function ExtranetDocumentsPage() {
  const { currentCoproId } = useExtranetContext()
  const { data: docs, isLoading } =
    useExtranetDocuments(currentCoproId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-muted-foreground">
          Documents de votre copropriete
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded bg-muted" />
          ))}
        </div>
      ) : !docs ? (
        <p className="text-sm text-muted-foreground">
          Aucune donnée disponible.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Documents */}
          {docs.documents?.length > 0 && (
            <Section
              title="Documents de la copropriete"
              icon={FileText}
            >
              {docs.documents.map(doc => (
                <DocRow
                  key={doc.id}
                  nom={doc.nom}
                  categorie={doc.categorie}
                  fichierNom={doc.fichier_nom}
                  docId={doc.id}
                />
              ))}
            </Section>
          )}

          {/* PV d'AG */}
          {docs.pvAG?.length > 0 && (
            <Section
              title="Proces-verbaux des dernieres AG"
              icon={Calendar}
            >
              {docs.pvAG.map(ag => (
                <div
                  key={ag.id}
                  className="rounded border border-border px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      AG {ag.type} du{' '}
                      {new Date(ag.date).toLocaleDateString(
                        'fr-FR'
                      )}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${ag.statut === 'terminee' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-stone-100 text-stone-700'}`}
                    >
                      {ag.statut}
                    </span>
                  </div>
                  {ag.resolutions && ag.resolutions.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ag.resolutions.length} resolution(s)
                    </p>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* Diagnostics */}
          {docs.diagnostics?.length > 0 && (
            <Section
              title="Diagnostics techniques"
              icon={ClipboardList}
            >
              {docs.diagnostics.map((d: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{d.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.organisme} —{' '}
                      {new Date(
                        d.date_realisation
                      ).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {d.date_expiration && (
                    <span className="text-xs text-muted-foreground">
                      Expire:{' '}
                      {new Date(
                        d.date_expiration
                      ).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* Assurances */}
          {docs.assurances?.length > 0 && (
            <Section
              title="Assurances en vigueur"
              icon={Shield}
            >
              {docs.assurances.map(a => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {a.compagnie}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.type} — Police{' '}
                      {a.numero_police ?? '—'}
                    </p>
                  </div>
                  <span className="text-sm">
                    {formatEur(a.prime_annuelle)}/an
                  </span>
                </div>
              ))}
            </Section>
          )}

          {/* Contrats */}
          {docs.contrats?.length > 0 && (
            <Section
              title="Contrats en cours"
              icon={Handshake}
            >
              {docs.contrats.map((c: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {c.objet}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.prestataire_nom}
                    </p>
                  </div>
                  <span className="text-sm">
                    {formatEur(c.montant_annuel)}/an
                  </span>
                </div>
              ))}
            </Section>
          )}

          {/* Contrat syndic */}
          {docs.contratSyndic && (
            <Section title="Contrat de syndic" icon={FileText}>
              <div className="rounded border border-border px-3 py-2">
                <p className="text-sm font-medium">
                  {(docs.contratSyndic as any).syndic_nom}
                </p>
                <p className="text-xs text-muted-foreground">
                  Du{' '}
                  {new Date(
                    (docs.contratSyndic as any).date_debut
                  ).toLocaleDateString('fr-FR')}{' '}
                  au{' '}
                  {new Date(
                    (docs.contratSyndic as any).date_fin
                  ).toLocaleDateString('fr-FR')}
                  {' — '}
                  {formatEur(
                    (docs.contratSyndic as any)
                      .honoraires_annuels
                  )}
                  /an
                </p>
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  )
}
