import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Loader2,
} from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  actions?: (item: T) => React.ReactNode
  onRowClick?: (item: T) => void
}

type SortDirection = 'asc' | 'desc' | null

function getNestedValue(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce(
      (acc, key) =>
        acc != null && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj
    )
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  searchable = false,
  searchPlaceholder = 'Rechercher...',
  emptyMessage = 'Aucun element trouve',
  actions,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(null)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortKey(null)
        setSortDirection(null)
      }
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const filtered = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter(item =>
      columns.some(() => {
        const values = Object.values(
          item as Record<string, unknown>
        )
        return values.some(
          v =>
            typeof v === 'string' &&
            v.toLowerCase().includes(q)
        )
      })
    )
  }, [data, search, columns])

  const sorted = useMemo(() => {
    if (!sortKey || !sortDirection) return filtered
    return filtered.toSorted((a, b) => {
      const aVal = getNestedValue(a, sortKey)
      const bVal = getNestedValue(b, sortKey)

      if (aVal == null && bVal == null) return 0
      if (aVal == null) return sortDirection === 'asc' ? 1 : -1
      if (bVal == null) return sortDirection === 'asc' ? -1 : 1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc'
          ? aVal - bVal
          : bVal - aVal
      }

      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      const cmp = aStr.localeCompare(bStr)
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDirection])

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) {
      return (
        <ChevronsUpDown className="ml-1 inline-block size-3.5 text-muted-foreground/50" />
      )
    }
    if (sortDirection === 'asc') {
      return (
        <ChevronUp className="ml-1 inline-block size-3.5" />
      )
    }
    return (
      <ChevronDown className="ml-1 inline-block size-3.5" />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead key={col.key} className={col.className}>
                {col.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.header}
                    {renderSortIcon(col.key)}
                  </Button>
                ) : (
                  col.header
                )}
              </TableHead>
            ))}
            {actions && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((item, index) => (
              <TableRow
                key={index}
                className={
                  onRowClick ? 'cursor-pointer' : undefined
                }
                onClick={() => onRowClick?.(item)}
              >
                {columns.map(col => (
                  <TableCell
                    key={col.key}
                    className={col.className}
                  >
                    {col.render
                      ? col.render(item)
                      : (String(
                          getNestedValue(item, col.key) ?? ''
                        ) as string)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell>{actions(item)}</TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
