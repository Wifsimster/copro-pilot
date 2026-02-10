import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users, CalendarDays } from 'lucide-react'
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
import type { MembreConseilSyndical, Coproprietaire, AssembleeGenerale } from '@/types'

const membreSchema = z.object({
  coproprietaire_id: z.coerce.number().min(1, 'Le copropriétaire est obligatoire'),
  role: z.enum(['president', 'membre', 'suppleant']),
  date_election: z.string().min(1, "La date d'élection est obligatoire"),
  date_fin_mandat: z.string().optional(),
  ag_election_id: z.coerce.number().optional(),
  notes: z.string().optional(),
})

type MembreFormData = z.infer<typeof membreSchema>

interface ConseilSyndicalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  coproprietaires: Coproprietaire[]
  assemblees: AssembleeGenerale[]
  onSubmit: (data: Partial<MembreConseilSyndical>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<MembreConseilSyndical>
  title?: string
}

const roleLabels: Record<string, string> = {
  president: 'Président',
  membre: 'Membre',
  suppleant: 'Suppléant',
}

function formatAGDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR')
}

export function ConseilSyndicalFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  coproprietaires,
  assemblees,
  onSubmit,
  isLoading = false,
  defaultValues,
  title = 'Ajouter un membre',
}: ConseilSyndicalFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MembreFormData>({
    resolver: zodResolver(membreSchema),
    defaultValues: {
      coproprietaire_id: defaultValues?.coproprietaire_id ?? 0,
      role: defaultValues?.role ?? 'membre',
      date_election: defaultValues?.date_election ?? '',
      date_fin_mandat: defaultValues?.date_fin_mandat ?? '',
      ag_election_id: defaultValues?.ag_election_id ?? undefined,
      notes: defaultValues?.notes ?? '',
    },
  })

  const selectedRole = watch('role')
  const selectedCoproprietaire = watch('coproprietaire_id')
  const selectedAG = watch('ag_election_id')

  useEffect(() => {
    if (open) {
      reset({
        coproprietaire_id: defaultValues?.coproprietaire_id ?? 0,
        role: defaultValues?.role ?? 'membre',
        date_election: defaultValues?.date_election ?? '',
        date_fin_mandat: defaultValues?.date_fin_mandat ?? '',
        ag_election_id: defaultValues?.ag_election_id ?? undefined,
        notes: defaultValues?.notes ?? '',
      })
    }
  }, [open, defaultValues, reset])

  const handleFormSubmit = async (data: MembreFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      date_fin_mandat: data.date_fin_mandat || null,
      ag_election_id: data.ag_election_id || null,
      notes: data.notes || null,
    } as Partial<MembreConseilSyndical>)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Remplissez les informations du membre du conseil syndical.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Membre</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="coproprietaire_id">Copropriétaire *</Label>
              <Select
                value={selectedCoproprietaire ? String(selectedCoproprietaire) : ''}
                onValueChange={(value) => setValue('coproprietaire_id', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un copropriétaire" />
                </SelectTrigger>
                <SelectContent>
                  {coproprietaires.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nom} {c.prenom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.coproprietaire_id && (
                <p className="text-sm text-destructive">{errors.coproprietaire_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue('role', value as MembreFormData['role'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>Mandat</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="date_election">Date d'élection *</Label>
              <Input
                id="date_election"
                type="date"
                {...register('date_election')}
              />
              {errors.date_election && (
                <p className="text-sm text-destructive">{errors.date_election.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_fin_mandat">Date de fin de mandat</Label>
              <Input
                id="date_fin_mandat"
                type="date"
                {...register('date_fin_mandat')}
              />
              {errors.date_fin_mandat && (
                <p className="text-sm text-destructive">{errors.date_fin_mandat.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ag_election_id">AG d'élection</Label>
              <Select
                value={selectedAG ? String(selectedAG) : 'none'}
                onValueChange={(value) =>
                  setValue('ag_election_id', value === 'none' ? undefined : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {assemblees.map((ag) => (
                    <SelectItem key={ag.id} value={String(ag.id)}>
                      AG {ag.type} du {formatAGDate(ag.date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ag_election_id && (
                <p className="text-sm text-destructive">{errors.ag_election_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Notes complémentaires..."
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">{errors.notes.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
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
