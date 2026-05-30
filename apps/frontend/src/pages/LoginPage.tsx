import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Building2, Moon, Sun, CreditCard } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Toggle } from '@/components/ui/toggle'
import { validatePassword } from '@/utils/passwordValidation'
import LoginBrandingPanel from '@/components/auth/LoginBrandingPanel'
import SignInForm from '@/components/auth/SignInForm'
import SignUpForm from '@/components/auth/SignUpForm'

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            data-slot="theme-toggle"
            variant="outline"
            size="sm"
            pressed={isDark}
            onPressedChange={toggle}
            aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isDark ? 'Mode clair' : 'Mode sombre'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const PAID_PLANS: Record<string, { label: string; price: string }> = {
  essentiel: { label: 'Essentiel', price: '19 €/mois' },
  pro: { label: 'Pro', price: '49 €/mois' },
  entreprise: { label: 'Entreprise', price: '99 €+/mois' },
}

function PlanBanner({ plan }: { plan: string }) {
  const info = PAID_PLANS[plan]
  if (!info) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 p-3">
      <CreditCard className="size-5 text-primary shrink-0" />
      <div className="text-sm">
        <span className="text-foreground">
          Vous avez choisi le plan{' '}
          <strong>{info.label}</strong>
        </span>
        <span className="text-muted-foreground">
          {' '}({info.price})
        </span>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { signIn, signUp, isLoading } = useAuthStore()

  const [ui, setUi] = useState<{
    signInEmail: string
    signInPassword: string
    signInError: string
    signUpName: string
    signUpEmail: string
    signUpPassword: string
    signUpConfirm: string
    signUpError: string
    signUpSuccess: boolean
    consentAccepted: boolean
  }>({
    signInEmail: '',
    signInPassword: '',
    signInError: '',
    signUpName: '',
    signUpEmail: '',
    signUpPassword: '',
    signUpConfirm: '',
    signUpError: '',
    signUpSuccess: false,
    consentAccepted: false,
  })
  const patchUi = (p: Partial<typeof ui>) => setUi(s => ({ ...s, ...p }))
  const { signInEmail, signInPassword, signInError, signUpName, signUpEmail, signUpPassword, signUpConfirm, signUpError, signUpSuccess, consentAccepted } = ui


  // Detect ?plan= query param from landing page CTAs
  const params = new URLSearchParams(window.location.search)
  const selectedPlan = params.get('plan') || ''
  const hasPaidPlan = selectedPlan in PAID_PLANS

  // Store plan in sessionStorage for post-verification redirect
  useEffect(() => {
    if (hasPaidPlan) {
      sessionStorage.setItem('pending_plan', selectedPlan)
    }
  }, [hasPaidPlan, selectedPlan])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    patchUi({ signInError: '' })
    try {
      await signIn(signInEmail, signInPassword)
    } catch (error) {
      patchUi({ signInError: error instanceof Error ? error.message : 'Erreur de connexion' })
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    patchUi({ signUpError: '' })

    if (signUpPassword !== signUpConfirm) {
      patchUi({ signUpError: 'Les mots de passe ne correspondent pas' })
      return
    }

    const passwordCheck = validatePassword(signUpPassword, {
      email: signUpEmail,
    })
    if (!passwordCheck.valid) {
      patchUi({ signUpError: passwordCheck.errors.join('. ') })
      return
    }

    if (!consentAccepted) {
      patchUi({ signUpError: 'Vous devez accepter la politique de confidentialité pour vous inscrire' })
      return
    }

    try {
      await signUp(signUpName, signUpEmail, signUpPassword)
      patchUi({ signUpSuccess: true })
    } catch (error) {
      patchUi({ signUpError: error instanceof Error ? error.message : "Erreur lors de l'inscription" })
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel — Branding */}
      <LoginBrandingPanel />

      {/* Right Panel — Forms */}
      <div className="relative flex flex-1 items-center justify-center bg-[#FAF8F5] dark:bg-stone-950 p-6 sm:p-10">
        {/* Theme toggle — top right */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[440px] space-y-6">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Building2 className="size-7" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">CoproPilot</h1>
          </div>

          {/* Plan banner from landing page CTAs */}
          {hasPaidPlan && <PlanBanner plan={selectedPlan} />}

          {/* Card container */}
          <div className="rounded-2xl border border-border/60 bg-white dark:bg-stone-900 shadow-sm shadow-black/5 px-7 py-8 sm:px-9 sm:py-10">
            {/* Tabs — signin / signup */}
            <Tabs defaultValue={hasPaidPlan ? 'signup' : 'signin'} className="w-full space-y-7">
              {/* Header */}
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  Bienvenue
                </h2>
                <p className="text-sm text-muted-foreground">
                  {hasPaidPlan
                    ? 'Créez votre compte pour démarrer votre essai'
                    : 'Connectez-vous ou créez un compte pour continuer'}
                </p>
              </div>

              <TabsList className="w-full h-11">
                <TabsTrigger value="signin" className="flex-1 text-sm">Connexion</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1 text-sm">Inscription</TabsTrigger>
              </TabsList>

              {/* Sign In */}
              <TabsContent value="signin">
                <SignInForm
                  signInEmail={signInEmail}
                  signInPassword={signInPassword}
                  signInError={signInError}
                  isLoading={isLoading}
                  patchUi={patchUi}
                  onSubmit={handleSignIn}
                  signIn={signIn}
                />
              </TabsContent>

              {/* Sign Up */}
              <TabsContent value="signup">
                <SignUpForm
                  signUpName={signUpName}
                  signUpEmail={signUpEmail}
                  signUpPassword={signUpPassword}
                  signUpConfirm={signUpConfirm}
                  signUpError={signUpError}
                  signUpSuccess={signUpSuccess}
                  consentAccepted={consentAccepted}
                  isLoading={isLoading}
                  hasPaidPlan={hasPaidPlan}
                  selectedPlanLabel={PAID_PLANS[selectedPlan]?.label}
                  patchUi={patchUi}
                  onSubmit={handleSignUp}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer note — outside the card */}
          <p className="text-center text-xs text-muted-foreground/70 leading-relaxed px-4">
            En continuant, vous acceptez les{' '}
            <a
              href="/politique-confidentialite"
              className="underline hover:text-foreground transition-colors"
            >
              conditions d&apos;utilisation et la politique de confidentialité
            </a>
            .
          </p>
          <p className="text-center text-xs text-muted-foreground/40 lg:hidden">
            v{__APP_VERSION__}
          </p>
        </div>
      </div>
    </div>
  )
}
