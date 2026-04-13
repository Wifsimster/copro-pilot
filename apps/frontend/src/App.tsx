import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { OfflineIndicator } from '@/components/layout/OfflineIndicator'
import { PwaInstallPrompt } from '@/components/layout/PwaInstallPrompt'

function App() {
  return (
    <ErrorBoundary>
      <OfflineIndicator />
      <PwaInstallPrompt />
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}

export default App
