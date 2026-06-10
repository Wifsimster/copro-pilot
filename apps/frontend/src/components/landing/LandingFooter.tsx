import { Building2 } from 'lucide-react'

export function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="py-8 bg-stone-950 border-t
        border-stone-800/60"
    >
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <p
          className="font-display text-center text-lg
            text-stone-300 mb-6"
        >
          La gestion de copropriété, simple et 10&times;
          moins chère.
        </p>
        <div
          className="flex flex-col sm:flex-row items-center
            justify-between gap-4"
        >
          <div
            className="flex items-center gap-2.5
              text-stone-500"
          >
            <div
              className="flex size-7 items-center
                justify-center rounded-md
                bg-emerald-700/20"
            >
              <Building2
                className="size-4 text-emerald-500"
              />
            </div>
            <span className="text-sm font-medium font-display">
              CoproPilot &copy; {year}
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a
              href="/vs/logiciels-traditionnels"
              className="text-sm text-stone-500
                hover:text-stone-300 transition-colors"
            >
              Comparatif
            </a>
            <a
              href="/securite"
              className="text-sm text-stone-500
                hover:text-stone-300 transition-colors"
            >
              Sécurité
            </a>
            <a
              href="/politique-confidentialite"
              className="text-sm text-stone-500
                hover:text-stone-300 transition-colors"
            >
              Confidentialité
            </a>
            <a
              href="mailto:contact@copropilot.fr"
              className="text-sm text-stone-500
                hover:text-stone-300 transition-colors"
            >
              Contact
            </a>
            <a
              href="https://github.com/Wifsimster/copro-pilot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-stone-500
                hover:text-stone-300 transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
