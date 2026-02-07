import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
import type { PresenceAG } from '@/types'

const schema = z.object({
  coproprietaire_id: z.coerce.number().positive('Le coproprietaire est obligatoire'),
  statut: z.enum(['present', 'absent', 'represente']),
  represente_par_id: z.coerce.number().optional().or(z.literal(0)),
  tantiemes: z.coerce.number().min(0),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  agId: number
  onSubmit: (data: Partial<PresenceAG>) => Promise<void>
  isLoading?: boolean
}

export function PresenceFormDialog({ open, onOpenChange, agId, onSubmit, isLoading }: Props) {
  const { data: coproprietaires } = useCoproprietaires()
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      coproprietaire_id: 0,
      statut: 'present',
      represente_par_id: 0,
      tantiemes: 0,
    },
  })

  const currentStatut = watch('statut')

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      ag_id: agId,
      coproprietaire_id: data.coproprietaire_id,
      statut: data.statut,
      represente_par_id: data.statut === 'represente' && data.represente_par_id && data.represente_par_id > 0
        ? data.represente_par_id
        : null,
      tantiemes: data.tantiemes,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une presence</DialogTitle>
          <DialogDescription>
            Enregistrez la presence d'un coproprietaire. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="size-4" />
              <span>Presence</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coproprietaire_id">Coproprietaire *</Label>
              <select
                {...register('coproprietaire_id')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value={0}>— Selectionner —</option>
                {coproprietaires?.map((c) => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))}
              </select>
              {errors.coproprietaire_id && (
                <p className="text-sm text-destructive">{errors.coproprietaire_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="statut">Statut *</Label>
                <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as FormData['statut'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="represente">Represente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tantiemes">Tantiemes *</Label>
                <Input id="tantiemes" type="number" {...register('tantiemes')} />
                {errors.tantiemes && (
                  <p className="text-sm text-destructive">{errors.tantiemes.message}</p>
                )}
              </div>
            </div>

            {currentStatut === 'represente' && (
              <div className="space-y-2">
                <Label htmlFor="represente_par_id">Represente par</Label>
                <select
                  {...register('represente_par_id')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value={0}>— Aucun —</option>
                  {coproprietaires?.map((c) => (
                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                  ))}
                </select>
              </div>
            )}
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
