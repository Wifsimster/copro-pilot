import {  } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarDays, MapPin, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import type { AssembleeGenerale } from '@/types'

const agSchema = z.object({
  date: z.string().min(1, 'La date est obligatoire'),
  heure: z.string().optional(),
  lieu: z.string().optional(),
  type: z.enum(['ordinaire', 'extraordinaire']),
  ordre_du_jour: z.string().optional(),
})

type AGFormData = z.infer<typeof agSchema>

interface AssembleeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<AssembleeGenerale>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<AssembleeGenerale>
  title?: string
}

export function AssembleeFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle assemblée générale',
}: AssembleeFormDialogProps) {
  const form = useForm<AGFormData>({
    resolver: zodResolver(agSchema),
    values: {
      date: defaultValues?.date || '',
      heure: defaultValues?.heure || '',
      lieu: defaultValues?.lieu || '',
      type: defaultValues?.type || 'ordinaire',
      ordre_du_jour: defaultValues?.ordre_du_jour || '',
    },
  })

  
  const handleFormSubmit = async (data: AGFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      heure: data.heure || null,
      lieu: data.lieu || null,
      ordre_du_jour: data.ordre_du_jour || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Planifiez une assemblée générale. Les champs marqués d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="md"
    >
      <FormSection icon={CalendarDays} label="Date et type">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="heure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ordinaire">Ordinaire</SelectItem>
                    <SelectItem value="extraordinaire">Extraordinaire</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lieu"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  Lieu
                </FormLabel>
                <FormControl>
                  <Input placeholder="Salle des fetes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={FileText} label="Ordre du jour">
        <FormField
          control={form.control}
          name="ordre_du_jour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordre du jour</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Points a l'ordre du jour..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
