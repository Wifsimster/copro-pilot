import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FirstLoginEmailStepProps = {
  email: string
  error: string
  isLoading: boolean
  onEmailChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function FirstLoginEmailStep({
  email,
  error,
  isLoading,
  onEmailChange,
  onSubmit,
}: FirstLoginEmailStepProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <Mail className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">
          Votre adresse email
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Saisissez l&apos;adresse email communiquée par
        votre syndic. Un code de vérification vous sera
        envoyé.
      </p>

      <div className="space-y-2">
        <Label htmlFor="email">Adresse email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          placeholder="vous@exemple.com"
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
            Envoi…
          </>
        ) : (
          'Envoyer le code'
        )}
      </Button>
    </form>
  )
}
