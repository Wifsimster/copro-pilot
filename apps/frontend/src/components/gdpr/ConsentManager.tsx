import { useMyConsents, useRecordConsent } from '@/hooks/useGdpr'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const CONSENT_LABELS: Record<string, { label: string; description: string }> = {
  terms_of_service: {
    label: "Conditions d'utilisation",
    description: 'Acceptation des conditions générales du service.',
  },
  privacy_policy: {
    label: 'Politique de confidentialité',
    description: 'Acceptation de la politique de traitement des données.',
  },
  data_processing: {
    label: 'Traitement des données',
    description:
      'Consentement au traitement de vos données personnelles pour la gestion de copropriété.',
  },
  marketing_email: {
    label: 'Communications marketing',
    description: 'Recevoir des emails promotionnels et newsletters.',
  },
  analytics_cookies: {
    label: "Cookies d'analyse",
    description:
      "Autoriser les cookies d'analyse pour améliorer le service.",
  },
}

export function ConsentManager() {
  const { data: consents, isLoading } = useMyConsents()
  const recordConsent = useRecordConsent()

  const handleToggle = (consentType: string, granted: boolean) => {
    recordConsent.mutate({
      consent_type: consentType,
      granted,
      version: '1.0',
    })
  }

  const getConsentStatus = (type: string) => {
    if (!consents) return false
    const consent = consents.find(c => c.consent_type === type)
    return consent?.granted ?? false
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des consentements</CardTitle>
        <CardDescription>
          Gérez vos préférences de consentement. Les consentements
          obligatoires ne peuvent pas être désactivés tant que votre
          compte est actif.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(CONSENT_LABELS).map(
          ([type, { label, description }]) => (
            <div
              key={type}
              className="flex items-center justify-between gap-4 rounded-lg border p-4"
            >
              <div className="space-y-0.5">
                <Label className="text-base">{label}</Label>
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
              <Switch
                checked={getConsentStatus(type)}
                onCheckedChange={checked =>
                  handleToggle(type, checked)
                }
                disabled={recordConsent.isPending}
              />
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
