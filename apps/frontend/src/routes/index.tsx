import { createHashRouter, Outlet } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { lazy, Suspense } from 'react'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const CoproprietesPage = lazy(() => import('@/pages/CoproprietesPage'))
const CoproprieteDetailPage = lazy(() => import('@/pages/CoproprieteDetailPage'))
const CoproprietairesPage = lazy(() => import('@/pages/CoproprietairesPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  )
}

function AuthenticatedLayout() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </MainLayout>
    </ProtectedRoute>
  )
}

export const router = createHashRouter([
  // Public routes
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      </PublicRoute>
    ),
  },

  // Authenticated routes
  {
    element: <AuthenticatedLayout />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/coproprietes',
        element: <CoproprietesPage />,
      },
      {
        path: '/coproprietes/:id',
        element: <CoproprieteDetailPage />,
      },
      {
        path: '/coproprietaires',
        element: <CoproprietairesPage />,
      },
      // Future routes:
      // { path: '/charges', element: <ChargesPage /> },
      // { path: '/assemblees', element: <AssembleesPage /> },
      // { path: '/travaux', element: <TravauxPage /> },
      // { path: '/documents', element: <DocumentsPage /> },
    ],
  },

  // 404 route
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])
