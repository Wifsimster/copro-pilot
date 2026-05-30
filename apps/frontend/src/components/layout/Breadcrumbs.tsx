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
    <nav aria-label="Fil d'ariane" className="flex items-center gap-1 text-sm text-stone-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="size-3.5 shrink-0 text-stone-400" aria-hidden="true" />
            )}
            {isLast || !item.href ? (
              <span className="font-medium text-stone-900 dark:text-white" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="transition-colors hover:text-stone-900 dark:hover:text-white"
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
