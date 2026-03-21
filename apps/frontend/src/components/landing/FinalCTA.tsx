import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Button } from '@/components/ui/button'

export function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="bg-slate-900 dark:bg-slate-950 py-16 sm:py-24">
      <div
        ref={ref}
        className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-white"
        >
          Pret a simplifier votre gestion ?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-4 text-lg text-slate-400"
        >
          Rejoignez les syndics qui ont choisi la simplicite
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8"
        >
          <Button
            asChild
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white text-base px-10 h-12"
          >
            <a href="/#/login">Essayer gratuitement</a>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 text-sm text-slate-500"
        >
          Une question ? Contactez-nous a{' '}
          <a
            href="mailto:contact@copropilot.fr"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            contact@copropilot.fr
          </a>
        </motion.p>
      </div>
    </section>
  )
}
