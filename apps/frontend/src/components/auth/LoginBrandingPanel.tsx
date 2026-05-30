import {
  Building2,
  Shield,
  KeyRound,
  Users,
  BarChart3,
} from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()

const features = [
  { icon: Shield, title: 'Sécurisé', desc: 'Données chiffrées et protégées' },
  { icon: BarChart3, title: 'Comptabilité', desc: 'Budgets, appels de fonds, paiements' },
  { icon: Users, title: 'Assemblées', desc: 'Gestion des AG et résolutions' },
  { icon: KeyRound, title: 'Multi-accès', desc: 'Syndics, copropriétaires, locataires' },
]

export default function LoginBrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative overflow-hidden bg-stone-900 dark:bg-stone-950 text-white flex-col justify-between p-10">
      {/* Decorative gradient orbs — matching landing page */}
      <div className="absolute -top-24 -left-24 size-96 rounded-full bg-emerald-600/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 size-[500px] rounded-full bg-amber-600/8 blur-3xl" />
      <div className="absolute top-1/2 left-1/3 size-64 rounded-full bg-emerald-500/5 blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-700">
            <Building2 className="size-6" />
          </div>
          <span className="font-display text-2xl font-semibold tracking-tight">CoproPilot</span>
        </div>
        <p className="text-stone-400 text-sm mt-1">
          Plateforme de gestion de copropriété
        </p>
      </div>

      <div className="relative z-10 space-y-8">
        <h2 className="font-display text-3xl font-semibold leading-tight">
          Simplifiez la gestion <br />
          <span className="italic text-emerald-400">de vos copropriétés</span>
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl bg-white/5 p-4 space-y-2 border border-stone-700/60"
            >
              <f.icon className="size-5 text-emerald-400" />
              <p className="font-semibold text-sm">{f.title}</p>
              <p className="text-xs text-stone-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-10 text-xs text-stone-500">
        &copy; {CURRENT_YEAR} CoproPilot. Tous droits réservés. &middot; v{__APP_VERSION__}
      </p>
    </div>
  )
}
