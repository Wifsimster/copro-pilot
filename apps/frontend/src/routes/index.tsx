import { createHashRouter, Outlet } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { lazy, Suspense } from 'react'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const CoproprietesPage = lazy(() => import('@/pages/CoproprietesPage'))
const CoproprieteDetailPage = lazy(() => import('@/pages/CoproprieteDetailPage'))
const CoproprietairesPage = lazy(() => import('@/pages/CoproprietairesPage'))
const ChargesPage = lazy(() => import('@/pages/ChargesPage'))
const AssembleesPage = lazy(() => import('@/pages/AssembleesPage'))
const TravauxPage = lazy(() => import('@/pages/TravauxPage'))
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'))
const FicheSynthetiquePage = lazy(() => import('@/pages/FicheSynthetiquePage'))
const AssembleeDetailPage = lazy(() => import('@/pages/AssembleeDetailPage'))
const ComptesBancairesPage = lazy(() => import('@/pages/ComptesBancairesPage'))
const ConseilSyndicalPage = lazy(() => import('@/pages/ConseilSyndicalPage'))
const ContratsPage = lazy(() => import('@/pages/ContratsPage'))
const AssurancesPage = lazy(() => import('@/pages/AssurancesPage'))
const ContentieuxPage = lazy(() => import('@/pages/ContentieuxPage'))
const EmployesPage = lazy(() => import('@/pages/EmployesPage'))
const ReglementsPage = lazy(() => import('@/pages/ReglementsPage'))
const ImmatriculationPage = lazy(() => import('@/pages/ImmatriculationPage'))
const ContratsSyndicPage = lazy(() => import('@/pages/ContratsSyndicPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const ExportsPage = lazy(() => import('@/pages/ExportsPage'))
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
      {
        path: '/charges',
        element: <ChargesPage />,
      },
      {
        path: '/assemblees',
        element: <AssembleesPage />,
      },
      {
        path: '/assemblees/:id',
        element: <AssembleeDetailPage />,
      },
      {
        path: '/travaux',
        element: <TravauxPage />,
      },
      {
        path: '/documents',
        element: <DocumentsPage />,
      },
      {
        path: '/fiche-synthetique',
        element: <FicheSynthetiquePage />,
      },
      {
        path: '/comptes-bancaires',
        element: <ComptesBancairesPage />,
      },
      {
        path: '/conseil-syndical',
        element: <ConseilSyndicalPage />,
      },
      {
        path: '/contrats',
        element: <ContratsPage />,
      },
      {
        path: '/assurances',
        element: <AssurancesPage />,
      },
      {
        path: '/contentieux',
        element: <ContentieuxPage />,
      },
      {
        path: '/employes',
        element: <EmployesPage />,
      },
      {
        path: '/reglements',
        element: <ReglementsPage />,
      },
      {
        path: '/immatriculation',
        element: <ImmatriculationPage />,
      },
      {
        path: '/contrats-syndic',
        element: <ContratsSyndicPage />,
      },
      {
        path: '/notifications',
        element: <NotificationsPage />,
      },
      {
        path: '/exports',
        element: <ExportsPage />,
      },
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
