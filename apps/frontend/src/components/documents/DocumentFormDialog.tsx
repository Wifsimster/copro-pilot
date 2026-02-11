import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, StickyNote, Upload, X, File } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Document as DocType, CategorieDocument, EntiteType } from '@/types'

const schema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  categorie: z.string().min(1),
  description: z.string().optional().or(z.literal('')),
  entite_type: z.string().optional().or(z.literal('')),
  entite_id: z.string().optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: { file?: File; metadata: Partial<DocType> }) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<DocType>
  title?: string
}

const CATEGORIES: { value: CategorieDocument; label: string }[] = [
  { value: 'pv_ag', label: 'PV d\'AG' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'facture', label: 'Facture' },
  { value: 'devis', label: 'Devis' },
  { value: 'reglement', label: 'Reglement' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'courrier', label: 'Courrier' },
  { value: 'autre', label: 'Autre' },
]

const ENTITE_TYPES: { value: EntiteType; label: string }[] = [
  { value: 'ag', label: 'Assemblee Generale' },
  { value: 'intervention', label: 'Intervention' },
  { value: 'budget', label: 'Budget' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'sinistre', label: 'Sinistre' },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function DocumentFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau document',
}: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const isEditing = !!defaultValues?.id

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: defaultValues?.nom ?? '',
      categorie: defaultValues?.categorie ?? 'autre',
      description: defaultValues?.description ?? '',
      entite_type: defaultValues?.entite_type ?? '',
      entite_id: defaultValues?.entite_id ? String(defaultValues.entite_id) : '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        nom: defaultValues?.nom ?? '',
        categorie: defaultValues?.categorie ?? 'autre',
        description: defaultValues?.description ?? '',
        entite_type: defaultValues?.entite_type ?? '',
        entite_id: defaultValues?.entite_id ? String(defaultValues.entite_id) : '',
      })
      setSelectedFile(null)
    }
  }, [open, defaultValues, reset])

  const currentCategorie = watch('categorie')
  const currentEntiteType = watch('entite_type')

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      if (!watch('nom')) {
        setValue('nom', file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }, [setValue, watch])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!watch('nom')) {
        setValue('nom', file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }, [setValue, watch])

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      file: selectedFile || undefined,
      metadata: {
        copropriete_id: coproprieteId,
        nom: data.nom,
        categorie: data.categorie as CategorieDocument,
        description: data.description || null,
        entite_type: (data.entite_type as EntiteType) || null,
        entite_id: data.entite_id ? Number(data.entite_id) : null,
      },
    })
    reset()
    setSelectedFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations du document.'
              : 'Deposez un fichier ou remplissez les informations du document.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* File upload zone */}
          {!isEditing && (
            <div className="space-y-2">
              <Label>Fichier</Label>
              {selectedFile ? (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <File className="size-8 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)} &middot; {selectedFile.type || 'Type inconnu'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                    isDragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-accent/30'
                  }`}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className={`size-8 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    Deposez un fichier ici
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ou cliquez pour parcourir (max 20 Mo)
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                  />
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Document info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Informations</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom">Nom du document *</Label>
              <Input id="nom" {...register('nom')} placeholder="Ex: PV AG 2025" />
              {errors.nom && (
                <p className="text-sm text-destructive">{errors.nom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categorie">Categorie</Label>
              <Select value={currentCategorie} onValueChange={(val) => setValue('categorie', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entite_type">Entite liee</Label>
                <Select
                  value={currentEntiteType || '_none'}
                  onValueChange={(val) => setValue('entite_type', val === '_none' ? '' : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Aucune</SelectItem>
                    {ENTITE_TYPES.map((et) => (
                      <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currentEntiteType && currentEntiteType !== '_none' && (
                <div className="space-y-2">
                  <Label htmlFor="entite_id">ID entite</Label>
                  <Input
                    id="entite_id"
                    type="number"
                    {...register('entite_id')}
                    placeholder="ID"
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <StickyNote className="size-4" />
              <span>Notes</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea {...register('description')} rows={3} placeholder="Description du document..." />
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Telecharger'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
