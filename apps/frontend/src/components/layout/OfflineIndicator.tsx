import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) {
    return null
  }

  return (
    <output
      aria-live='polite'
      className='fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-sm text-destructive-foreground shadow-md'
    >
      <WifiOff className='size-4' aria-hidden='true' />
      <span>
        Vous etes hors ligne. Certaines fonctionnalites sont limitees.
      </span>
    </output>
  )
}

