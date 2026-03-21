import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  Building2,
  AlertCircle,
  Loader2,
  Shield,
  KeyRound,
  Users,
  BarChart3,
  Moon,
  Sun,
  Check,
  Play,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Toggle } from '@/components/ui/toggle'
import {
  PasswordInput,
  PasswordStrength,
} from '@/components/auth/PasswordInput'
import { validatePassword } from '@/utils/passwordValidation'

function ThemeToggle() {
  const [isDark, setIsDark] = useState(
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


const features = [
  { icon: Shield, title: 'Sécurisé', desc: 'Données chiffrées et protégées' },
  { icon: BarChart3, title: 'Comptabilité', desc: 'Budgets, appels de fonds, paiements' },
  { icon: Users, title: 'Assemblées', desc: 'Gestion des AG et résolutions' },
  { icon: KeyRound, title: 'Multi-accès', desc: 'Syndics, copropriétaires, locataires' },
]

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

  const [signInEmail, setSignInEmail] = useState('admin@copropilot.local')
  const [signInPassword, setSignInPassword] = useState('admin')
  const [signInError, setSignInError] = useState('')

  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpConfirm, setSignUpConfirm] = useState('')
  const [signUpError, setSignUpError] = useState('')
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const [consentAccepted, setConsentAccepted] = useState(false)

  // Detect ?plan= query param from landing page CTAs
  const params = new URLSearchParams(
    window.location.hash.split('?')[1] || ''
  )
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
    setSignInError('')
    try {
      await signIn(signInEmail, signInPassword)
    } catch (error) {
      setSignInError(error instanceof Error ? error.message : 'Erreur de connexion')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpError('')

    if (signUpPassword !== signUpConfirm) {
      setSignUpError('Les mots de passe ne correspondent pas')
      return
    }

    const passwordCheck = validatePassword(signUpPassword, {
      email: signUpEmail,
    })
    if (!passwordCheck.valid) {
      setSignUpError(passwordCheck.errors.join('. '))
      return
    }

    if (!consentAccepted) {
      setSignUpError('Vous devez accepter la politique de confidentialite pour vous inscrire')
      return
    }

    try {
      await signUp(signUpName, signUpEmail, signUpPassword)
      setSignUpSuccess(true)
    } catch (error) {
      setSignUpError(error instanceof Error ? error.message : "Erreur lors de l'inscription")
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative overflow-hidden bg-gradient-to-br from-primary via-primary/85 to-indigo-900 dark:from-primary/80 dark:via-primary/50 dark:to-slate-950 text-white flex-col justify-between p-10">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-white/5 dark:bg-white/[0.03]" />
        <div className="absolute -bottom-32 -right-32 size-[500px] rounded-full bg-white/5 dark:bg-white/[0.03]" />
        <div className="absolute top-1/2 left-1/3 size-64 rounded-full bg-white/[0.03] dark:bg-white/[0.02]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Building2 className="size-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">CoproPilot</span>
          </div>
          <p className="text-primary-foreground/70 text-sm mt-1">
            Plateforme de gestion de copropriété
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl font-bold leading-tight">
            Simplifiez la gestion <br />de vos copropriétés
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-sm p-4 space-y-2 border border-white/10 dark:border-white/[0.06]"
              >
                <f.icon className="size-5 text-primary-foreground/70" />
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-xs text-primary-foreground/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/40">
          &copy; {new Date().getFullYear()} CoproPilot. Tous droits réservés. &middot; v{__APP_VERSION__}
        </p>
      </div>

      {/* Right Panel — Forms */}
      <div className="relative flex flex-1 items-center justify-center bg-secondary/50 dark:bg-background p-6 sm:p-10">
        {/* Theme toggle — top right */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Building2 className="size-7" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">CoproPilot</h1>
          </div>

          {/* Plan banner from landing page CTAs */}
          {hasPaidPlan && <PlanBanner plan={selectedPlan} />}

          {/* Tabs — signin / signup */}
          <Tabs defaultValue={hasPaidPlan ? 'signup' : 'signin'} className="w-full space-y-6">
            {/* Header — changes with active tab via CSS */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Bienvenue
              </h2>
              <p className="text-sm text-muted-foreground">
                {hasPaidPlan
                  ? 'Créez votre compte pour démarrer votre essai'
                  : 'Connectez-vous ou créez un compte pour continuer'}
              </p>
            </div>

            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">Connexion</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Inscription</TabsTrigger>
            </TabsList>

            {/* Sign In */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Adresse email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <a
                      href="/#/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Mot de passe oublié ?
                    </a>
                  </div>
                  <PasswordInput
                    id="signin-password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                {signInError && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                    <AlertCircle className="size-4 mt-0.5 shrink-0" />
                    <span>{signInError}</span>
                  </div>
                )}

                <Button type="submit" className="w-full h-10" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                {/* Demo access */}
                <div className="relative mt-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">
                      Accès démo
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-10"
                    disabled={isLoading}
                    onClick={() => {
                      setSignInError('')
                      signIn('syndic@copropilot.local', 'syndic').catch(err => {
                        setSignInError(err instanceof Error ? err.message : 'Erreur de connexion')
                      })
                    }}
                  >
                    <Play className="size-3.5" />
                    Syndic
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-10"
                    disabled={isLoading}
                    onClick={() => {
                      setSignInError('')
                      signIn('copro@copropilot.local', 'copro').catch(err => {
                        setSignInError(err instanceof Error ? err.message : 'Erreur de connexion')
                      })
                    }}
                  >
                    <Play className="size-3.5" />
                    Copropriétaire
                  </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-2">
                  <a
                    href="/#/first-login"
                    className="text-primary hover:underline"
                  >
                    Première connexion (copropriétaire) ?
                  </a>
                </p>
              </form>
            </TabsContent>

            {/* Sign Up */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-5">
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
                          Après vérification, vous serez redirigé vers le paiement pour le plan {PAID_PLANS[selectedPlan]?.label}.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nom complet</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Jean Dupont"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Adresse email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="vous@exemple.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Mot de passe</Label>
                      <PasswordInput
                        id="signup-password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        minLength={12}
                        autoComplete="new-password"
                      />
                      <PasswordStrength
                        password={signUpPassword}
                        email={signUpEmail}
                        showErrors
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
                      <PasswordInput
                        id="signup-confirm"
                        value={signUpConfirm}
                        onChange={(e) => setSignUpConfirm(e.target.value)}
                        minLength={12}
                        autoComplete="new-password"
                      />
                      {signUpConfirm && signUpPassword !== signUpConfirm && (
                        <p className="text-xs text-destructive">
                          Les mots de passe ne correspondent pas
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="consent"
                        checked={consentAccepted}
                        onCheckedChange={(checked) =>
                          setConsentAccepted(checked === true)
                        }
                      />
                      <Label
                        htmlFor="consent"
                        className="text-xs leading-relaxed text-muted-foreground font-normal cursor-pointer"
                      >
                        J&apos;accepte la{' '}
                        <a
                          href="/#/politique-confidentialite"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-primary hover:text-primary/80"
                        >
                          politique de confidentialite
                        </a>{' '}
                        et le traitement de mes donnees personnelles
                        conformement au RGPD.
                      </Label>
                    </div>

                    {signUpError && (
                      <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                        <AlertCircle className="size-4 mt-0.5 shrink-0" />
                        <span>{signUpError}</span>
                      </div>
                    )}

                    <Button type="submit" className="w-full h-10" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Inscription...
                        </>
                      ) : (
                        "S'inscrire"
                      )}
                    </Button>
                  </>
                )}
              </form>
            </TabsContent>
          </Tabs>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            En continuant, vous acceptez les{' '}
            <a
              href="/#/politique-confidentialite"
              className="underline hover:text-foreground"
            >
              conditions d&apos;utilisation et la politique de confidentialite
            </a>
            .
          </p>
          <p className="text-center text-xs text-muted-foreground/60 lg:hidden">
            v{__APP_VERSION__}
          </p>
        </div>
      </div>
    </div>
  )
}
