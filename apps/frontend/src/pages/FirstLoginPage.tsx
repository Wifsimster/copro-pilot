import { useState } from 'react'
import { Building2, ArrowLeft } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { validatePassword } from '@/utils/passwordValidation'
import { userManagementApi } from '@/api/userManagement'
import { FirstLoginEmailStep } from '@/components/auth/FirstLoginEmailStep'
import { FirstLoginOtpStep } from '@/components/auth/FirstLoginOtpStep'
import { FirstLoginPasswordStep } from '@/components/auth/FirstLoginPasswordStep'

type Step = 'email' | 'otp' | 'password'

export default function FirstLoginPage() {
  const [ui, setUi] = useState<{
    step: Step
    email: string
    otp: string
    password: string
    confirm: string
    isLoading: boolean
    error: string
  }>({
    step: 'email',
    email: '',
    otp: '',
    password: '',
    confirm: '',
    isLoading: false,
    error: '',
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { step, email, otp, password, confirm, isLoading, error } = ui

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    patchUi({ error: '' })
    patchUi({ isLoading: true })

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      })
      if (result.error) {
        patchUi({ error: result.error.message ||
            "Erreur lors de l'envoi du code" })
      } else {
        patchUi({ step: 'otp' })
      }
    } catch {
      patchUi({ error: "Erreur lors de l'envoi du code" })
    } finally {
      patchUi({ isLoading: false })
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    patchUi({ error: '' })
    patchUi({ isLoading: true })

    try {
      const result = await authClient.signIn.emailOtp({
        email,
        otp,
      })
      if (result.error) {
        patchUi({ error: result.error.message || 'Code incorrect ou expiré' })
      } else {
        // Check if user needs to change password
        const session = await authClient.getSession()
        const user = session?.data?.user as any
        if (user?.mustChangePassword) {
          patchUi({ step: 'password' })
        } else {
          // Already has a password, redirect to extranet
          window.location.href = '/extranet'
        }
      }
    } catch {
      patchUi({ error: 'Erreur de vérification' })
    } finally {
      patchUi({ isLoading: false })
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    patchUi({ error: '' })

    if (password !== confirm) {
      patchUi({ error: 'Les mots de passe ne correspondent pas' })
      return
    }

    const validation = validatePassword(password, { email })
    if (!validation.valid) {
      patchUi({ error: validation.errors.join('. ') })
      return
    }

    patchUi({ isLoading: true })

    try {
      await userManagementApi.setInitialPassword(password)
      window.location.href = '/extranet'
    } catch {
      patchUi({ error: 'Erreur lors de la définition du mot de passe' })
    } finally {
      patchUi({ isLoading: false })
    }
  }

  const handleResendOTP = () => {
    patchUi({ otp: '' })
    patchUi({ error: '' })
    handleSendOTP(
      new Event('submit') as unknown as React.FormEvent
    )
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
            <FirstLoginEmailStep
              email={email}
              error={error}
              isLoading={isLoading}
              onEmailChange={value => patchUi({ email: value })}
              onSubmit={handleSendOTP}
            />
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <FirstLoginOtpStep
              email={email}
              otp={otp}
              error={error}
              isLoading={isLoading}
              onOtpChange={value => patchUi({ otp: value })}
              onSubmit={handleVerifyOTP}
              onResend={handleResendOTP}
            />
          )}

          {/* Step 3: Set Password */}
          {step === 'password' && (
            <FirstLoginPasswordStep
              email={email}
              password={password}
              confirm={confirm}
              error={error}
              isLoading={isLoading}
              onPasswordChange={value => patchUi({ password: value })}
              onConfirmChange={value => patchUi({ confirm: value })}
              onSubmit={handleSetPassword}
            />
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
