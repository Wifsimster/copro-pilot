import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Banknote, FileSpreadsheet, Puzzle } from 'lucide-react'

const painPoints = [
  {
    icon: Banknote,
    pain: 'Votre syndic professionnel coûte trop cher ?',
    relief: 'CoproPilot démarre à 0 € et reste 10x moins cher.',
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
  {
    icon: FileSpreadsheet,
    pain: 'Excel et papier pour gérer votre copropriété ?',
    relief: 'Tout est centralisé dans une interface claire et moderne.',
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    icon: Puzzle,
    pain: 'Logiciels complexes faits pour les gros cabinets ?',
    relief: 'Conçu pour être simple, même sans formation.',
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
]

export function PainReliefSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-950">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {painPoints.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.pain}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`rounded-xl ${item.bg} p-6`}
              >
                <Icon className={`size-8 ${item.color} mb-4`} />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                  {item.pain}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {item.relief}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
