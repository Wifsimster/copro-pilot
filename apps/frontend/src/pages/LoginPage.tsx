import { useAuthStore } from '@/store/authStore'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
  const { login, isLoading } = useAuthStore()

  const handleLogin = async () => {
    await login('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-800">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ImmoIA
          </h1>
          <p className="text-center text-gray-500 dark:text-zinc-400">
            Plateforme de gestion de copropriété
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter avec Microsoft'}
        </button>
      </div>
    </div>
  )
}
