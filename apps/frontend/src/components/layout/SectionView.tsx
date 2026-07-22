import { Link } from 'react-router-dom'
import { Collapsible } from 'radix-ui'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { isItemActive, type NavItem, type NavSection } from './navigation'

function NavItemLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  onNavigate: () => void
}) {
  const active = isItemActive(pathname, item.href)
  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <item.icon className="size-4" />
      {item.name}
    </Link>
  )
}

export function SectionView({
  section,
  pathname,
  isOpen,
  onToggle,
  onNavigate,
}: {
  section: NavSection
  pathname: string
  isOpen: boolean
  onToggle: () => void
  onNavigate: () => void
}) {
  const items = section.items.map(item => (
    <NavItemLink
      key={item.name}
      item={item}
      pathname={pathname}
      onNavigate={onNavigate}
    />
  ))

  if (!section.collapsible) {
    return (
      <div className="space-y-0.5">
        <div className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {section.label}
        </div>
        {items}
      </div>
    )
  }

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={onToggle}
      data-tour={`section-${section.key}`}
    >
      <Collapsible.Trigger className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
        {section.label}
        <ChevronRight
          className={cn(
            'size-3.5 transition-transform duration-200',
            isOpen && 'rotate-90'
          )}
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-[collapsible-up_150ms_ease-out] data-[state=open]:animate-[collapsible-down_150ms_ease-out]">
        <div className="space-y-0.5 pt-0.5">{items}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
