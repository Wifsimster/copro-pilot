export function LandingFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-400">
              CoproPilot
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a
              href="/#/politique-confidentialite"
              className="hover:text-slate-300 transition-colors"
            >
              Politique de confidentialite
            </a>
            <a
              href="/#/donnees-personnelles"
              className="hover:text-slate-300 transition-colors"
            >
              Donnees personnelles
            </a>
          </div>

          <p className="text-sm text-slate-500">
            &copy; 2026 CoproPilot
          </p>
        </div>
      </div>
    </footer>
  )
}
