import type { FieldValues, UseFormReturn } from 'react-hook-form'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

interface FormSheetProps<T extends FieldValues> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  form: UseFormReturn<T>
  onSubmit: (data: T) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
  loadingLabel?: string
  children: React.ReactNode
}

export function FormSheet<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  form,
  onSubmit,
  isLoading,
  submitLabel = 'Enregistrer',
  loadingLabel = 'Enregistrement...',
  children,
}: FormSheetProps<T>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && (
            <SheetDescription>{description}</SheetDescription>
          )}
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-5 px-4"
          >
            {children}
            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? loadingLabel : submitLabel}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
