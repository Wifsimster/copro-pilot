import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import type { ConvocationAG, ModeEnvoi } from '@/types'

const convocationSchema = z.object({
  mode_envoi: z.enum(['email', 'courrier_recommande', 'les_deux']),
  contenu: z.string().min(1, 'Le contenu est obligatoire'),
  notes: z.string().optional(),
})

type ConvocationFormData = z.infer<typeof convocationSchema>

interface ConvocationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agId: number
  onSubmit: (data: Partial<ConvocationAG>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<ConvocationAG>
  title?: string
}

const DEFAULT_TEMPLATE = `Madame, Monsieur,

Nous avons l'honneur de vous convoquer a l'Assemblee Generale de votre copropriete.

Conformement a l'article 9 du decret du 17 mars 1967, nous vous rappelons que vous disposez de la possibilite de vous faire representer par un mandataire de votre choix.

Veuillez trouver ci-joints les documents preparatoires a cette assemblee.

Nous vous prions d'agreer, Madame, Monsieur, l'expression de nos salutations distinguees.

Le Syndic`

export function ConvocationFormDialog({
  open,
  onOpenChange,
  agId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle convocation',
}: ConvocationFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConvocationFormData>({
    resolver: zodResolver(convocationSchema),
    defaultValues: {
      mode_envoi: (defaultValues?.mode_envoi as ModeEnvoi) || 'email',
      contenu: defaultValues?.contenu || DEFAULT_TEMPLATE,
      notes: defaultValues?.notes || '',
    },
  })

  const currentMode = watch('mode_envoi')

  const handleFormSubmit = async (data: ConvocationFormData) => {
    await onSubmit({
      ...data,
      ag_id: agId,
      notes: data.notes || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Redigez la convocation et choisissez le mode d'envoi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Mode envoi */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mail className="size-4" />
              <span>Mode d'envoi</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode_envoi">Mode d'envoi *</Label>
              <Select value={currentMode} onValueChange={(val) => setValue('mode_envoi', val as ModeEnvoi)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="courrier_recommande">Courrier recommande</SelectItem>
                  <SelectItem value="les_deux">Les deux (email + courrier)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Contenu */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Contenu de la convocation</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contenu">Contenu *</Label>
              <Textarea rows={10} {...register('contenu')} placeholder="Texte de la convocation..." />
              {errors.contenu && (
                <p className="text-sm text-destructive">{errors.contenu.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea rows={2} {...register('notes')} placeholder="Notes internes (non envoyees)..." />
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
