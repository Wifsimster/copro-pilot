import { useOutletContext } from 'react-router-dom'
import { Download } from 'lucide-react'
import { documentsApi } from '@/api/documents'
import type { ExtranetProfil } from '@/types'

export interface ExtranetOutletContext {
  profil: ExtranetProfil
  currentCoproId: number | undefined
  isConseil: boolean
}

export function useExtranetContext() {
  return useOutletContext<ExtranetOutletContext>()
}

export function formatEur(
  n: number | string | null | undefined
): string {
  const val = typeof n === 'string' ? parseFloat(n) : n
  if (val === null || val === undefined || isNaN(val)) return '—'
  return val.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  })
}

export function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-3">
        <Icon className="size-5 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

// react-doctor-disable-next-line react-doctor/no-multi-comp -- shared extranet presentational helpers colocated by design
export function DocRow({
  nom,
  categorie,
  fichierNom,
  docId,
}: {
  nom: string
  categorie: string
  fichierNom: string
  docId: number
}) {
  return (
    <div className="flex items-center justify-between rounded border border-border px-3 py-2">
      <div>
        <p className="text-sm font-medium">{nom}</p>
        <p className="text-xs text-muted-foreground">
          {fichierNom} - {categorie}
        </p>
      </div>
      <a
        href={documentsApi.getDownloadUrl(docId)}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        title="Telecharger"
        aria-label="Telecharger"
      >
        <Download className="size-4" />
      </a>
    </div>
  )
}

// react-doctor-disable-next-line react-doctor/no-multi-comp -- shared extranet presentational helpers colocated by design
export function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-semibold ${color ?? ''}`}>
        {value}
      </p>
    </div>
  )
}
