import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-zinc-600">404</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-zinc-400">
        Page non trouvée
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      >
        Retour au tableau de bord
      </Link>
    </div>
  )
}
