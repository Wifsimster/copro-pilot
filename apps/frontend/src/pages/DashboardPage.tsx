import { Building2, Users, AlertTriangle, Calendar } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { label: 'Copropriétés', value: '0', icon: Building2, color: 'bg-blue-500' },
    { label: 'Copropriétaires', value: '0', icon: Users, color: 'bg-green-500' },
    { label: 'Incidents ouverts', value: '0', icon: AlertTriangle, color: 'bg-orange-500' },
    { label: 'Prochaines AG', value: '0', icon: Calendar, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tableau de bord
        </h1>
        <p className="text-gray-500 dark:text-zinc-400">
          Vue d'ensemble de vos copropriétés
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bienvenue sur ImmoIA
        </h2>
        <p className="mt-2 text-gray-500 dark:text-zinc-400">
          Cette plateforme vous permet de gérer l'ensemble de vos copropriétés :
          lots, copropriétaires, charges, assemblées générales, travaux et documents.
        </p>
      </div>
    </div>
  )
}
