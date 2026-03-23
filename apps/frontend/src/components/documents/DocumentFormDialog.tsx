import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, StickyNote, Upload, X, File } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormDialog } from '@/components/ui/form-dialog'
import { FormSection } from '@/components/ui/form-section'
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
  { value: 'reglement', label: 'Règlement' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'courrier', label: 'Courrier' },
  { value: 'autre', label: 'Autre' },
]

const ENTITE_TYPES: { value: EntiteType; label: string }[] = [
  { value: 'ag', label: 'Assemblée Générale' },
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

  const form = useForm<FormData>({
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
      form.reset({
        nom: defaultValues?.nom ?? '',
        categorie: defaultValues?.categorie ?? 'autre',
        description: defaultValues?.description ?? '',
        entite_type: defaultValues?.entite_type ?? '',
        entite_id: defaultValues?.entite_id ? String(defaultValues.entite_id) : '',
      })
      setSelectedFile(null)
    }
  }, [open, defaultValues, form.reset])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      if (!form.watch('nom')) {
        form.setValue('nom', file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }, [form.setValue, form.watch])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!form.watch('nom')) {
        form.setValue('nom', file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }, [form.setValue, form.watch])

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
    form.reset()
    setSelectedFile(null)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={isEditing
        ? 'Modifiez les informations du document.'
        : 'Déposez un fichier ou remplissez les informations du document.'}
      form={form}
      onSubmit={onFormSubmit}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Modifier' : 'Télécharger'}
      size="lg"
    >
      {/* File upload zone */}
      {!isEditing && (
        <div className="space-y-2">
          <span className="text-sm font-medium">Fichier</span>
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
                Déposez un fichier ici
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

      <FormSection icon={FileText} label="Informations">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du document *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: PV AG 2025" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categorie"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="entite_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entité liée</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(val === '_none' ? '' : val)}
                  value={field.value || '_none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="_none">Aucune</SelectItem>
                    {ENTITE_TYPES.map((et) => (
                      <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch('entite_type') && form.watch('entite_type') !== '_none' && (
            <FormField
              control={form.control}
              name="entite_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID entité</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </FormSection>

      <FormSection icon={StickyNote} label="Notes">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Description du document..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
