import { Shield, AlertTriangle, Scale, Stethoscope, Users2 } from 'lucide-react'
import type { DonneesDeclarees } from '@/types'

const formatCurrency = (value: number) =>
  Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

interface ComplianceDashboardProps {
  complianceData: DonneesDeclarees
}

export function ComplianceDashboard({ complianceData }: ComplianceDashboardProps) {
  const diagCounts = complianceData?.diagnostics
    ? {
        valides: complianceData.diagnostics.filter(d => d.statut === 'valide').length,
        expires: complianceData.diagnostics.filter(d => d.statut !== 'valide').length,
      }
    : null

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {/* Syndic */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="size-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Syndic</span>
        </div>
        {complianceData.gouvernance ? (
          <p className="text-sm font-medium text-stone-900 dark:text-white truncate">
            {complianceData.gouvernance.syndic_nom}
          </p>
        ) : (
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Aucun contrat</p>
        )}
      </div>

      {/* Impayes */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="size-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Impayes</span>
        </div>
        <p className={`text-sm font-medium ${
          (complianceData.finances.total_impayes || 0) > 0
            ? 'text-red-600 dark:text-red-400'
            : 'text-stone-900 dark:text-white'
        }`}>
          {formatCurrency(complianceData.finances.total_impayes || 0)}
        </p>
      </div>

      {/* Diagnostics */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="size-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Diagnostics</span>
        </div>
        {diagCounts ? (
          <p className="text-sm font-medium text-stone-900 dark:text-white">
            <span className="text-green-600 dark:text-green-400">{diagCounts.valides}</span>
            {' '}valide(s)
            {diagCounts.expires > 0 && (
              <span className="text-red-600 dark:text-red-400"> / {diagCounts.expires} expire(s)</span>
            )}
          </p>
        ) : (
          <p className="text-sm text-stone-500 dark:text-stone-400">Aucun</p>
        )}
      </div>

      {/* Derniere AG */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
        <div className="flex items-center gap-2 mb-2">
          <Users2 className="size-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Derniere AG</span>
        </div>
        {complianceData.assemblee_generale ? (
          <p className="text-sm font-medium text-stone-900 dark:text-white">
            {new Date(complianceData.assemblee_generale.derniere_ag_date).toLocaleDateString('fr-FR')}
          </p>
        ) : (
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Aucune</p>
        )}
      </div>

      {/* Procedures */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="size-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Procedures</span>
        </div>
        {complianceData.procedures && complianceData.procedures.nombre_actives > 0 ? (
          <p className="text-sm font-medium text-stone-900 dark:text-white">
            {complianceData.procedures.nombre_actives} active(s)
          </p>
        ) : (
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Aucune</p>
        )}
      </div>
    </div>
  )
}
