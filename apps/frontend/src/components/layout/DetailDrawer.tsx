import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { incidentsApi } from '@/api/incidents'
import { assembleesApi } from '@/api/assemblees'
import { contratsApi } from '@/api/contrats'
import { interventionsApi } from '@/api/interventions'
import {
  AlertTriangle,
  Calendar,
  FileText,
  Wrench,
  ExternalLink,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {
  Incident,
  AssembleeGenerale,
  Contrat,
  Intervention,
} from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: string | null
  entityId: number | null
  link: string | null
}

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------

const ENTITY_ICONS: Record<string, LucideIcon> = {
  incident: AlertTriangle,
  ag: Calendar,
  contrat: FileText,
  intervention: Wrench,
}

const ENTITY_LABELS: Record<string, string> = {
  incident: 'Incident',
  ag: 'Assemblee Generale',
  contrat: 'Contrat',
  intervention: 'Intervention',
}

// ---------------------------------------------------------------------------
// Urgency / Status badge styles
// ---------------------------------------------------------------------------

const URGENCE_STYLES: Record<string, string> = {
  critique:
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  haute:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  moyenne:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  faible:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const STATUT_STYLES: Record<string, string> = {
  ouvert:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  en_cours:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  resolu:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ferme:
    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  planifiee:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  convoquee:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  terminee:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  annulee:
    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  actif:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expire:
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

async function fetchEntity(
  entityType: string,
  entityId: number
): Promise<unknown> {
  switch (entityType) {
    case 'incident': {
      const res = await incidentsApi.getById(entityId)
      return res.data
    }
    case 'ag': {
      const res = await assembleesApi.getById(entityId)
      return res.data
    }
    case 'contrat': {
      const res = await contratsApi.getById(entityId)
      return res.data
    }
    case 'intervention': {
      const res = await interventionsApi.getById(entityId)
      return res.data
    }
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Field display component
// ---------------------------------------------------------------------------

function DetailField({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  if (value === null || value === undefined || value === '')
    return null
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}

function StatusBadge({
  value,
  styles,
}: {
  value: string
  styles: Record<string, string>
}) {
  const className =
    styles[value] ||
    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {value.replace(/_/g, ' ')}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Entity detail renderers
// ---------------------------------------------------------------------------

function IncidentDetail({ data }: { data: Incident }) {
  return (
    <dl className="space-y-4">
      <DetailField label="Titre" value={data.titre} />
      <DetailField
        label="Statut"
        value={
          <StatusBadge
            value={data.statut}
            styles={STATUT_STYLES}
          />
        }
      />
      <DetailField
        label="Urgence"
        value={
          <StatusBadge
            value={data.urgence}
            styles={URGENCE_STYLES}
          />
        }
      />
      <DetailField
        label="Description"
        value={data.description}
      />
      <DetailField
        label="Categorie"
        value={data.categorie}
      />
      <DetailField
        label="Date de signalement"
        value={
          data.date_signalement
            ? new Date(
                data.date_signalement
              ).toLocaleDateString('fr-FR')
            : undefined
        }
      />
      {data.date_resolution && (
        <DetailField
          label="Date de resolution"
          value={new Date(
            data.date_resolution
          ).toLocaleDateString('fr-FR')}
        />
      )}
      <DetailField
        label="Signale par"
        value={
          data.signale_par_nom
            ? `${data.signale_par_prenom} ${data.signale_par_nom}`
            : undefined
        }
      />
      <DetailField label="Notes" value={data.notes} />
    </dl>
  )
}

function AGDetail({ data }: { data: AssembleeGenerale }) {
  return (
    <dl className="space-y-4">
      <DetailField
        label="Date"
        value={new Date(data.date).toLocaleDateString(
          'fr-FR',
          {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }
        )}
      />
      {data.heure && (
        <DetailField label="Heure" value={data.heure} />
      )}
      <DetailField
        label="Type"
        value={
          data.type === 'ordinaire'
            ? 'Ordinaire'
            : 'Extraordinaire'
        }
      />
      <DetailField
        label="Statut"
        value={
          <StatusBadge
            value={data.statut}
            styles={STATUT_STYLES}
          />
        }
      />
      <DetailField label="Lieu" value={data.lieu} />
      <DetailField
        label="Ordre du jour"
        value={data.ordre_du_jour}
      />
      {data.date_convocation && (
        <DetailField
          label="Date de convocation"
          value={new Date(
            data.date_convocation
          ).toLocaleDateString('fr-FR')}
        />
      )}
      <DetailField label="Notes" value={data.notes} />
    </dl>
  )
}

function ContratDetail({ data }: { data: Contrat }) {
  return (
    <dl className="space-y-4">
      <DetailField label="Objet" value={data.objet} />
      <DetailField
        label="Statut"
        value={
          <StatusBadge
            value={data.statut}
            styles={STATUT_STYLES}
          />
        }
      />
      <DetailField label="Type" value={data.type} />
      <DetailField
        label="Prestataire"
        value={data.prestataire_nom}
      />
      <DetailField
        label="Date de debut"
        value={new Date(
          data.date_debut
        ).toLocaleDateString('fr-FR')}
      />
      {data.date_fin && (
        <DetailField
          label="Date de fin"
          value={new Date(
            data.date_fin
          ).toLocaleDateString('fr-FR')}
        />
      )}
      {data.montant_annuel != null && (
        <DetailField
          label="Montant annuel"
          value={new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
          }).format(data.montant_annuel)}
        />
      )}
      <DetailField label="Notes" value={data.notes} />
    </dl>
  )
}

function InterventionDetail({
  data,
}: {
  data: Intervention
}) {
  return (
    <dl className="space-y-4">
      <DetailField
        label="Description"
        value={data.description}
      />
      <DetailField
        label="Statut"
        value={
          <StatusBadge
            value={data.statut}
            styles={STATUT_STYLES}
          />
        }
      />
      <DetailField
        label="Prestataire"
        value={data.prestataire}
      />
      {data.date_prevue && (
        <DetailField
          label="Date prevue"
          value={new Date(
            data.date_prevue
          ).toLocaleDateString('fr-FR')}
        />
      )}
      {data.date_realisation && (
        <DetailField
          label="Date de realisation"
          value={new Date(
            data.date_realisation
          ).toLocaleDateString('fr-FR')}
        />
      )}
      {data.montant_devis != null && (
        <DetailField
          label="Montant devis"
          value={new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
          }).format(data.montant_devis)}
        />
      )}
      {data.montant_facture != null && (
        <DetailField
          label="Montant facture"
          value={new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
          }).format(data.montant_facture)}
        />
      )}
      <DetailField
        label="Incident lie"
        value={data.incident_titre}
      />
      <DetailField label="Notes" value={data.notes} />
    </dl>
  )
}

