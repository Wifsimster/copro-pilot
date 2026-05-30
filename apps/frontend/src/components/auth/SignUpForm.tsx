import { AlertCircle, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  PasswordInput,
  PasswordStrength,
} from '@/components/auth/PasswordInput'

interface SignUpFormProps {
  signUpName: string
  signUpEmail: string
  signUpPassword: string
  signUpConfirm: string
  signUpError: string
  signUpSuccess: boolean
  consentAccepted: boolean
  isLoading: boolean
  hasPaidPlan: boolean
  selectedPlanLabel?: string
  patchUi: (p: {
    signUpName?: string
    signUpEmail?: string
    signUpPassword?: string
    signUpConfirm?: string
    signUpError?: string
    signUpSuccess?: boolean
    consentAccepted?: boolean
  }) => void
  onSubmit: (e: React.FormEvent) => void
}

export default function SignUpForm({
  signUpName,
  signUpEmail,
  signUpPassword,
  signUpConfirm,
  signUpError,
  signUpSuccess,
  consentAccepted,
  isLoading,
  hasPaidPlan,
  selectedPlanLabel,
  patchUi,
  onSubmit,
}: SignUpFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {signUpSuccess ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            <Check className="size-7" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Compte créé avec succès !</p>
            <p className="text-sm text-muted-foreground mt-1">
              Un email de vérification a été envoyé à votre adresse. Veuillez cliquer sur le lien pour activer votre compte.
            </p>
            {hasPaidPlan && (
              <p className="text-sm text-primary mt-2">
                Après vérification, vous serez redirigé vers le paiement pour le plan {selectedPlanLabel}.
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="signup-name">Nom complet</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Jean Dupont"
                value={signUpName}
                onChange={(e) => patchUi({ signUpName: e.target.value })}
                required
                autoComplete="name"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-email">Adresse email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="vous@exemple.com"
                value={signUpEmail}
                onChange={(e) => patchUi({ signUpEmail: e.target.value })}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>
          </div>

          <div className="h-px bg-border/60" />

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="signup-password">Mot de passe</Label>
              <PasswordInput
                id="signup-password"
                value={signUpPassword}
                onChange={(e) => patchUi({ signUpPassword: e.target.value })}
                minLength={12}
                autoComplete="new-password"
              />
              <PasswordStrength
                password={signUpPassword}
                email={signUpEmail}
                showErrors
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
              <PasswordInput
                id="signup-confirm"
                value={signUpConfirm}
                onChange={(e) => patchUi({ signUpConfirm: e.target.value })}
                minLength={12}
                autoComplete="new-password"
              />
              {signUpConfirm && signUpPassword !== signUpConfirm && (
                <p className="text-xs text-destructive">
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-muted/50 dark:bg-muted/20 p-3.5">
            <Checkbox
              id="consent"
              checked={consentAccepted}
              onCheckedChange={(checked) =>
                patchUi({ consentAccepted: checked === true })
              }
              className="mt-0.5"
            />
            <label
              htmlFor="consent"
              className="text-xs leading-relaxed text-muted-foreground cursor-pointer select-none"
            >
              J&apos;accepte la{' '}
              <a
                href="/politique-confidentialite"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary hover:text-primary/80"
              >
                politique de confidentialité
              </a>{' '}
              et le traitement de mes données personnelles
              conformément au RGPD.
            </label>
          </div>

          {signUpError && (
            <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{signUpError}</span>
            </div>
          )}

          <div className="pt-1">
            <Button type="submit" className="w-full h-11 text-sm font-medium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Inscription…
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </div>
        </>
      )}
    </form>
  )
}
