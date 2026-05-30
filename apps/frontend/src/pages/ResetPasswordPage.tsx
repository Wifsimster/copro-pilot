import { useState } from 'react'
import { Building2, ArrowLeft, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import {
  PasswordInput,
  PasswordStrength,
} from '@/components/auth/PasswordInput'
import { validatePassword } from '@/utils/passwordValidation'

export default function ResetPasswordPage() {
  const [ui, setUi] = useState<{
    password: string
    confirm: string
    isLoading: boolean
    error: string
    success: boolean
  }>({
    password: '',
    confirm: '',
    isLoading: false,
    error: '',
    success: false,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { password, confirm, isLoading, error, success } = ui

  // Extract token from URL query params
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    patchUi({ error: '' })

    if (password !== confirm) {
      patchUi({ error: 'Les mots de passe ne correspondent pas' })
      return
    }

    const validation = validatePassword(password)
    if (!validation.valid) {
      patchUi({ error: validation.errors.join('. ') })
      return
    }

    if (!token) {
      patchUi({ error: 'Lien de réinitialisation invalide ou expiré' })
      return
    }

    patchUi({ isLoading: true })

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      })
      if (result.error) {
        patchUi({ error: result.error.message ||
            'Erreur lors de la réinitialisation' })
      } else {
        patchUi({ success: true })
      }
    } catch {
      patchUi({ error: 'Erreur lors de la réinitialisation du mot de passe' })
    } finally {
      patchUi({ isLoading: false })
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
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <Check className="size-7" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Mot de passe modifié
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Votre mot de passe a été réinitialisé avec
                  succès. Vous pouvez maintenant vous connecter.
                </p>
              </div>
              <a
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-2"
              >
                <ArrowLeft className="size-4" />
                Se connecter
              </a>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Nouveau mot de passe
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choisissez un mot de passe sécurisé d&apos;au
                  moins 12 caractères.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Nouveau mot de passe
                  </Label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={e => patchUi({ password: e.target.value })}
                    minLength={12}
                    autoComplete="new-password"
                  />
                  <PasswordStrength
                    password={password}
                    showErrors
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">
                    Confirmer le mot de passe
                  </Label>
                  <PasswordInput
                    id="confirm"
                    value={confirm}
                    onChange={e => patchUi({ confirm: e.target.value })}
                    minLength={12}
                    autoComplete="new-password"
                  />
                  {confirm && password !== confirm && (
                    <p className="text-xs text-destructive">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full h-10"
                  disabled={isLoading || !token}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Réinitialisation…
                    </>
                  ) : (
                    'Réinitialiser le mot de passe'
                  )}
                </Button>
              </form>

              <div className="text-center">
                <a
                  href="/login"
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
