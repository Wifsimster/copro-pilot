import { useRef } from 'react'
import { m, useInView } from 'motion/react'
import {
  Banknote,
  FileSpreadsheet,
  Puzzle,
  ArrowRight,
} from 'lucide-react'

const painPoints = [
  {
    icon: Banknote,
    pain: 'Votre syndic coûte trop cher ?',
    relief: 'CoproPilot démarre à 0 € : reprenez la gestion'
      + ' en syndic bénévole et économisez les honoraires.',
    accent: 'border-l-amber-400 dark:border-l-amber-500',
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: FileSpreadsheet,
    pain: 'Excel et papier partout ?',
    relief: 'Tout est centralisé dans une interface claire.'
      + ' Fini les fichiers perdus et les doublons.',
    accent: 'border-l-amber-400 dark:border-l-amber-500',
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: Puzzle,
    pain: 'Logiciels complexes faits pour les gros cabinets ?',
    relief: 'Conçu pour être simple, même sans formation.'
      + ' Opérationnel en 5 minutes.',
    accent: 'border-l-amber-400 dark:border-l-amber-500',
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
  },
]

export function PainReliefSection() {
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
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2
            className="font-display text-3xl sm:text-4xl
              font-semibold text-stone-900 dark:text-stone-50"
          >
            On connaît vos frustrations.
          </h2>
          <p
            className="mt-3 text-stone-500 dark:text-stone-400
              max-w-xl mx-auto"
          >
            Et on a construit exactement ce qu'il vous faut.
          </p>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {painPoints.map((item, index) => {
            const Icon = item.icon
            return (
              <m.div
                key={item.pain}
                initial={{ opacity: 0, y: 24 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : {}
                }
                transition={{
                  delay: index * 0.12,
                  duration: 0.5,
                }}
                className={`rounded-xl border-l-4 ${item.accent}
                  bg-white dark:bg-stone-900
                  border border-stone-200/60
                  dark:border-stone-800
                  p-6 transition-all hover:shadow-md
                  dark:hover:shadow-stone-950/50`}
              >
                <div className={`inline-flex size-10
                  items-center justify-center rounded-lg
                  ${item.iconBg} mb-4`}
                >
                  <Icon className={`size-5 ${item.iconColor}`} />
                </div>
                <h3
                  className="text-base font-semibold
                    text-stone-900 dark:text-white mb-2"
                >
                  {item.pain}
                </h3>
                <p
                  className="text-sm text-stone-500
                    dark:text-stone-400 leading-relaxed"
                >
                  {item.relief}
                </p>
                <div
                  className="mt-4 flex items-center gap-1.5
                    text-xs font-medium text-emerald-700
                    dark:text-emerald-400"
                >
                  Notre solution
                  <ArrowRight className="size-3" />
                </div>
              </m.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
