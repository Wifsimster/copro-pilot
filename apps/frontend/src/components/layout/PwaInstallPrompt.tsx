import { useEffect, useMemo, useReducer } from 'react'
import { Download, Monitor, Share, Smartphone, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

type Platform = 'android-chrome' | 'desktop' | 'ios-safari' | 'unsupported'

const DISMISS_STORAGE_KEY = 'copro-pilot:pwa-install-dismissed-at'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000
const SHOW_DELAY_MS = 20 * 1000

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

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // iOS Safari exposes navigator.standalone
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true
}

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'unsupported'
  const ua = window.navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua)
  if (isIOS && isSafari) return 'ios-safari'
  const isAndroid = /Android/.test(ua)
  if (isAndroid) return 'android-chrome'
  return 'desktop'
}

interface PromptState {
  deferredPrompt: BeforeInstallPromptEvent | null
  visible: boolean
}

type PromptAction =
  | { type: 'available'; prompt: BeforeInstallPromptEvent }
  | { type: 'show' }
  | { type: 'hide' }
  | { type: 'reset' }

function promptReducer(state: PromptState, action: PromptAction): PromptState {
  switch (action.type) {
    case 'available':
      return { deferredPrompt: action.prompt, visible: true }
    case 'show':
      return { ...state, visible: true }
    case 'hide':
      return { ...state, visible: false }
    case 'reset':
      return { deferredPrompt: null, visible: false }
    default:
      return state
  }
}

export function PwaInstallPrompt() {
  // deferredPrompt and visibility change together; a reducer coordinates them
  // with a single dispatch so the effect has no cascading setState calls.
  const [state, dispatch] = useReducer(promptReducer, {
    deferredPrompt: null,
    visible: false,
  })
  const { deferredPrompt, visible } = state
  const platform = useMemo<Platform>(detectPlatform, [])

  useEffect(() => {
    if (isStandalone()) return
    if (isDismissRecent()) return

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      dispatch({
        type: 'available',
        prompt: event as BeforeInstallPromptEvent,
      })
    }

    const handleAppInstalled = () => {
      dispatch({ type: 'reset' })
    }

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt as EventListener
    )
    window.addEventListener('appinstalled', handleAppInstalled)

    // iOS Safari never fires beforeinstallprompt: show manual instructions
    // after a short delay so the prompt is not intrusive on first paint.
    let timer: ReturnType<typeof setTimeout> | undefined
    if (platform === 'ios-safari') {
      timer = setTimeout(() => dispatch({ type: 'show' }), SHOW_DELAY_MS)
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
      if (timer) clearTimeout(timer)
    }
  }, [platform])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } catch {
      // ignore
    } finally {
      dispatch({ type: 'reset' })
    }
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()))
    } catch {
      // ignore
    }
    dispatch({ type: 'hide' })
  }

  if (!visible) return null

  const canPrompt = deferredPrompt !== null
  const isIos = platform === 'ios-safari'
  const isMobile = platform === 'android-chrome' || isIos
  const Icon = isMobile ? Smartphone : Monitor

  const title = isMobile
    ? 'Installer CoproPilot sur votre mobile'
    : 'Installer CoproPilot sur votre ordinateur'

  const description = isIos
    ? "Touchez l'icone Partager puis « Sur l'ecran d'accueil » pour un acces rapide."
    : isMobile
      ? "Acces rapide depuis votre ecran d'accueil, meme hors ligne."
      : 'Lancez CoproPilot en un clic depuis votre bureau, meme hors ligne.'

  return (
    <dialog
      open
      aria-label='Installer CoproPilot'
      className='fixed bottom-4 left-4 right-4 z-[9998] m-0 w-auto border-0 bg-transparent p-0 sm:left-auto sm:right-4 sm:max-w-sm'
    >
      <div className='bg-card border border-border rounded-lg shadow-lg p-4 flex items-start gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10'>
          <Icon
            className='size-5 text-primary'
            aria-hidden='true'
          />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-foreground'>
            {title}
          </p>
          <p className='mt-1 text-xs text-muted-foreground'>
            {description}
          </p>
          {isIos && (
            <p className='mt-2 flex items-center gap-1 text-xs text-muted-foreground'>
              <Share className='size-3.5' aria-hidden='true' />
              <span>Partager → Sur l'ecran d'accueil</span>
            </p>
          )}
          <div className='mt-3 flex items-center gap-2'>
            {canPrompt && (
              <Button
                type='button'
                size='sm'
                onClick={handleInstall}
              >
                <Download className='size-4 mr-1' aria-hidden='true' />
                Installer
              </Button>
            )}
            <Button
              type='button'
              size='sm'
              variant='ghost'
              onClick={handleDismiss}
            >
              {canPrompt ? 'Plus tard' : 'Compris'}
            </Button>
          </div>
        </div>
        <button
          type='button'
          aria-label='Fermer'
          onClick={handleDismiss}
          className='text-muted-foreground hover:text-foreground'
        >
          <X className='size-4' aria-hidden='true' />
        </button>
      </div>
    </dialog>
  )
}

export default PwaInstallPrompt
