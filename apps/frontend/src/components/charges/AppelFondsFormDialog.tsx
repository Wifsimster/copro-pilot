import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Receipt, CalendarDays } from 'lucide-react'
import { Input } from '@/components/ui/input'
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
import type { AppelFonds } from '@/types'

const appelSchema = z.object({
  trimestre: z.coerce.number().min(1).max(4),
  annee: z.coerce.number().min(2000).max(2100),
  montant_total: z.coerce.number().min(0, 'Le montant doit être positif'),
  date_emission: z.string().min(1, 'La date est obligatoire'),
  date_echeance: z.string().min(1, 'La date est obligatoire'),
})

type AppelFormData = z.infer<typeof appelSchema>

interface AppelFondsFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<AppelFonds>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<AppelFonds>
  title?: string
}

export function AppelFondsFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvel appel de fonds',
}: AppelFondsFormDialogProps) {
  const now = new Date()
  const defaultTrimestre = Math.ceil((now.getMonth() + 1) / 3)

  const form = useForm<AppelFormData>({
    resolver: zodResolver(appelSchema),
    defaultValues: {
      trimestre: defaultValues?.trimestre || defaultTrimestre,
      annee: defaultValues?.annee || now.getFullYear(),
      montant_total: defaultValues?.montant_total || 0,
      date_emission: defaultValues?.date_emission || now.toISOString().split('T')[0],
      date_echeance: defaultValues?.date_echeance || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  })

  const handleFormSubmit = async (data: AppelFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Creez un appel de fonds trimestriel. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="md"
    >
      <FormSection icon={Receipt} label="Periode et montant">
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="trimestre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trimestre *</FormLabel>
                <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">T1</SelectItem>
                    <SelectItem value="2">T2</SelectItem>
                    <SelectItem value="3">T3</SelectItem>
                    <SelectItem value="4">T4</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="annee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annee *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="montant_total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant (EUR) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="12500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={CalendarDays} label="Dates">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_emission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'emission *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_echeance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'echeance *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>
    </FormDialog>
  )
}
