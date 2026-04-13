import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const DISMISS_STORAGE_KEY = 'copro-pilot:pwa-install-dismissed-at'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000

function isDismissRecent(): boolean {
  try {
    const stored = localStorage.getItem(DISMISS_STORAGE_KEY)
    if (!stored) return false
    const dismissedAt = Number(stored)
    if (Number.isNaN(dismissedAt)) return false
    return Date.now() - dismissedAt < DISMISS_DURATION_MS
  } catch {
    return false
  }
}

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 768px)').matches
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      if (isDismissRecent()) return
      if (!isMobileViewport()) return
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setVisible(false)
    }

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt as EventListener
    )
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } catch {
      // ignore
    } finally {
      setDeferredPrompt(null)
      setVisible(false)
    }
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()))
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible || !deferredPrompt) {
    return null
  }

  return (
    <div
      role='dialog'
      aria-label='Installer CoproPilot'
      className='fixed bottom-4 left-4 right-4 z-[9998] md:hidden'
    >
      <div className='bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-lg p-4 flex items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30'>
          <Download
            className='h-5 w-5 text-emerald-600 dark:text-emerald-400'
            aria-hidden='true'
          />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-stone-900 dark:text-stone-100'>
            Installer CoproPilot sur votre appareil ?
          </p>
          <p className='mt-1 text-xs text-stone-600 dark:text-stone-400'>
            Acces rapide depuis votre ecran d'accueil.
          </p>
          <div className='mt-3 flex items-center gap-2'>
            <Button
              type='button'
              size='sm'
              onClick={handleInstall}
              className='bg-emerald-600 hover:bg-emerald-700 text-white'
            >
              Installer
            </Button>
            <Button
              type='button'
              size='sm'
              variant='ghost'
              onClick={handleDismiss}
            >
              Plus tard
            </Button>
          </div>
        </div>
        <button
          type='button'
          aria-label='Fermer'
          onClick={handleDismiss}
          className='text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
        >
          <X className='h-4 w-4' aria-hidden='true' />
        </button>
      </div>
    </div>
  )
}

export default PwaInstallPrompt
