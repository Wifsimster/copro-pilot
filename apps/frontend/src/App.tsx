import { lazy, Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { OfflineIndicator } from '@/components/layout/OfflineIndicator'

const PwaInstallPrompt = lazy(() =>
  import('@/components/layout/PwaInstallPrompt').then(m => ({
    default: m.PwaInstallPrompt,
  }))
)
const AppUpdatePrompt = lazy(() =>
  import('@/components/layout/AppUpdatePrompt').then(m => ({
    default: m.AppUpdatePrompt,
  }))
)

function App() {
  return (
    <ErrorBoundary>
      <OfflineIndicator />
      <Suspense fallback={null}>
        <PwaInstallPrompt />
        <AppUpdatePrompt />
      </Suspense>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}

export default App
