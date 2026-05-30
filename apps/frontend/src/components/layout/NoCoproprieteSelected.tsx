import { Building2 } from 'lucide-react'

interface NoCoproprieteSelectedProps {
  message?: string
}

export function NoCoproprieteSelected({
  message = 'Selectionnez une copropriete dans le menu lateral.',
}: NoCoproprieteSelectedProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
      <Building2 className="size-12 text-stone-400 dark:text-stone-500" />
      <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
        Aucune copropriete selectionnee
      </h3>
      <p className="mt-2 text-stone-500 dark:text-stone-400">
        {message}
      </p>
    </div>
  )
}
