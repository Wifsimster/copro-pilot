import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calculator, FileText } from 'lucide-react'
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
import type { BudgetPrevisionnel } from '@/types'

const budgetSchema = z.object({
  annee: z.coerce.number().min(2000).max(2100),
  montant_total: z.coerce.number().min(0, 'Le montant doit etre positif'),
  statut: z.enum(['brouillon', 'vote', 'approuve']),
  notes: z.string().optional(),
})

type BudgetFormData = z.infer<typeof budgetSchema>

interface BudgetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<BudgetPrevisionnel>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<BudgetPrevisionnel>
  title?: string
}

export function BudgetFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau budget',
}: BudgetFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      annee: defaultValues?.annee || new Date().getFullYear(),
      montant_total: defaultValues?.montant_total || 0,
      statut: defaultValues?.statut || 'brouillon',
      notes: defaultValues?.notes || '',
    },
  })

  const currentStatut = watch('statut')

  const handleFormSubmit = async (data: BudgetFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
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
            Definissez le budget previsionnel. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Budget section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calculator className="size-4" />
              <span>Budget</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annee">Annee *</Label>
                <Input id="annee" type="number" {...register('annee')} />
                {errors.annee && (
                  <p className="text-sm text-destructive">{errors.annee.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="montant_total">Montant total (EUR) *</Label>
                <Input id="montant_total" type="number" step="0.01" {...register('montant_total')} placeholder="50000" />
                {errors.montant_total && (
                  <p className="text-sm text-destructive">{errors.montant_total.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut *</Label>
              <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as BudgetFormData['statut'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="vote">Vote</SelectItem>
                  <SelectItem value="approuve">Approuve</SelectItem>
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
              <Textarea rows={3} {...register('notes')} placeholder="Notes supplementaires..." />
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
