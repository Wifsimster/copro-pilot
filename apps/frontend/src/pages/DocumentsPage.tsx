import { useState } from 'react'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useDocumentsByCopropriete, useUploadDocument, useUpdateDocument, useDeleteDocument } from '@/hooks/useDocuments'
import { documentsApi } from '@/api/documents'
import { DocumentFormDialog } from '@/components/documents/DocumentFormDialog'
import type { Document } from '@/types'
import { FolderOpen, Plus, Trash2, Pencil, ChevronDown, FileText, Download, Search, Eye, X, Image, FileSpreadsheet, File } from 'lucide-react'
import { ErrorAlert } from '@/components/layout/ErrorAlert'

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
  contrat: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  facture: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  devis: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  reglement: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  assurance: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  diagnostic: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  courrier: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  autre: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
}

const ENTITE_LABELS: Record<string, string> = {
  ag: 'AG',
  intervention: 'Intervention',
  budget: 'Budget',
  contrat: 'Contrat',
  sinistre: 'Sinistre',
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return FileText
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet
  if (mimeType.includes('pdf')) return FileText
  return File
}

function isPreviewable(mimeType: string | null): boolean {
  if (!mimeType) return false
  return mimeType === 'application/pdf' || mimeType.startsWith('image/')
}

export default function DocumentsPage() {
  const selectedCoproId = useCoproprieteStore((s) => s.selectedCoproprieteId)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [search, setSearch] = useState('')
  const [filterCategorie, setFilterCategorie] = useState<string>('all')

  const { data: documents, isLoading: loadingDocs, isError, error } = useDocumentsByCopropriete(selectedCoproId)
  const uploadDocument = useUploadDocument()
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

  const stats = documents ? {
    total: documents.length,
    totalSize: documents.reduce((sum, d) => sum + (d.taille || 0), 0),
    categories: Object.entries(
      documents.reduce((acc, d) => {
        acc[d.categorie] = (acc[d.categorie] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]),
  } : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="text-muted-foreground">Gestion electronique des documents de copropriete</p>
      </div>

      {isError && <ErrorAlert error={error} message="Impossible de charger les documents" />}

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16">
          <FolderOpen className="size-16 text-muted-foreground/40" />
          <h3 className="mt-6 text-lg font-medium text-foreground">Aucune copropriete selectionnee</h3>
          <p className="mt-2 max-w-md text-center text-muted-foreground">
            Selectionnez une copropriete dans le menu lateral.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats bar */}
          {stats && stats.total > 0 && (
            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg border border-border bg-card px-4 py-2">
                <p className="text-xs text-muted-foreground">Documents</p>
                <p className="text-lg font-semibold">{stats.total}</p>
              </div>
              <div className="rounded-lg border border-border bg-card px-4 py-2">
                <p className="text-xs text-muted-foreground">Taille totale</p>
                <p className="text-lg font-semibold">{formatFileSize(stats.totalSize)}</p>
              </div>
              {stats.categories.slice(0, 3).map(([cat, count]) => (
                <div key={cat} className="rounded-lg border border-border bg-card px-4 py-2">
                  <p className="text-xs text-muted-foreground">{CATEGORIE_LABELS[cat] ?? cat}</p>
                  <p className="text-lg font-semibold">{count}</p>
                </div>
              ))}
            </div>
          )}

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
                    <div className="size-10 rounded-lg bg-muted" />
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
              <FileText className="size-12 text-muted-foreground/40" />
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
              {filtered.map((doc) => {
                const IconComponent = getFileIcon(doc.mime_type)
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <IconComponent className="size-5 text-muted-foreground" />
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
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORIE_COLORS[doc.categorie] ?? CATEGORIE_COLORS.autre}`}>
                        {CATEGORIE_LABELS[doc.categorie] ?? doc.categorie}
                      </span>
                      {doc.entite_type && (
                        <span className="text-xs text-muted-foreground">
                          {ENTITE_LABELS[doc.entite_type] ?? doc.entite_type} #{doc.entite_id}
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {isPreviewable(doc.mime_type) && (
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          title="Previsualiser"
                          aria-label="Previsualiser"
                        >
                          <Eye className="size-4" />
                        </button>
                      )}
                      <a
                        href={documentsApi.getDownloadUrl(doc.id)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        title="Telecharger"
                        aria-label="Telecharger"
                      >
                        <Download className="size-4" />
                      </a>
                      <button
                        onClick={() => setEditingDoc(doc)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        title="Modifier"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Supprimer ce document ?')) deleteDocument.mutate(doc.id) }}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        title="Supprimer"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Preview modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative flex h-[90vh] w-[90vw] max-w-5xl flex-col rounded-lg bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h3 className="text-sm font-medium">{previewDoc.nom}</h3>
                <p className="text-xs text-muted-foreground">{previewDoc.fichier_nom}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={documentsApi.getDownloadUrl(previewDoc.id)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  title="Telecharger"
                  aria-label="Telecharger"
                >
                  <Download className="size-4" />
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Fermer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {previewDoc.mime_type?.startsWith('image/') ? (
                <img
                  src={documentsApi.getDownloadUrl(previewDoc.id)}
                  alt={previewDoc.nom}
                  className="mx-auto max-h-full max-w-full object-contain"
                />
              ) : previewDoc.mime_type === 'application/pdf' ? (
                <iframe
                  src={documentsApi.getDownloadUrl(previewDoc.id)}
                  className="size-full rounded border border-border"
                  title={previewDoc.nom}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit dialog */}
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
        isLoading={uploadDocument.isPending || updateDocument.isPending}
        onSubmit={async ({ file, metadata }) => {
          if (editingDoc) {
            await updateDocument.mutateAsync({ id: editingDoc.id, data: metadata })
            setEditingDoc(null)
          } else if (file) {
            await uploadDocument.mutateAsync({
              file,
              metadata: {
                copropriete_id: metadata.copropriete_id!,
                nom: metadata.nom!,
                categorie: metadata.categorie,
                description: metadata.description ?? undefined,
                entite_type: metadata.entite_type ?? undefined,
                entite_id: metadata.entite_id ?? undefined,
              },
            })
            setShowCreateDialog(false)
          }
        }}
      />
    </div>
  )
}
