import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Quote } from 'lucide-react'

interface Testimonial {
  quote: string
  name: string
  role: string
  initials: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Avant CoproPilot, je passais mes dimanches sur Excel. Maintenant tout est centralisé et je gère ma copropriété en quelques clics.",
    name: 'Marie D.',
    role: 'Syndic bénévole, 24 lots',
    initials: 'MD',
  },
  {
    quote:
      "On payait 5 €/lot/mois avec notre ancien logiciel. CoproPilot nous fait économiser plus de 2 000 € par an pour un service équivalent.",
    name: 'Jean-Pierre L.',
    role: 'Syndic professionnel, 8 copropriétés',
    initials: 'JL',
  },
  {
    quote:
      "L'interface est tellement intuitive que même les membres du conseil syndical l'utilisent. Aucune formation nécessaire.",
    name: 'Sophie R.',
    role: 'Présidente du conseil syndical, 36 lots',
    initials: 'SR',
  },
]

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Retours de nos bêta-testeurs
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Ils gèrent déjà leur copropriété avec CoproPilot
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6"
            >
              <Quote className="size-8 text-primary/20 mb-4" />
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {t.quote}
              </p>
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {t.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
