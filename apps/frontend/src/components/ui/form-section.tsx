import type { LucideIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface FormSectionProps {
  icon: LucideIcon
  label: string
  children: React.ReactNode
}

export function FormSection({ icon: Icon, label, children }: FormSectionProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4" />
          <span>{label}</span>
        </div>
        {children}
      </div>
      <Separator />
    </>
  )
}
