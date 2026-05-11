import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { OfflineIndicator } from '@/components/layout/OfflineIndicator'
import { PwaInstallPrompt } from '@/components/layout/PwaInstallPrompt'
import { AppUpdatePrompt } from '@/components/layout/AppUpdatePrompt'

function App() {
  return (
    <ErrorBoundary>
      <OfflineIndicator />
      <PwaInstallPrompt />
      <AppUpdatePrompt />
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}

export default App
