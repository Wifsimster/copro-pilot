import { AlertCircle, Loader2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/auth/PasswordInput'

interface SignInFormProps {
  signInEmail: string
  signInPassword: string
  signInError: string
  isLoading: boolean
  patchUi: (p: {
    signInEmail?: string
    signInPassword?: string
    signInError?: string
  }) => void
  onSubmit: (e: React.FormEvent) => void
  signIn: (email: string, password: string) => Promise<void>
}

export default function SignInForm({
  signInEmail,
  signInPassword,
  signInError,
  isLoading,
  patchUi,
  onSubmit,
  signIn,
}: SignInFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="signin-email">Adresse email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="vous@exemple.com"
          value={signInEmail}
          onChange={(e) => patchUi({ signInEmail: e.target.value })}
          required
          autoComplete="email"
          className="h-11"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password">Mot de passe</Label>
          <a
            href="/forgot-password"
            className="text-xs text-primary hover:underline"
          >
            Mot de passe oublié ?
          </a>
        </div>
        <PasswordInput
          id="signin-password"
          value={signInPassword}
          onChange={(e) => patchUi({ signInPassword: e.target.value })}
          autoComplete="current-password"
        />
      </div>

      {signInError && (
        <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>{signInError}</span>
        </div>
      )}

      <div className="pt-1">
        <Button type="submit" className="w-full h-11 text-sm font-medium" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Connexion…
            </>
          ) : (
            'Se connecter'
          )}
        </Button>
      </div>

      {/* Demo access */}
      <div className="relative pt-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-stone-900 px-3 text-muted-foreground">
            Accès démo
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-11"
          disabled={isLoading}
          onClick={() => {
            patchUi({ signInError: '' })
            signIn('syndic@copropilot.local', 'syndic').catch(err => {
              patchUi({ signInError: err instanceof Error ? err.message : 'Erreur de connexion' })
            })
          }}
        >
          <Play className="size-3.5" />
          Syndic
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-11"
          disabled={isLoading}
          onClick={() => {
            patchUi({ signInError: '' })
            signIn('copro@copropilot.local', 'copro').catch(err => {
              patchUi({ signInError: err instanceof Error ? err.message : 'Erreur de connexion' })
            })
          }}
        >
          <Play className="size-3.5" />
          Copropriétaire
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground pt-1">
        <a
          href="/first-login"
          className="text-primary hover:underline"
        >
          Première connexion (copropriétaire) ?
        </a>
      </p>
    </form>
  )
}
