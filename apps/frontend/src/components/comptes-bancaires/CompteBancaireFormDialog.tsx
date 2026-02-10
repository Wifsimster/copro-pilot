import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Landmark, FileText } from 'lucide-react'
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
import type { CompteBancaire } from '@/types'

const compteBancaireSchema = z.object({
  banque: z.string().min(1, 'La banque est obligatoire'),
  iban: z.string().min(1, 'L\'IBAN est obligatoire').max(34),
  bic: z.string().optional(),
  type: z.enum(['courant', 'fonds_travaux', 'emprunt']),
  libelle: z.string().optional(),
  solde: z.coerce.number(),
  date_ouverture: z.string().optional(),
  actif: z.boolean(),
  notes: z.string().optional(),
})

type CompteBancaireFormData = z.infer<typeof compteBancaireSchema>;

interface CompteBancaireFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<CompteBancaire>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<CompteBancaire>
  title?: string
}

export function CompteBancaireFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau compte bancaire',
}: CompteBancaireFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompteBancaireFormData>({
    resolver: zodResolver(compteBancaireSchema),
    defaultValues: {
      banque: defaultValues?.banque || '',
      iban: defaultValues?.iban || '',
      bic: defaultValues?.bic || '',
      type: defaultValues?.type || 'courant',
      libelle: defaultValues?.libelle || '',
      solde: defaultValues?.solde || 0,
      date_ouverture: defaultValues?.date_ouverture || '',
      actif: defaultValues?.actif ?? true,
      notes: defaultValues?.notes || '',
    },
  })

  const currentType = watch('type')
  const currentActif = watch('actif')

  const handleFormSubmit = async (data: CompteBancaireFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      bic: data.bic || null,
      libelle: data.libelle || null,
      date_ouverture: data.date_ouverture || null,
      notes: data.notes || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Renseignez les informations du compte bancaire. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Informations bancaires section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Landmark className="size-4" />
              <span>Informations bancaires</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banque">Banque *</Label>
                <Input id="banque" {...register('banque')} placeholder="Nom de la banque" />
                {errors.banque && (
                  <p className="text-sm text-destructive">{errors.banque.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN *</Label>
                <Input id="iban" {...register('iban')} placeholder="FR76 ..." />
                {errors.iban && (
                  <p className="text-sm text-destructive">{errors.iban.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bic">BIC</Label>
                <Input id="bic" {...register('bic')} placeholder="BNPAFRPP" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={currentType} onValueChange={(val) => setValue('type', val as CompteBancaireFormData['type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="courant">Courant</SelectItem>
                    <SelectItem value="fonds_travaux">Fonds travaux</SelectItem>
                    <SelectItem value="emprunt">Emprunt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Parametres section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Parametres</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="libelle">Libelle</Label>
                <Input id="libelle" {...register('libelle')} placeholder="Libelle du compte" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solde">Solde (EUR) *</Label>
                <Input id="solde" type="number" step="0.01" {...register('solde')} placeholder="0.00" />
                {errors.solde && (
                  <p className="text-sm text-destructive">{errors.solde.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_ouverture">Date d'ouverture</Label>
                <Input id="date_ouverture" type="date" {...register('date_ouverture')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actif">Statut *</Label>
                <Select value={currentActif ? 'true' : 'false'} onValueChange={(val) => setValue('actif', val === 'true')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Notes</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" {...register('notes')} placeholder="Notes supplementaires..." />
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
