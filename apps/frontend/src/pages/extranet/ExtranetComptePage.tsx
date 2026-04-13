import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useExtranetCompte, EXTRANET_KEY } from '@/hooks/useExtranet'
import {
  useCreateCheckoutSession,
  useConfirmPayment,
} from '@/hooks/useExtranetPayments'
import { formatEur, StatCard } from '@/components/extranet/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreditCard } from 'lucide-react'

export default function ExtranetComptePage() {
  const { data: compte, isLoading } = useExtranetCompte()
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const createCheckout = useCreateCheckoutSession()
  const confirmPayment = useConfirmPayment()

  // Prevent running the post-return confirmation twice (React strict mode)
  const confirmedRef = useRef(false)

  const solde = compte ? Number(compte.solde) : 0
  const isDebiteur = solde > 0

  // Handle return from Stripe Checkout
  useEffect(() => {
    if (confirmedRef.current) return

    const hash = window.location.hash
    const queryIndex = hash.indexOf('?')
    if (queryIndex === -1) return

    const params = new URLSearchParams(hash.slice(queryIndex + 1))
    const status = params.get('payment')
    const sessionId = params.get('session_id')

    if (status === 'canceled') {
      confirmedRef.current = true
      toast.info('Paiement annule')
      const cleanHash = hash.slice(0, queryIndex)
      window.history.replaceState(null, '', cleanHash || '#/')
      return
    }

    if (status === 'success' && sessionId) {
      confirmedRef.current = true
      confirmPayment
        .mutateAsync(sessionId)
        .then(() => {
          toast.success('Paiement enregistre avec succes')
          queryClient.invalidateQueries({ queryKey: EXTRANET_KEY })
        })
        .catch((err: Error) => {
          toast.error(
            err?.message ||
              'Impossible de confirmer le paiement. Il sera enregistre automatiquement.'
          )
        })
        .finally(() => {
          const cleanHash = hash.slice(0, queryIndex)
          window.history.replaceState(null, '', cleanHash || '#/')
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOpen = () => {
    setError('')
    setAmount(isDebiteur ? solde.toFixed(2) : '')
    setOpen(true)
  }

  const handleSubmit = async () => {
    setError('')
    const numeric = Number(amount.replace(',', '.'))
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError('Veuillez saisir un montant valide')
      return
    }
    if (numeric >= 10000) {
      setError('Le montant doit etre inferieur a 10 000 €')
      return
    }
    try {
      await createCheckout.mutateAsync({
        amount: numeric,
        description: 'Reglement du solde coproprietaire',
      })
      // On success the hook redirects to Stripe — nothing else to do.
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de lancer le paiement'
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mon compte</h1>
          <p className="text-muted-foreground">
            Etat de votre compte coproprietaire
          </p>
        </div>
        {isDebiteur && (
          <Button onClick={handleOpen}>
            <CreditCard className="mr-2 size-4" />
            Regler mon solde
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse h-32 rounded bg-muted" />
      ) : !compte ? (
        <p className="text-sm text-muted-foreground">
          Aucune donnee.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total appele"
              value={formatEur(compte.total_du)}
            />
            <StatCard
              label="Total paye"
              value={formatEur(compte.total_paye)}
            />
            <StatCard
              label="Solde"
              value={formatEur(Number(compte.solde))}
              color={
                Number(compte.solde) > 0
                  ? 'text-red-600'
                  : Number(compte.solde) < 0
                    ? 'text-green-600'
                    : undefined
              }
            />
          </div>
          {isDebiteur && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
              Vous avez un solde debiteur de{' '}
              {formatEur(Number(compte.solde))}. Merci de
              regulariser votre situation.
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Regler mon solde
            </DialogTitle>
            <DialogDescription>
              Saisissez le montant que vous souhaitez regler. Vous
              serez redirige vers la page de paiement securisee
              Stripe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Montant (€)</Label>
              <Input
                id="payment-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createCheckout.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createCheckout.isPending}
            >
              {createCheckout.isPending
                ? 'Redirection...'
                : 'Payer avec Stripe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
