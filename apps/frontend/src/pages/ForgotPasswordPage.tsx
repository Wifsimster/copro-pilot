import { useState } from 'react'
import { Building2, ArrowLeft, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await authClient.emailOtp.requestPasswordReset({
        email,
      })
      setSent(true)
    } catch {
      // Always show success to prevent email enumeration
      setSent(true)
    } finally {
      setIsLoading(false)
    }
  }

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

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                <Mail className="size-7" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Email envoyé
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Si un compte existe avec l&apos;adresse{' '}
                  <strong>{email}</strong>, un lien de
                  réinitialisation a été envoyé. Vérifiez votre
                  boîte de réception.
                </p>
              </div>
              <a
                href="/#/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-2"
              >
                <ArrowLeft className="size-4" />
                Retour à la connexion
              </a>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Mot de passe oublié
                </h2>
                <p className="text-sm text-muted-foreground">
                  Entrez votre adresse email. Si un compte existe,
                  vous recevrez un lien pour réinitialiser votre mot
                  de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full h-10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    'Envoyer le lien'
                  )}
                </Button>
              </form>

              <div className="text-center">
                <a
                  href="/#/login"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="size-4" />
                  Retour à la connexion
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
