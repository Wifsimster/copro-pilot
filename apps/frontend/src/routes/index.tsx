import { createBrowserRouter, Outlet } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { lazy, Suspense } from 'react'
import LandingPage from '@/pages/LandingPage'
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
const ComptabiliteReglementairePage = lazy(() => import('@/pages/ComptabiliteReglementairePage'))
const ExtranetLayout = lazy(() => import('@/pages/extranet/ExtranetLayout'))
const ExtranetDashboardPage = lazy(() => import('@/pages/extranet/ExtranetDashboardPage'))
const ExtranetProfilPage = lazy(() => import('@/pages/extranet/ExtranetProfilPage'))
const ExtranetDocumentsPage = lazy(() => import('@/pages/extranet/ExtranetDocumentsPage'))
const ExtranetComptePage = lazy(() => import('@/pages/extranet/ExtranetComptePage'))
const ExtranetChargesPage = lazy(() => import('@/pages/extranet/ExtranetChargesPage'))
const ExtranetAppelsFondsPage = lazy(() => import('@/pages/extranet/ExtranetAppelsFondsPage'))
const ExtranetFondsTravauPage = lazy(() => import('@/pages/extranet/ExtranetFondsTravauPage'))
const ExtranetConseilPage = lazy(() => import('@/pages/extranet/ExtranetConseilPage'))
const ExportsPage = lazy(() => import('@/pages/ExportsPage'))
const ProfilPage = lazy(() => import('@/pages/ProfilPage'))
const DonneesPersonnellesPage = lazy(
  () => import('@/pages/DonneesPersonnellesPage')
)
const PolitiqueConfidentialitePage = lazy(
  () => import('@/pages/PolitiqueConfidentialitePage')
)
const VsTraditionnelsPage = lazy(() => import('@/pages/VsTraditionnelsPage'))
const CalculateurTantiemesPage = lazy(
  () => import('@/pages/CalculateurTantiemesPage')
)
const ResolutionAgPage = lazy(() => import('@/pages/ResolutionAgPage'))
const DemarragePage = lazy(() => import('@/pages/DemarragePage'))
const RepriseGestionPage = lazy(() => import('@/pages/RepriseGestionPage'))
const SecuritePage = lazy(() => import('@/pages/SecuritePage'))
const MentionsLegalesPage = lazy(
  () => import('@/pages/MentionsLegalesPage')
)
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'))
const FirstLoginPage = lazy(() => import('@/pages/FirstLoginPage'))
const UserManagementPage = lazy(() => import('@/pages/UserManagementPage'))
const TicketsPage = lazy(() => import('@/pages/TicketsPage'))
const SubscriptionPage = lazy(() => import('@/pages/SubscriptionPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="size-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
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

export const router = createBrowserRouter([
  // Landing page (public, default route) — eager-loaded so the SEO entrypoint
  // renders without waiting for a chunk fetch.
  {
    path: '/',
    element: <LandingPage />,
  },

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
  {
    path: '/politique-confidentialite',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PolitiqueConfidentialitePage />
      </Suspense>
    ),
  },
  {
    path: '/vs/logiciels-traditionnels',
    element: (
      <Suspense fallback={<PageLoader />}>
        <VsTraditionnelsPage />
      </Suspense>
    ),
  },
  {
    path: '/securite',
    element: (
      <Suspense fallback={<PageLoader />}>
        <SecuritePage />
      </Suspense>
    ),
  },
  {
    path: '/calculateurs/repartition-tantiemes',
    element: (
      <Suspense fallback={<PageLoader />}>
        <CalculateurTantiemesPage />
      </Suspense>
    ),
  },
  {
    path: '/outils/resolution-ag',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResolutionAgPage />
      </Suspense>
    ),
  },
  {
    path: '/mentions-legales',
    element: (
      <Suspense fallback={<PageLoader />}>
        <MentionsLegalesPage />
      </Suspense>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <ForgotPasswordPage />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <Suspense fallback={<PageLoader />}>
        <VerifyEmailPage />
      </Suspense>
    ),
  },
  {
    path: '/first-login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <FirstLoginPage />
      </Suspense>
    ),
  },

  // Authenticated routes
  {
    element: <AuthenticatedLayout />,
    children: [
      {
        path: '/dashboard',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <DashboardPage />
          </RoleGuard>
        ),
      },
      {
        path: '/demarrage',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <Suspense fallback={<PageLoader />}>
              <DemarragePage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/reprise-gestion',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <Suspense fallback={<PageLoader />}>
              <RepriseGestionPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '/coproprietes',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <CoproprietesPage />
          </RoleGuard>
        ),
      },
      {
        path: '/coproprietes/:id',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <CoproprieteDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: '/coproprietaires',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <CoproprietairesPage />
          </RoleGuard>
        ),
      },
      {
        path: '/charges',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <ChargesPage />
          </RoleGuard>
        ),
      },
      {
        path: '/assemblees',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <AssembleesPage />
          </RoleGuard>
        ),
      },
      {
        path: '/assemblees/:id',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <AssembleeDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: '/travaux',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <TravauxPage />
          </RoleGuard>
        ),
      },
      {
        path: '/documents',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <DocumentsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/fiche-synthetique',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <FicheSynthetiquePage />
          </RoleGuard>
        ),
      },
      {
        path: '/comptes-bancaires',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <ComptesBancairesPage />
          </RoleGuard>
        ),
      },
      {
        path: '/conseil-syndical',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <ConseilSyndicalPage />
          </RoleGuard>
        ),
      },
      {
        path: '/contrats',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <ContratsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/assurances',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <AssurancesPage />
          </RoleGuard>
        ),
      },
      {
        path: '/contentieux',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <ContentieuxPage />
          </RoleGuard>
        ),
      },
      {
        path: '/employes',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <EmployesPage />
          </RoleGuard>
        ),
      },
      {
        path: '/reglements',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <ReglementsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/immatriculation',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <ImmatriculationPage />
          </RoleGuard>
        ),
      },
      {
        path: '/contrats-syndic',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <ContratsSyndicPage />
          </RoleGuard>
        ),
      },
      {
        path: '/notifications',
        element: <NotificationsPage />,
      },
      {
        path: '/profil',
        element: <ProfilPage />,
      },
      {
        path: '/donnees-personnelles',
        element: <DonneesPersonnellesPage />,
      },
      {
        path: '/comptabilite-reglementaire',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <ComptabiliteReglementairePage />
          </RoleGuard>
        ),
      },
      {
        path: '/extranet',
        element: (
          <RoleGuard allowedRoles={['coproprietaire']}>
            <ExtranetLayout />
          </RoleGuard>
        ),
        children: [
          { index: true, element: <ExtranetDashboardPage /> },
          { path: 'profil', element: <ExtranetProfilPage /> },
          { path: 'documents', element: <ExtranetDocumentsPage /> },
          { path: 'compte', element: <ExtranetComptePage /> },
          { path: 'charges', element: <ExtranetChargesPage /> },
          { path: 'appels-fonds', element: <ExtranetAppelsFondsPage /> },
          { path: 'fonds-travaux', element: <ExtranetFondsTravauPage /> },
          { path: 'conseil-syndical', element: <ExtranetConseilPage /> },
        ],
      },
      {
        path: '/gestion-utilisateurs',
        element: (
          <RoleGuard allowedRoles={['syndic']}>
            <UserManagementPage />
          </RoleGuard>
        ),
      },
      {
        path: '/tickets',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <TicketsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/exports',
        element: (
          <RoleGuard allowedRoles={['user', 'syndic']}>
            <ExportsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/subscription',
        element: <SubscriptionPage />,
      },
      {
        path: '/subscription/success',
        element: <SubscriptionPage />,
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
