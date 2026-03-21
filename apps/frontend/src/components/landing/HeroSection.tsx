import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  Building2,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Bell,
} from 'lucide-react'

function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto lg:mx-0"
    >
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/50 p-3 text-center">
            <Building2 className="size-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              12
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Copropriétés
            </div>
          </div>
          <div className="rounded-xl bg-orange-50 dark:bg-orange-950/50 p-3 text-center">
            <AlertTriangle className="size-5 mx-auto text-orange-600 dark:text-orange-400 mb-1" />
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              3
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Incidents
            </div>
          </div>
          <div className="rounded-xl bg-green-50 dark:bg-green-950/50 p-3 text-center">
            <Calendar className="size-5 mx-auto text-green-600 dark:text-green-400 mb-1" />
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              15 mars
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Prochaine AG
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Tâches en cours
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 p-2.5">
            <CheckCircle className="size-4 text-green-500 shrink-0" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Relancer devis plomberie
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 p-2.5">
            <CheckCircle className="size-4 text-slate-300 dark:text-slate-600 shrink-0" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Envoyer PV assemblée
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 p-2.5">
          <Bell className="size-4 text-orange-500 shrink-0" />
          <span className="text-xs text-orange-700 dark:text-orange-300">
            2 paiements en attente de validation
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function HeroSection() {
  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-950/50 px-4 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 mb-6"
            >
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-500" />
              </span>
              Gratuit pour démarrer
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.5 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight"
            >
              Gérez vos copropriétés{' '}
              <span className="text-primary">simplement.</span>
              <br />
              <span className="text-green-600 dark:text-green-400">
                10x moins cher.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0"
            >
              L'outil moderne pour syndics bénévoles et professionnels.
              Opérationnel en 5 minutes, sans installation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white text-base px-8 h-12"
              >
                <a href="/#/login">Essayer gratuitement</a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base h-12"
                onClick={() => scrollToSection('tarifs')}
              >
                Voir les tarifs
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 text-sm text-slate-500 dark:text-slate-500"
            >
              Sans engagement · Sans carte bancaire · Données hébergées en
              France
            </motion.p>
          </div>

          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}
