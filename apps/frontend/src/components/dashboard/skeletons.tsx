import { Card, CardContent } from '@/components/ui/card'

export function StatCardSkeleton() {
  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="size-10 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-6 w-12 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="py-0">
      <div className="flex items-center justify-between border-b p-4">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </div>
            <div className="ml-3">
              <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
