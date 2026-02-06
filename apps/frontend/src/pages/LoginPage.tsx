import { useState, useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Building2, Eye, EyeOff, AlertCircle, Loader2, Shield, KeyRound, Users, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  )
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete,
  minLength,
}: {
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  autoComplete?: string
  minLength?: number
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className="pr-10"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return { score: 1, label: 'Faible', color: 'bg-red-500' }
    if (score <= 2) return { score: 2, label: 'Moyen', color: 'bg-orange-500' }
    if (score <= 3) return { score: 3, label: 'Bon', color: 'bg-yellow-500' }
    if (score <= 4) return { score: 4, label: 'Fort', color: 'bg-green-500' }
    return { score: 5, label: 'Excellent', color: 'bg-emerald-500' }
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= strength.score ? strength.color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Force : <span className="font-medium">{strength.label}</span>
      </p>
    </div>
  )
}

const features = [
  { icon: Shield, title: 'Sécurisé', desc: 'Données chiffrées et protégées' },
  { icon: BarChart3, title: 'Comptabilité', desc: 'Budgets, appels de fonds, paiements' },
  { icon: Users, title: 'Assemblées', desc: 'Gestion des AG et résolutions' },
  { icon: KeyRound, title: 'Multi-accès', desc: 'Syndics, copropriétaires, locataires' },
]

export default function LoginPage() {
  const { login, signIn, signUp, isLoading } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')

  const [signInEmail, setSignInEmail] = useState('admin@immo-ia.local')
  const [signInPassword, setSignInPassword] = useState('admin')
  const [signInError, setSignInError] = useState('')

  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpConfirm, setSignUpConfirm] = useState('')
  const [signUpError, setSignUpError] = useState('')
  const [signUpSuccess, setSignUpSuccess] = useState(false)

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

    if (signUpPassword.length < 8) {
      setSignUpError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    try {
      await signUp(signUpName, signUpEmail, signUpPassword)
      setSignUpSuccess(true)
    } catch (error) {
      setSignUpError(error instanceof Error ? error.message : "Erreur lors de l'inscription")
    }
  }

  const handleMicrosoftLogin = async () => {
    await login('/')
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white flex-col justify-between p-10">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-32 size-[500px] rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/3 size-64 rounded-full bg-white/[0.03]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ImmoIA</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">Plateforme de gestion de copropriété</p>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl font-bold leading-tight">
            Simplifiez la gestion <br />de vos copropriétés
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-white/10 backdrop-blur-sm p-4 space-y-2 border border-white/10"
              >
                <f.icon className="size-5 text-blue-200" />
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-xs text-blue-200/80 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-blue-300/60">
          &copy; {new Date().getFullYear()} ImmoIA. Tous droits réservés.
        </p>
      </div>

      {/* Right Panel — Forms */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-zinc-950 dark:to-zinc-900 p-6 sm:p-10">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/25">
              <Building2 className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ImmoIA</h1>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'signin' ? 'Bon retour !' : 'Créer un compte'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'signin'
                ? 'Connectez-vous pour accéder à votre espace'
                : 'Remplissez le formulaire pour commencer'}
            </p>
          </div>

          {/* Tab Switch */}
          <div className="flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                activeTab === 'signin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                activeTab === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
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
                </div>
                <PasswordInput
                  id="signin-password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {signInError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 text-sm text-red-700 dark:text-red-400">
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
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5">
              {signUpSuccess ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Compte créé avec succès !</p>
                    <p className="text-sm text-muted-foreground mt-1">Vous êtes maintenant connecté.</p>
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
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <PasswordStrength password={signUpPassword} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
                    <PasswordInput
                      id="signup-confirm"
                      value={signUpConfirm}
                      onChange={(e) => setSignUpConfirm(e.target.value)}
                      minLength={8}
                      autoComplete="new-password"
                    />
                    {signUpConfirm && signUpPassword !== signUpConfirm && (
                      <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>

                  {signUpError && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 text-sm text-red-700 dark:text-red-400">
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
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-zinc-950 dark:to-zinc-900 px-3 text-muted-foreground">
                ou continuer avec
              </span>
            </div>
          </div>

          {/* Microsoft SSO */}
          <Button
            variant="outline"
            className="w-full h-10 gap-3"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
          >
            <MicrosoftIcon className="size-4" />
            {isLoading ? 'Connexion...' : 'Microsoft'}
          </Button>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            En continuant, vous acceptez les conditions d&apos;utilisation et la politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  )
}
