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
    coproPilot: 'À partir de 0 EUR',
    traditional: '3 - 8 EUR',
    excel: '0 EUR',
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
      <span
        className="inline-flex items-center justify-center
          size-7 rounded-full bg-emerald-50
          dark:bg-emerald-950/40"
      >
        <Check
          className="size-4 text-emerald-600
            dark:text-emerald-400"
        />
      </span>
    )
  }
  if (value === 'no') {
    return (
      <span
        className="inline-flex items-center justify-center
          size-7 rounded-full bg-red-50 dark:bg-red-950/30"
      >
        <X className="size-4 text-red-400 dark:text-red-500" />
      </span>
    )
  }
  if (value === 'partial') {
    return (
      <span
        className="inline-flex items-center justify-center
          size-7 rounded-full bg-amber-50
          dark:bg-amber-950/30"
      >
        <Minus
          className="size-4 text-amber-500
            dark:text-amber-400"
        />
      </span>
    )
  }
  return (
    <span className="text-sm text-stone-700 dark:text-stone-300">
      {value}
    </span>
  )
}

export function ComparisonSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      className="py-20 sm:py-28 bg-[#FAF8F5]
        dark:bg-stone-950"
    >
      <div
        ref={ref}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2
            className="font-display text-3xl sm:text-4xl
              font-semibold text-stone-900
              dark:text-stone-50"
          >
            Pourquoi CoproPilot ?
          </h2>
          <p
            className="mt-3 text-stone-500
              dark:text-stone-400 max-w-2xl mx-auto"
          >
            Comparez objectivement avec les alternatives
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="overflow-x-auto rounded-xl border
            border-stone-200/60 dark:border-stone-800
            bg-white dark:bg-stone-900"
        >
          <table className="w-full min-w-[540px]">
            <thead>
              <tr
                className="border-b border-stone-200
                  dark:border-stone-800"
              >
                <th
                  className="py-4 pl-6 pr-4 text-left text-sm
                    font-medium text-stone-400
                    dark:text-stone-500 w-1/4"
                />
                <th className="py-4 px-4 text-center">
                  <span
                    className="inline-flex items-center gap-1.5
                      text-sm font-bold text-emerald-700
                      dark:text-emerald-400"
                  >
                    <span
                      className="size-2 rounded-full
                        bg-emerald-500"
                    />
                    CoproPilot
                  </span>
                </th>
                <th
                  className="py-4 px-4 text-center text-sm
                    font-medium text-stone-400
                    dark:text-stone-500"
                >
                  Logiciels traditionnels
                </th>
                <th
                  className="py-4 pr-6 pl-4 text-center text-sm
                    font-medium text-stone-400
                    dark:text-stone-500"
                >
                  Excel / Papier
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`transition-colors ${
                    i % 2 === 0
                      ? 'bg-stone-50/50 dark:bg-stone-950/30'
                      : ''
                  }`}
                >
                  <td
                    className="py-3.5 pl-6 pr-4 text-sm
                      font-medium text-stone-700
                      dark:text-stone-300"
                  >
                    {row.feature}
                  </td>
                  <td
                    className="py-3.5 px-4 text-center
                      bg-emerald-50/30
                      dark:bg-emerald-950/10"
                  >
                    <CellValue value={row.coproPilot} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <CellValue value={row.traditional} />
                  </td>
                  <td className="py-3.5 pr-6 pl-4 text-center">
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