function GenericDetail({
  link,
}: {
  link: string | null
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-sm text-muted-foreground">
        Apercu non disponible pour ce type d&apos;element.
      </p>
      {link && (
        <Button variant="outline" size="sm" asChild>
          <Link to={link}>
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Voir la page
          </Link>
        </Button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function DetailSkeleton() {
  return (
    <div className="space-y-5 px-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DetailDrawer({
  open,
  onOpenChange,
  entityType,
  entityId,
  link,
}: DetailDrawerProps) {
  const canFetch =
    entityType != null &&
    entityId != null &&
    ['incident', 'ag', 'contrat', 'intervention'].includes(
      entityType
    )

  const { data, isLoading, isError } = useQuery({
    queryKey: ['detail-drawer', entityType, entityId],
    queryFn: () => fetchEntity(entityType!, entityId!),
    enabled: open && canFetch,
    staleTime: 30_000,
  })

  const Icon =
    (entityType && ENTITY_ICONS[entityType]) || FileText
  const label =
    (entityType && ENTITY_LABELS[entityType]) || entityType

  function renderContent() {
    if (!entityType || entityId == null) return null

    if (!canFetch) {
      return (
        <GenericDetail
          link={link}
        />
      )
    }

    if (isLoading) return <DetailSkeleton />

    if (isError || !data) {
      return (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Impossible de charger les details.
          </p>
          {link && (
            <Button variant="outline" size="sm" asChild>
              <Link to={link}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Voir la page
              </Link>
            </Button>
          )}
        </div>
      )
    }

    switch (entityType) {
      case 'incident':
        return (
          <IncidentDetail data={data as Incident} />
        )
      case 'ag':
        return (
          <AGDetail data={data as AssembleeGenerale} />
        )
      case 'contrat':
        return <ContratDetail data={data as Contrat} />
      case 'intervention':
        return (
          <InterventionDetail
            data={data as Intervention}
          />
        )
      default:
        return (
          <GenericDetail
            link={link}
          />
        )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            {label}
          </SheetTitle>
          <SheetDescription>
            Details de l&apos;element
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 px-4">{renderContent()}</div>

        <SheetFooter>
          {link && (
            <Button variant="outline" asChild>
              <Link to={link}>
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Ouvrir la page
              </Link>
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
