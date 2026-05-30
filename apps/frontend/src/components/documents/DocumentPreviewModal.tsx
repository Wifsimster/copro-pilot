import { Download, X } from 'lucide-react'
import { documentsApi } from '@/api/documents'
import type { Document } from '@/types'

interface DocumentPreviewModalProps {
  document: Document
  onClose: () => void
}

/** Full-screen preview for an image or PDF document. */
export function DocumentPreviewModal({
  document: previewDoc,
  onClose,
}: DocumentPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative flex h-[90vh] w-[90vw] max-w-5xl flex-col rounded-lg bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="text-sm font-medium">{previewDoc.nom}</h3>
            <p className="text-xs text-muted-foreground">
              {previewDoc.fichier_nom}
            </p>
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
              type="button"
              onClick={onClose}
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
              sandbox="allow-same-origin allow-popups"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
