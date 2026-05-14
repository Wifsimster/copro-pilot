import { useState } from 'react'
import {
  Building2,
  ArrowLeft,
  Loader2,
  Mail,
  KeyRound,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { OTPInput } from '@/components/auth/OTPInput'
import {
  PasswordInput,
  PasswordStrength,
} from '@/components/auth/PasswordInput'
import { validatePassword } from '@/utils/passwordValidation'
import { userManagementApi } from '@/api/userManagement'

type Step = 'email' | 'otp' | 'password'

export default function FirstLoginPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      })
      if (result.error) {
        setError(
          result.error.message ||
            "Erreur lors de l'envoi du code"
        )
      } else {
        setStep('otp')
      }
    } catch {
      setError("Erreur lors de l'envoi du code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await authClient.signIn.emailOtp({
        email,
        otp,
      })
      if (result.error) {
        setError(
          result.error.message || 'Code incorrect ou expiré'
        )
      } else {
        // Check if user needs to change password
        const session = await authClient.getSession()
        const user = session?.data?.user as any
        if (user?.mustChangePassword) {
          setStep('password')
        } else {
          // Already has a password, redirect to extranet
          window.location.href = '/extranet'
        }
      }
    } catch {
      setError('Erreur de vérification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    const validation = validatePassword(password, { email })
    if (!validation.valid) {
      setError(validation.errors.join('. '))
      return
    }

    setIsLoading(true)

    try {
      await userManagementApi.setInitialPassword(password)
      window.location.href = '/extranet'
    } catch {
      setError(
        'Erreur lors de la définition du mot de passe'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {(['email', 'otp', 'password'] as Step[]).map(
        (s, i) => (
          <div
            key={s}
            className={`flex items-center gap-2 ${
              i > 0 ? '' : ''
            }`}
          >
            {i > 0 && (
              <div
                className={`w-8 h-0.5 ${
                  step === s ||
                  (['otp', 'password'].indexOf(step) >=
                    ['otp', 'password'].indexOf(s) &&
                    s !== 'email')
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            )}
            <div
              className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : ['otp', 'password'].indexOf(step) >
                      ['otp', 'password'].indexOf(s)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
          </div>
        )
      )}
    </div>
  )

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
          <p className="text-sm text-muted-foreground">
            Première connexion copropriétaire
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
          {stepIndicator}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form
              onSubmit={handleSendOTP}
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
                  onChange={e => setEmail(e.target.value)}
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
                    Envoi...
                  </>
                ) : (
                  'Envoyer le code'
                )}
              </Button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form
              onSubmit={handleVerifyOTP}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <KeyRound className="size-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  Code de vérification
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Un code à 6 chiffres a été envoyé à{' '}
                <strong>{email}</strong>. Il est valable 15
                minutes.
              </p>

              <OTPInput
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
              />

              {error && (
                <p className="text-sm text-destructive text-center">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-10"
                disabled={isLoading || otp.length < 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  'Vérifier'
                )}
              </Button>

              <button
                type="button"
                className="w-full text-sm text-primary hover:underline"
                onClick={() => {
                  setOtp('')
                  setError('')
                  handleSendOTP(
                    new Event('submit') as unknown as React.FormEvent
                  )
                }}
                disabled={isLoading}
              >
                Renvoyer le code
              </button>
            </form>
          )}

          {/* Step 3: Set Password */}
          {step === 'password' && (
            <form
              onSubmit={handleSetPassword}
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
                  onChange={e => setPassword(e.target.value)}
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
                  onChange={e => setConfirm(e.target.value)}
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
                    Enregistrement...
                  </>
                ) : (
                  'Valider et accéder à mon espace'
                )}
              </Button>
            </form>
          )}

          <div className="text-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="size-4" />
              Retour à la connexion
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
