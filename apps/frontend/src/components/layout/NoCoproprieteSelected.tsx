import { Building2 } from 'lucide-react'

interface NoCoproprieteSelectedProps {
  message?: string
}

export function NoCoproprieteSelected({
  message = 'Selectionnez une copropriete dans le menu lateral.',
}: NoCoproprieteSelectedProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12">
      <Building2 className="size-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium text-foreground">
        Aucune copropriete selectionnee
      </h3>
      <p className="mt-2 text-muted-foreground">
        {message}
      </p>
    </div>
  )
}
