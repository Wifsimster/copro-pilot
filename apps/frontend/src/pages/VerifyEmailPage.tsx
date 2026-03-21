import { useState, useEffect } from 'react'
import {
  Building2,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  CreditCard,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'

const PLAN_LABELS: Record<string, string> = {
  essentiel: 'Essentiel',
  pro: 'Pro',
  entreprise: 'Entreprise',
}

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading')
  const [error, setError] = useState('')

  const pendingPlan = sessionStorage.getItem('pending_plan') || ''
  const hasPendingPlan = pendingPlan in PLAN_LABELS

  const params = new URLSearchParams(
    window.location.hash.split('?')[1] || ''
  )
  const token = params.get('token') || ''

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Lien de vérification invalide ou manquant')
      return
    }

    authClient
      .verifyEmail({ query: { token } })
      .then(result => {
        if (result.error) {
          setStatus('error')
          setError(
            result.error.message ||
              'La vérification a échoué'
          )
        } else {
          setStatus('success')
        }
      })
      .catch(() => {
        setStatus('error')
        setError(
          'Erreur lors de la vérification. Le lien est peut-être expiré.'
        )
      })
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 dark:bg-background p-6">
      <div className="w-full max-w-[420px] space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Building2 className="size-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            CoproPilot
          </h1>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="size-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Vérification de votre adresse email...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <CheckCircle className="size-7" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Email vérifié
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {hasPendingPlan
                      ? `Votre email est vérifié. Connectez-vous pour activer votre plan ${PLAN_LABELS[pendingPlan]}.`
                      : 'Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter.'}
                  </p>
                </div>
                <a
                  href="/#/login"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-2"
                >
                  {hasPendingPlan ? (
                    <>
                      <CreditCard className="size-4" />
                      Se connecter et activer le plan {PLAN_LABELS[pendingPlan]}
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="size-4" />
                      Se connecter
                    </>
                  )}
                </a>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex size-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <XCircle className="size-7" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Erreur de vérification
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error}
                  </p>
                </div>
                <a
                  href="/#/login"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-2"
                >
                  <ArrowLeft className="size-4" />
                  Retour à la connexion
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
