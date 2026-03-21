import {
  Plus,
  Pencil,
  ArrowRight,
  Trash2,
  Clock,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEntityTimeline } from '@/hooks/useTimeline'
import type { DomainEvent } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EntityTimelineProps {
  entityType: string
  entityId: number
}

// ---------------------------------------------------------------------------
// Event type → icon & dot color
// ---------------------------------------------------------------------------

interface EventStyle {
  icon: LucideIcon
  dotColor: string
}

function getEventStyle(eventType: string): EventStyle {
  if (eventType.endsWith('.created')) {
    return {
      icon: Plus,
      dotColor:
        'bg-green-500 dark:bg-green-400',
    }
  }
  if (eventType.endsWith('.status_changed')) {
    return {
      icon: ArrowRight,
      dotColor:
        'bg-yellow-500 dark:bg-yellow-400',
    }
  }
  if (eventType.endsWith('.updated')) {
    return {
      icon: Pencil,
      dotColor:
        'bg-blue-500 dark:bg-blue-400',
    }
  }
  if (eventType.endsWith('.deleted')) {
    return {
      icon: Trash2,
      dotColor: 'bg-red-500 dark:bg-red-400',
    }
  }
  return {
    icon: Clock,
    dotColor: 'bg-gray-500 dark:bg-gray-400',
  }
}

// ---------------------------------------------------------------------------
// Event type → French label
// ---------------------------------------------------------------------------

const EVENT_LABELS: Record<string, string> = {
  'incident.created': 'Incident cree',
  'incident.updated': 'Incident mis a jour',
  'incident.status_changed':
    'Statut incident modifie',
  'intervention.created': 'Intervention creee',
  'intervention.status_changed':
    'Statut intervention modifie',
  'ordre_service.created':
    'Ordre de service cree',
  'ordre_service.status_changed':
    'Statut OdS modifie',
  'paiement.created': 'Paiement enregistre',
  'sinistre.created': 'Sinistre declare',
  'assemblee.status_changed':
    'Statut AG modifie',
}

function getEventLabel(eventType: string): string {
  return EVENT_LABELS[eventType] || eventType
}

// ---------------------------------------------------------------------------
// Time ago helper
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffSeconds = Math.floor(
    (now - date) / 1000
  )

  if (diffSeconds < 60) return "a l'instant"
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60)
    return `il y a ${diffMinutes} min`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24)
    return `il y a ${diffHours} h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30)
    return `il y a ${diffDays} j`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12)
    return `il y a ${diffMonths} mois`
  const diffYears = Math.floor(diffMonths / 12)
  return `il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`
}

// ---------------------------------------------------------------------------
// Event node
// ---------------------------------------------------------------------------

function TimelineEvent({
  event,
  isLast,
}: {
  event: DomainEvent
  isLast: boolean
}) {
  const { icon: Icon, dotColor } = getEventStyle(
    event.event_type
  )
  const label = getEventLabel(event.event_type)
  const payload = event.payload as Record<
    string,
    unknown
  >

  const hasStatusTransition =
    typeof payload.from_status === 'string' &&
    typeof payload.to_status === 'string'

  // Gather extra payload keys (excluding status fields)
  const extraKeys = Object.keys(payload).filter(
    k =>
      k !== 'from_status' &&
      k !== 'to_status' &&
      k !== 'entity_type' &&
      k !== 'entity_id'
  )

  return (
    <div className="relative flex gap-4">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div
          className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${dotColor}`}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>
        {!isLast && (
          <div className="w-0.5 grow bg-border" />
        )}
      </div>

      {/* Event content */}
      <div className={`pb-6 ${isLast ? '' : ''}`}>
        <p className="text-sm font-medium text-foreground">
          {label}
        </p>
        <p className="text-xs text-muted-foreground">
          {timeAgo(event.created_at)}
          {' — '}
          {new Date(
            event.created_at
          ).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        {hasStatusTransition && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">
              {String(
                payload.from_status
              ).replace(/_/g, ' ')}
            </Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Badge variant="secondary">
              {String(
                payload.to_status
              ).replace(/_/g, ' ')}
            </Badge>
          </div>
        )}

        {extraKeys.length > 0 && (
          <div className="mt-2 space-y-1">
            {extraKeys.map(key => (
              <p
                key={key}
                className="text-xs text-muted-foreground"
              >
                <span className="font-medium">
                  {key.replace(/_/g, ' ')}
                </span>
                {': '}
                {String(payload[key])}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            {i < 2 && (
              <div className="w-0.5 grow bg-muted" />
            )}
          </div>
          <div className="flex-1 space-y-2 pb-6">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function TimelineEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <Clock className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Aucun evenement
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function EntityTimeline({
  entityType,
  entityId,
}: EntityTimelineProps) {
  const { data: events, isLoading } =
    useEntityTimeline(entityType, entityId)

  if (isLoading) {
    return (
      <Card className="py-4">
        <CardContent>
          <TimelineSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (!events || events.length === 0) {
    return (
      <Card className="py-4">
        <CardContent>
          <TimelineEmpty />
        </CardContent>
      </Card>
    )
  }

  // Most recent first (already sorted by API, but ensure)
  const sorted = [...events].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  )

  return (
    <Card className="py-4">
      <CardContent>
        {sorted.map((event, index) => (
          <TimelineEvent
            key={event.id}
            event={event}
            isLast={index === sorted.length - 1}
          />
        ))}
      </CardContent>
    </Card>
  )
}
