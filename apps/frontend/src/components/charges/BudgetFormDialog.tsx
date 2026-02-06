import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BudgetPrevisionnel } from '@/types'

const budgetSchema = z.object({
  annee: z.coerce.number().min(2000).max(2100),
  montant_total: z.coerce.number().min(0, 'Le montant doit etre positif'),
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
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      annee: defaultValues?.annee || new Date().getFullYear(),
      montant_total: defaultValues?.montant_total || 0,
      notes: defaultValues?.notes || '',
    },
  })

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
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="annee">Annee *</Label>
              <Input id="annee" type="number" {...register('annee')} />
              {errors.annee && <p className="mt-1 text-sm text-red-500">{errors.annee.message}</p>}
            </div>
            <div>
              <Label htmlFor="montant_total">Montant total (EUR) *</Label>
              <Input id="montant_total" type="number" step="0.01" {...register('montant_total')} placeholder="50000" />
              {errors.montant_total && <p className="mt-1 text-sm text-red-500">{errors.montant_total.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register('notes')} placeholder="Notes supplementaires..." />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
