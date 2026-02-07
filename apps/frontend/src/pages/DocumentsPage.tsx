import { FolderOpen } from 'lucide-react'

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
        <p className="text-gray-500 dark:text-zinc-400">Gestion des documents de copropriete</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-16 dark:border-zinc-600">
        <FolderOpen className="h-16 w-16 text-gray-300 dark:text-zinc-600" />
        <h3 className="mt-6 text-lg font-medium text-gray-900 dark:text-white">Module en cours de developpement</h3>
        <p className="mt-2 max-w-md text-center text-gray-500 dark:text-zinc-400">
          La gestion documentaire (PV d'AG, contrats, factures, etc.) sera disponible prochainement.
        </p>
      </div>
    </div>
  )
}
