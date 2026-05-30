import { Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  PasswordInput,
  PasswordStrength,
} from '@/components/auth/PasswordInput'

type FirstLoginPasswordStepProps = {
  email: string
  password: string
  confirm: string
  error: string
  isLoading: boolean
  onPasswordChange: (value: string) => void
  onConfirmChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function FirstLoginPasswordStep({
  email,
  password,
  confirm,
  error,
  isLoading,
  onPasswordChange,
  onConfirmChange,
  onSubmit,
}: FirstLoginPasswordStepProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <Lock className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">
          Définir votre mot de passe
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Choisissez un mot de passe sécurisé d&apos;au
        moins 12 caractères pour accéder à votre
        espace.
      </p>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <PasswordInput
          id="password"
          value={password}
          onChange={e => onPasswordChange(e.target.value)}
          minLength={12}
          autoComplete="new-password"
        />
        <PasswordStrength
          password={password}
          email={email}
          showErrors
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirmer</Label>
        <PasswordInput
          id="confirm"
          value={confirm}
          onChange={e => onConfirmChange(e.target.value)}
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
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Enregistrement…
          </>
        ) : (
          'Valider et accéder à mon espace'
        )}
      </Button>
    </form>
  )
}
