import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Check, X, Minus } from 'lucide-react'

interface ComparisonRow {
  feature: string
  coproPilot: 'yes' | 'no' | 'partial' | string
  traditional: 'yes' | 'no' | 'partial' | string
  excel: 'yes' | 'no' | 'partial' | string
}

const rows: ComparisonRow[] = [
  {
    feature: 'Prix moyen / lot / mois',
    coproPilot: 'À partir de 0 €',
    traditional: '3 – 8 €',
    excel: '0 €',
  },
  {
    feature: 'Mise en place',
    coproPilot: '5 minutes',
    traditional: 'Formation requise',
    excel: 'Des heures',
  },
  {
    feature: 'Interface moderne',
    coproPilot: 'yes',
    traditional: 'no',
    excel: 'no',
  },
  {
    feature: 'Comptabilité réglementaire',
    coproPilot: 'yes',
    traditional: 'yes',
    excel: 'no',
  },
  {
    feature: 'Gestion des AG',
    coproPilot: 'yes',
    traditional: 'yes',
    excel: 'no',
  },
  {
    feature: 'Notifications temps réel',
    coproPilot: 'yes',
    traditional: 'partial',
    excel: 'no',
  },
  {
    feature: 'Sans engagement',
    coproPilot: 'yes',
    traditional: 'no',
    excel: 'yes',
  },
  {
    feature: 'Données hébergées en France',
    coproPilot: 'yes',
    traditional: 'partial',
    excel: 'no',
  },
]

function CellValue({ value }: { value: string }) {
  if (value === 'yes') {
    return (
      <span className="inline-flex items-center justify-center size-6 rounded-full bg-green-100 dark:bg-green-950/50">
        <Check className="size-4 text-green-600 dark:text-green-400" />
      </span>
    )
  }
  if (value === 'no') {
    return (
      <span className="inline-flex items-center justify-center size-6 rounded-full bg-red-100 dark:bg-red-950/50">
        <X className="size-4 text-red-500 dark:text-red-400" />
      </span>
    )
  }
  if (value === 'partial') {
    return (
      <span className="inline-flex items-center justify-center size-6 rounded-full bg-amber-100 dark:bg-amber-950/50">
        <Minus className="size-4 text-amber-500 dark:text-amber-400" />
      </span>
    )
  }
  return (
    <span className="text-sm text-slate-700 dark:text-slate-300">
      {value}
    </span>
  )
}

export function ComparisonSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-950">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Pourquoi CoproPilot ?
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Comparez objectivement avec les alternatives du marché
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 pr-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400 w-1/4" />
                <th className="py-3 px-4 text-center">
                  <span className="text-sm font-bold text-primary">
                    CoproPilot
                  </span>
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                  Logiciels traditionnels
                </th>
                <th className="py-3 pl-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                  Excel / Papier
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={
                    i % 2 === 0
                      ? 'bg-slate-50/50 dark:bg-slate-900/50'
                      : ''
                  }
                >
                  <td className="py-3 pr-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {row.feature}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CellValue value={row.coproPilot} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CellValue value={row.traditional} />
                  </td>
                  <td className="py-3 pl-4 text-center">
                    <CellValue value={row.excel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  )
}
