import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

interface Testimonial {
  quote: string
  name: string
  role: string
  initials: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Je suis passee de 3 tableurs Excel a un seul outil."
      + " Honnetement, c'est pas parfait sur tout, mais pour"
      + " les appels de fonds et le suivi des charges, ca m'a"
      + " change la vie. Je gagnais facile 2h par semaine.",
    name: 'Nathalie M.',
    role: 'Syndic benevole, 18 lots',
    initials: 'NM',
  },
  {
    quote:
      "Notre ancien logiciel nous coutait 4,50 EUR/lot/mois et"
      + " l'interface datait de 2010. On a bascule nos 5 petites"
      + " copros sur CoproPilot, le plus dur c'etait la reprise"
      + " des donnees. Depuis, les coproprietaires ont acces a"
      + " leurs documents en ligne.",
    name: 'Frederic B.',
    role: 'Syndic professionnel, 5 coproprietes',
    initials: 'FB',
  },
  {
    quote:
      "Mon mari est president du CS et c'est lui qui m'en a"
      + " parle. J'ai cree mon compte en 5 minutes, je vois les"
      + " PV d'AG, les budgets votes, l'etat de nos charges."
      + " Avant il fallait redemander au syndic a chaque fois.",
    name: 'Catherine L.',
    role: 'Coproprietaire, residence de 42 lots',
    initials: 'CL',
  },
]

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      className="py-20 sm:py-28 bg-white dark:bg-stone-900"
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
          <p
            className="text-sm font-semibold uppercase
              tracking-widest text-amber-600
              dark:text-amber-400 mb-3"
          >
            Temoignages
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl
              font-semibold text-stone-900
              dark:text-stone-50"
          >
            Ils gerent deja avec CoproPilot
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: index * 0.12,
                duration: 0.5,
              }}
              className="relative rounded-xl border
                border-stone-200/60 dark:border-stone-800
                bg-[#FAF8F5] dark:bg-stone-950 p-6
                transition-shadow hover:shadow-md
                dark:hover:shadow-stone-950/50"
            >
              {/* Oversized quotation mark */}
              <span
                className="absolute -top-3 left-5
                  font-display text-6xl leading-none
                  text-emerald-600/10 dark:text-emerald-400/10
                  select-none pointer-events-none"
              >
                &ldquo;
              </span>

              <p
                className="relative text-sm text-stone-600
                  dark:text-stone-400 leading-relaxed mb-6
                  italic"
              >
                {t.quote}
              </p>

              <div
                className="flex items-center gap-3 border-t
                  border-stone-200/60 dark:border-stone-800
                  pt-4"
              >
                <div
                  className="flex size-10 items-center
                    justify-center rounded-full
                    bg-emerald-700 dark:bg-emerald-600
                    text-white text-xs font-bold
                    tracking-wider"
                >
                  {t.initials}
                </div>
                <div>
                  <div
                    className="text-sm font-semibold
                      text-stone-900 dark:text-white"
                  >
                    {t.name}
                  </div>
                  <div
                    className="text-xs text-stone-400
                      dark:text-stone-500"
                  >
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
