import { Building2 } from 'lucide-react'

export function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Building2 className="size-5" />
            <span className="text-sm font-medium">
              CoproPilot &copy; {year}
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <a
              href="/#/politique-confidentialite"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Confidentialité
            </a>
            <a
              href="mailto:contact@copropilot.fr"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Contact
            </a>
            <a
              href="https://github.com/Wifsimster/immo-ia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
