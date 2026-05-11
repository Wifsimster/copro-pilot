import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const RELOAD_INTERVAL_MS = 60 * 60 * 1000

export function AppUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      setInterval(() => {
        registration.update().catch(() => {
          // ignore network errors during periodic update check
        })
      }, RELOAD_INTERVAL_MS)
    },
  })

  const [reloading, setReloading] = useState(false)

  useEffect(() => {
    if (!needRefresh) {
      setReloading(false)
    }
  }, [needRefresh])

  const handleReload = async () => {
    setReloading(true)
    try {
      await updateServiceWorker(true)
    } catch {
      setReloading(false)
    }
  }

  const handleDismiss = () => {
    setNeedRefresh(false)
  }

  if (!needRefresh) {
    return null
  }

  return (
    <div
      role='dialog'
      aria-label='Mise a jour disponible'
      className='fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:max-w-sm'
    >
      <div className='bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-lg p-4 flex items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30'>
          <RefreshCw
            className='h-5 w-5 text-emerald-600 dark:text-emerald-400'
            aria-hidden='true'
          />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-stone-900 dark:text-stone-100'>
            Nouvelle version disponible
          </p>
          <p className='mt-1 text-xs text-stone-600 dark:text-stone-400'>
            Rechargez l'application pour beneficier des dernieres ameliorations.
          </p>
          <div className='mt-3 flex items-center gap-2'>
            <Button
              type='button'
              size='sm'
              onClick={handleReload}
              disabled={reloading}
              className='bg-emerald-600 hover:bg-emerald-700 text-white'
            >
              {reloading ? 'Rechargement...' : 'Recharger'}
            </Button>
            <Button
              type='button'
              size='sm'
              variant='ghost'
              onClick={handleDismiss}
              disabled={reloading}
            >
              Plus tard
            </Button>
          </div>
        </div>
        <button
          type='button'
          aria-label='Fermer'
          onClick={handleDismiss}
          disabled={reloading}
          className='text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 disabled:opacity-50'
        >
          <X className='h-4 w-4' aria-hidden='true' />
        </button>
      </div>
    </div>
  )
}

export default AppUpdatePrompt
