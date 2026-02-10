import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, CalendarDays, Banknote } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EmployeSyndicat } from '@/types'

const employeSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prenom est obligatoire'),
  poste: z.string().min(1, 'Le poste est obligatoire'),
  type_contrat: z.enum(['cdi', 'cdd', 'interim', 'saisonnier']),
  date_embauche: z.string().min(1, 'La date d\'embauche est obligatoire'),
  date_fin: z.string().optional(),
  salaire_brut: z.string().optional(),
  logement_fonction: z.boolean(),
  statut: z.enum(['actif', 'inactif']),
  notes: z.string().optional(),
})

type EmployeFormData = z.infer<typeof employeSchema>

interface EmployeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<EmployeSyndicat>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<EmployeSyndicat>
  title?: string
}

export function EmployeFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvel employe',
}: EmployeFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeFormData>({
    resolver: zodResolver(employeSchema),
    defaultValues: {
      nom: defaultValues?.nom || '',
      prenom: defaultValues?.prenom || '',
      poste: defaultValues?.poste || '',
      type_contrat: defaultValues?.type_contrat || 'cdi',
      date_embauche: defaultValues?.date_embauche || new Date().toISOString().split('T')[0],
      date_fin: defaultValues?.date_fin || '',
      salaire_brut: defaultValues?.salaire_brut != null ? String(defaultValues.salaire_brut) : '',
      logement_fonction: defaultValues?.logement_fonction || false,
      statut: defaultValues?.statut || 'actif',
      notes: defaultValues?.notes || '',
    },
  })

  const currentTypeContrat = watch('type_contrat')
  const currentStatut = watch('statut')
  const currentLogement = watch('logement_fonction')

  const handleFormSubmit = async (data: EmployeFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      date_fin: data.date_fin || null,
      salaire_brut: data.salaire_brut ? parseFloat(data.salaire_brut) : null,
      notes: data.notes || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Renseignez les informations de l'employe. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="size-4" />
              <span>Identite</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input id="nom" {...register('nom')} placeholder="Dupont" />
                {errors.nom && (
                  <p className="text-sm text-destructive">{errors.nom.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prenom *</Label>
                <Input id="prenom" {...register('prenom')} placeholder="Jean" />
                {errors.prenom && (
                  <p className="text-sm text-destructive">{errors.prenom.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poste">Poste *</Label>
                <Input id="poste" {...register('poste')} placeholder="Gardien, concierge..." />
                {errors.poste && (
                  <p className="text-sm text-destructive">{errors.poste.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type_contrat">Type de contrat *</Label>
                <Select value={currentTypeContrat} onValueChange={(val) => setValue('type_contrat', val as EmployeFormData['type_contrat'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cdi">CDI</SelectItem>
                    <SelectItem value="cdd">CDD</SelectItem>
                    <SelectItem value="interim">Interim</SelectItem>
                    <SelectItem value="saisonnier">Saisonnier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut *</Label>
              <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as EmployeFormData['statut'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>Periode d'emploi</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_embauche">Date d'embauche *</Label>
                <Input id="date_embauche" type="date" {...register('date_embauche')} />
                {errors.date_embauche && (
                  <p className="text-sm text-destructive">{errors.date_embauche.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_fin">Date de fin</Label>
                <Input id="date_fin" type="date" {...register('date_fin')} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial & housing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Banknote className="size-4" />
              <span>Remuneration & logement</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaire_brut">Salaire brut mensuel</Label>
                <Input id="salaire_brut" type="number" step="0.01" {...register('salaire_brut')} placeholder="0.00" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Checkbox
                  id="logement_fonction"
                  checked={currentLogement}
                  onCheckedChange={(checked) => setValue('logement_fonction', checked === true)}
                />
                <Label htmlFor="logement_fonction" className="cursor-pointer">Logement de fonction</Label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea rows={3} {...register('notes')} placeholder="Informations complementaires..." />
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
