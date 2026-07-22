import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Fil d'ariane" className="flex items-center gap-1 text-sm text-muted-foreground">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <span key={item.href ?? item.label} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            {isLast || !item.href ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
