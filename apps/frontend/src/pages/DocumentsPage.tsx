import { useState } from 'react'
import { useCoproprietes } from '@/hooks/useCoproprietes'
import { useDocumentsByCopropriete, useCreateDocument, useUpdateDocument, useDeleteDocument } from '@/hooks/useDocuments'
import { DocumentFormDialog } from '@/components/documents/DocumentFormDialog'
import type { Document } from '@/types'
import { FolderOpen, Plus, Trash2, Pencil, ChevronDown, FileText, Download, Search } from 'lucide-react'

const CATEGORIE_LABELS: Record<string, string> = {
  pv_ag: 'PV d\'AG',
  contrat: 'Contrat',
  facture: 'Facture',
  devis: 'Devis',
  reglement: 'Reglement',
  assurance: 'Assurance',
  diagnostic: 'Diagnostic',
  courrier: 'Courrier',
  autre: 'Autre',
}

const CATEGORIE_COLORS: Record<string, string> = {
  pv_ag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  contrat: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  facture: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  devis: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  reglement: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  assurance: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  diagnostic: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  courrier: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  autre: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export default function DocumentsPage() {
  const { data: coproprietes, isLoading: loadingCopros } = useCoproprietes()
  const [selectedCoproId, setSelectedCoproId] = useState<number | undefined>()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [search, setSearch] = useState('')
  const [filterCategorie, setFilterCategorie] = useState<string>('all')

  const { data: documents, isLoading: loadingDocs } = useDocumentsByCopropriete(selectedCoproId)
  const createDocument = useCreateDocument()
  const updateDocument = useUpdateDocument()
  const deleteDocument = useDeleteDocument()

  const filtered = documents?.filter((doc) => {
    const matchSearch = !search ||
      doc.nom.toLowerCase().includes(search.toLowerCase()) ||
      doc.fichier_nom.toLowerCase().includes(search.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(search.toLowerCase()))
    const matchCategorie = filterCategorie === 'all' || doc.categorie === filterCategorie
    return matchSearch && matchCategorie
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="text-muted-foreground">Gestion des documents de copropriete</p>
      </div>

      {/* Copropriete selector */}
      <div className="relative w-full max-w-sm">
        <select
          value={selectedCoproId ?? ''}
          onChange={(e) => setSelectedCoproId(e.target.value ? Number(e.target.value) : undefined)}
          disabled={loadingCopros}
          className="w-full appearance-none rounded-lg border border-input bg-background py-2.5 pl-3 pr-10 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">— Selectionner une copropriete —</option>
          {coproprietes?.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16">
          <FolderOpen className="h-16 w-16 text-muted-foreground/40" />
          <h3 className="mt-6 text-lg font-medium text-foreground">Selectionnez une copropriete</h3>
          <p className="mt-2 max-w-md text-center text-muted-foreground">
            Choisissez une copropriete pour afficher et gerer ses documents.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Actions bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un document..."
                  className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <div className="relative">
                <select
                  value={filterCategorie}
                  onChange={(e) => setFilterCategorie(e.target.value)}
                  className="appearance-none rounded-lg border border-input bg-background py-2 pl-3 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="all">Toutes categories</option>
                  {Object.entries(CATEGORIE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Ajouter un document
            </button>
          </div>

          {/* Documents list */}
          {loadingDocs ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg border border-border p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 rounded bg-muted" />
                      <div className="h-3 w-32 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !filtered?.length ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12">
              <FileText className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-base font-medium text-foreground">
                {search || filterCategorie !== 'all' ? 'Aucun document trouve' : 'Aucun document'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {search || filterCategorie !== 'all'
                  ? 'Essayez de modifier vos criteres de recherche.'
                  : 'Ajoutez votre premier document a cette copropriete.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{doc.nom}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{doc.fichier_nom}</span>
                      <span>&middot;</span>
                      <span>{formatFileSize(doc.taille)}</span>
                      <span>&middot;</span>
                      <span>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {doc.description && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">{doc.description}</p>
                    )}
                  </div>
                  <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORIE_COLORS[doc.categorie] ?? CATEGORIE_COLORS.autre}`}>
                    {CATEGORIE_LABELS[doc.categorie] ?? doc.categorie}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    {doc.fichier_path && (
                      <a
                        href={doc.fichier_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        title="Telecharger"
                      >
                        <Download className="size-4" />
                      </a>
                    )}
                    <button
                      onClick={() => setEditingDoc(doc)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      title="Modifier"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Supprimer ce document ?')) deleteDocument.mutate(doc.id) }}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      title="Supprimer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create dialog */}
      <DocumentFormDialog
        open={showCreateDialog || !!editingDoc}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false)
            setEditingDoc(null)
          }
        }}
        coproprieteId={selectedCoproId ?? 0}
        defaultValues={editingDoc ?? undefined}
        title={editingDoc ? 'Modifier le document' : 'Nouveau document'}
        isLoading={createDocument.isPending || updateDocument.isPending}
        onSubmit={async (data) => {
          if (editingDoc) {
            await updateDocument.mutateAsync({ id: editingDoc.id, data })
            setEditingDoc(null)
          } else {
            await createDocument.mutateAsync(data)
            setShowCreateDialog(false)
          }
        }}
      />
    </div>
  )
}
