import { KeyRound, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OTPInput } from '@/components/auth/OTPInput'

type FirstLoginOtpStepProps = {
  email: string
  otp: string
  error: string
  isLoading: boolean
  onOtpChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onResend: () => void
}

export function FirstLoginOtpStep({
  email,
  otp,
  error,
  isLoading,
  onOtpChange,
  onSubmit,
  onResend,
}: FirstLoginOtpStepProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <KeyRound className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">
          Code de vérification
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Un code à 6 chiffres a été envoyé à{' '}
        <strong>{email}</strong>. Il est valable 15
        minutes.
      </p>

      <OTPInput
        value={otp}
        onChange={v => onOtpChange(v)}
        disabled={isLoading}
      />

      {error && (
        <p className="text-sm text-destructive text-center">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full h-10"
        disabled={isLoading || otp.length < 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Vérification…
          </>
        ) : (
          'Vérifier'
        )}
      </Button>

      <button
        type="button"
        className="w-full text-sm text-primary hover:underline"
        onClick={onResend}
        disabled={isLoading}
      >
        Renvoyer le code
      </button>
    </form>
  )
}
