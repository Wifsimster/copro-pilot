import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-stone-300 dark:text-stone-600">404</h1>
      <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
        Page non trouvée
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-emerald-700 px-4 py-2 text-white transition-colors hover:bg-emerald-800"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}
