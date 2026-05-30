import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'
import type { Notification, TypeNotification } from '@/types'

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

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "A l'instant"
  if (diffMin < 60) return `Il y a ${diffMin}min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 30) return `Il y a ${diffD}j`
  return date.toLocaleDateString('fr-FR')
}

function NotificationItem({
  notification,
  onNavigate,
}: {
  notification: Notification
  onNavigate: (n: Notification) => void
}) {
  return (
    <button type="button"
      onClick={() => onNavigate(notification)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-800',
        !notification.lu && 'bg-emerald-50/50 dark:bg-emerald-900/10'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              typeColors[notification.type]
            )}
          >
            {typeLabels[notification.type]}
          </span>
          {!notification.lu && (
            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
          )}
        </div>
        <p className="mt-1 text-sm font-medium text-stone-900 dark:text-white truncate">
          {notification.titre}
        </p>
        {notification.message && (
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">
          {formatTimeAgo(notification.created_at)}
        </p>
      </div>
      {notification.lien && (
        <ExternalLink className="mt-1 size-3.5 shrink-0 text-stone-400" />
      )}
    </button>
  )
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data: notifications } = useNotifications()
  const { data: unreadCount } = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const recentNotifications = notifications?.slice(0, 10) ?? []

  const handleNavigate = (notification: Notification) => {
    if (!notification.lu) {
      markAsRead.mutate(notification.id)
    }
    if (notification.lien) {
      navigate(notification.lien)
    }
    setOpen(false)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button"
          className="relative rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {!!unreadCount && unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
            Notifications
          </h3>
          {!!unreadCount && unreadCount > 0 && (
            <button type="button"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <CheckCheck className="size-3.5" />
              Tout marquer comme lu
            </button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-stone-500 dark:text-stone-400">
              Aucune notification
            </div>
          ) : (
            <div className="p-1">
              {recentNotifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-stone-200 dark:border-stone-700">
          <button type="button"
            onClick={() => {
              navigate('/notifications')
              setOpen(false)
            }}
            className="flex w-full items-center justify-center gap-1 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-stone-50 dark:text-emerald-400 dark:hover:bg-stone-800"
          >
            Voir toutes les notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
