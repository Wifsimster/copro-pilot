import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeftRight, StickyNote } from 'lucide-react'
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
import { useCoproprietaires } from '@/hooks/useCoproprietaires'
import type { Mutation, TypeMutation } from '@/types'

const schema = z.object({
  type: z.enum(['vente', 'donation', 'succession', 'autre']),
  date_mutation: z.string().min(1, 'La date est obligatoire'),
  ancien_proprietaire_id: z.coerce.number().positive().optional().or(z.literal(0)),
  nouveau_proprietaire_id: z.coerce.number().positive('Le nouveau proprietaire est obligatoire'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  lotId: number
  onSubmit: (data: Partial<Mutation>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Mutation>
  title?: string
}

export function MutationFormDialog({ open, onOpenChange, lotId, onSubmit, isLoading, defaultValues, title = 'Nouvelle mutation' }: Props) {
  const { data: coproprietaires } = useCoproprietaires()
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: (defaultValues?.type as FormData['type']) || 'vente',
      date_mutation: defaultValues?.date_mutation || new Date().toISOString().split('T')[0],
      ancien_proprietaire_id: defaultValues?.ancien_proprietaire_id || 0,
      nouveau_proprietaire_id: defaultValues?.nouveau_proprietaire_id || 0,
      notes: defaultValues?.notes || '',
    },
  })

  const currentType = watch('type')
  const currentAncienProprietaire = watch('ancien_proprietaire_id')
  const currentNouveauProprietaire = watch('nouveau_proprietaire_id')

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      lot_id: lotId,
      type: data.type as TypeMutation,
      date_mutation: data.date_mutation,
      ancien_proprietaire_id: data.ancien_proprietaire_id && data.ancien_proprietaire_id > 0 ? data.ancien_proprietaire_id : null,
      nouveau_proprietaire_id: data.nouveau_proprietaire_id,
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
            Renseignez les informations de la mutation. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Mutation details section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ArrowLeftRight className="size-4" />
              <span>Mutation</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={currentType} onValueChange={(val) => setValue('type', val as FormData['type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vente">Vente</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="succession">Succession</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_mutation">Date *</Label>
                <Input id="date_mutation" type="date" {...register('date_mutation')} />
                {errors.date_mutation && (
                  <p className="text-sm text-destructive">{errors.date_mutation.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ancien_proprietaire_id">Ancien proprietaire</Label>
                <Select value={String(currentAncienProprietaire || 0)} onValueChange={(val) => setValue('ancien_proprietaire_id', Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="— Aucun —" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">— Aucun —</SelectItem>
                    {coproprietaires?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.prenom} {c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nouveau_proprietaire_id">Nouveau proprietaire *</Label>
                <Select value={String(currentNouveauProprietaire || 0)} onValueChange={(val) => setValue('nouveau_proprietaire_id', Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="— Selectionner —" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">— Selectionner —</SelectItem>
                    {coproprietaires?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.prenom} {c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.nouveau_proprietaire_id && (
                  <p className="text-sm text-destructive">{errors.nouveau_proprietaire_id.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <StickyNote className="size-4" />
              <span>Informations complementaires</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea rows={3} {...register('notes')} placeholder="Informations complementaires..." />
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
