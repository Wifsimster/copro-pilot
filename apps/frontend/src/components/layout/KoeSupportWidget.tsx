import { KoeWidget } from '@wifsimster/koe'
import '@wifsimster/koe/style.css'
import { useAuthStore } from '@/store/authStore'

interface KoeSupportWidgetProps {
  /**
   * When incremented, the widget is remounted with `defaultOpen={true}`,
   * effectively opening the panel from an external trigger (user menu).
   */
  openSignal: number
}

export function KoeSupportWidget({ openSignal }: KoeSupportWidgetProps) {
  const user = useAuthStore(state => state.user)

  const projectKey = import.meta.env.VITE_KOE_PROJECT_KEY as string | undefined
  const apiUrl = import.meta.env.VITE_KOE_API_URL as string | undefined

  if (!projectKey) return null

  const widgetUser = user
    ? {
        id: user.id,
        name: `${user.firstname} ${user.lastname}`.trim() || user.email,
        email: user.email,
        metadata: { role: user.role },
      }
    : undefined

  return (
    <KoeWidget
      key={openSignal}
      projectKey={projectKey}
      apiUrl={apiUrl}
      user={widgetUser}
      position="bottom-right"
      defaultOpen={openSignal > 0}
      theme={{ accentColor: '#059669', mode: 'auto' }}
      locale={{
        launcherLabel: 'Support & retours',
        title: 'Support CoproPilot',
        subtitle: 'Signaler un bug ou proposer une idée',
      }}
    />
  )
}
