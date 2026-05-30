import type { Control } from 'react-hook-form'
import { FormSection } from '@/components/ui/form-section'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Info } from 'lucide-react'
import { CATEGORIE_LABELS, PRIORITE_LABELS } from './constants'
import type { TicketFormData } from './schemas'

export function TicketCreateFields({
  control,
}: {
  control: Control<TicketFormData>
}) {
  return (
    <FormSection icon={Info} label="Informations">
      <FormField
        control={control}
        name="sujet"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sujet</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Sujet du ticket" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="categorie"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categorie</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(CATEGORIE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="priorite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priorite</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(PRIORITE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  )
}
