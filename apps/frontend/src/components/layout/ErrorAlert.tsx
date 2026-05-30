import { AlertCircle } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ErrorAlertProps {
  error: Error | null
  message?: string
  onRetry?: () => void
}

export function ErrorAlert({
  error,
  message,
  onRetry,
}: ErrorAlertProps) {
  if (!error) return null

  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>
        {message ?? 'Une erreur est survenue'}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>{error.message}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
          >
            Reessayer
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
