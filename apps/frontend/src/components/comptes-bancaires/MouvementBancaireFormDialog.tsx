import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowDownUp, FileText } from 'lucide-react'
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
import type { MouvementBancaire } from '@/types'

const mouvementSchema = z.object({
  date: z.string().min(1, 'La date est obligatoire'),
  libelle: z.string().min(1, 'Le libelle est obligatoire'),
  montant: z.coerce.number().positive('Le montant doit etre positif'),
  type: z.enum(['credit', 'debit']),
  categorie: z.string().optional(),
  reference: z.string().optional(),
  rapproche: z.boolean(),
  notes: z.string().optional(),
})

type MouvementFormData = z.infer<typeof mouvementSchema>;

interface MouvementBancaireFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compteId: number
  onSubmit: (data: Partial<MouvementBancaire>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<MouvementBancaire>
  title?: string
}

export function MouvementBancaireFormDialog({
  open,
  onOpenChange,
  compteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau mouvement',
}: MouvementBancaireFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MouvementFormData>({
    resolver: zodResolver(mouvementSchema),
    defaultValues: {
      date: defaultValues?.date || new Date().toISOString().split('T')[0],
      libelle: defaultValues?.libelle || '',
      montant: defaultValues?.montant || 0,
      type: defaultValues?.type || 'credit',
      categorie: defaultValues?.categorie || '',
      reference: defaultValues?.reference || '',
      rapproche: defaultValues?.rapproche || false,
      notes: defaultValues?.notes || '',
    },
  })

  const currentType = watch('type')
  const currentCategorie = watch('categorie')
  const currentRapproche = watch('rapproche')

  const handleFormSubmit = async (data: MouvementFormData) => {
    await onSubmit({
      ...data,
      compte_id: compteId,
      categorie: data.categorie || null,
      reference: data.reference || null,
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
            Enregistrez un mouvement bancaire. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Mouvement section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ArrowDownUp className="size-4" />
              <span>Mouvement</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="montant">Montant (EUR) *</Label>
                <Input id="montant" type="number" step="0.01" {...register('montant')} placeholder="0.00" />
                {errors.montant && (
                  <p className="text-sm text-destructive">{errors.montant.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="libelle">Libelle *</Label>
              <Input id="libelle" {...register('libelle')} placeholder="Libelle du mouvement" />
              {errors.libelle && (
                <p className="text-sm text-destructive">{errors.libelle.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={currentType} onValueChange={(val) => setValue('type', val as MouvementFormData['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Details section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Details</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categorie">Categorie</Label>
              <Select value={currentCategorie} onValueChange={(val) => setValue('categorie', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner une categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appel_de_fonds">Appel de fonds</SelectItem>
                  <SelectItem value="paiement_prestataire">Paiement prestataire</SelectItem>
                  <SelectItem value="frais_bancaires">Frais bancaires</SelectItem>
                  <SelectItem value="remboursement">Remboursement</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" {...register('reference')} placeholder="Reference du mouvement" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rapproche">Rapproche</Label>
              <Select value={currentRapproche ? 'oui' : 'non'} onValueChange={(val) => setValue('rapproche', val === 'oui')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oui">Oui</SelectItem>
                  <SelectItem value="non">Non</SelectItem>
                </SelectContent>
              </Select>
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
