import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Filter,
} from 'lucide-react'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'
import type { TypeNotification } from '@/types'

const typeLabels: Record<TypeNotification, string> = {
  incident: 'Incident',
  ag: 'AG',
  paiement: 'Paiement',
  document: 'Document',
  general: 'General',
}

const typeColors: Record<TypeNotification, string> = {
  incident: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  paiement: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  document: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  general: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
}

const allTypes: TypeNotification[] = ['incident', 'ag', 'paiement', 'document', 'general']

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { data: notifications, isLoading } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const [filterType, setFilterType] = useState<TypeNotification | 'all'>('all')

  const filtered = notifications?.filter(
    (n) => filterType === 'all' || n.type === filterType
  ) ?? []

  const unreadCount = notifications?.filter((n) => !n.lu).length ?? 0

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-stone-600 dark:text-stone-400" />
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes lues'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead.mutate()}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            <CheckCheck className="h-4 w-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-stone-400" />
        <button
          onClick={() => setFilterType('all')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            filterType === 'all'
              ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-700'
          )}
        >
          Toutes
        </button>
        {allTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              filterType === type
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-700'
            )}
          >
            {typeLabels[type]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-stone-500 dark:text-stone-400">
            Aucune notification
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {filtered.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'flex items-start gap-4 px-5 py-4 transition-colors',
                  !notification.lu && 'bg-emerald-50/50 dark:bg-emerald-900/10'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                        typeColors[notification.type]
                      )}
                    >
                      {typeLabels[notification.type]}
                    </span>
                    {!notification.lu && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                    <span className="text-xs text-stone-400 dark:text-stone-500">
                      {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-stone-900 dark:text-white">
                    {notification.titre}
                  </p>
                  {notification.message && (
                    <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                      {notification.message}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {notification.lien && (
                    <button
                      onClick={() => navigate(notification.lien!)}
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
                      title="Voir"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                  {!notification.lu && (
                    <button
                      onClick={() => markAsRead.mutate(notification.id)}
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-green-600 dark:hover:bg-stone-800 dark:hover:text-green-400"
                      title="Marquer comme lue"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification.mutate(notification.id)}
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-600 dark:hover:bg-stone-800 dark:hover:text-red-400"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
