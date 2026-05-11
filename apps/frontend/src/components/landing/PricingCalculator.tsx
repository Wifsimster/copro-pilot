import { useState } from 'react'
import { motion } from 'motion/react'
import { Building2, Users, Calculator } from 'lucide-react'

const plans = [
  {
    id: 'gratuit',
    name: 'Cloud Gratuit',
    basePrice: 0,
    copros: 1,
    users: 3,
    extraCoproPrice: 0,
    extraUserPrice: 0,
    maxCopros: 1,
    maxUsers: 3,
  },
  {
    id: 'essentiel',
    name: 'Essentiel',
    basePrice: 19,
    copros: 3,
    users: 5,
    extraCoproPrice: 0,
    extraUserPrice: 0,
    maxCopros: 3,
    maxUsers: 5,
  },
  {
    id: 'pro',
    name: 'Pro',
    basePrice: 49,
    copros: 20,
    users: 10,
    extraCoproPrice: 3,
    extraUserPrice: 5,
    maxCopros: null,
    maxUsers: null,
  },
  {
    id: 'entreprise',
    name: 'Entreprise',
    basePrice: 149,
    copros: 50,
    users: 25,
    extraCoproPrice: 2,
    extraUserPrice: 4,
    maxCopros: null,
    maxUsers: null,
  },
]

function findBestPlan(copros: number, users: number) {
  let bestPlan = plans[plans.length - 1]
  let bestTotal = Infinity

  for (const plan of plans) {
    if (plan.maxCopros !== null && copros > plan.maxCopros) continue
    if (plan.maxUsers !== null && users > plan.maxUsers) continue

    const extraCopros = Math.max(0, copros - plan.copros)
    const extraUsers = Math.max(0, users - plan.users)
    const total =
      plan.basePrice +
      extraCopros * plan.extraCoproPrice +
      extraUsers * plan.extraUserPrice

    if (total < bestTotal) {
      bestTotal = total
      bestPlan = plan
    }
  }

  const extraCopros = Math.max(0, copros - bestPlan.copros)
  const extraUsers = Math.max(0, users - bestPlan.users)
  const totalPrice =
    bestPlan.basePrice +
    extraCopros * bestPlan.extraCoproPrice +
    extraUsers * bestPlan.extraUserPrice

  return { plan: bestPlan, totalPrice, extraCopros, extraUsers }
}

export function PricingCalculator() {
  const [copros, setCopros] = useState(1)
  const [users, setUsers] = useState(2)

  const result = findBestPlan(copros, users)
  const avgLots = 30
  const perLotPrice =
    copros > 0 && result.totalPrice > 0
      ? (result.totalPrice / (copros * avgLots)).toFixed(2)
      : '0.00'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mt-12 mx-auto max-w-xl rounded-xl border
        border-stone-200/60 dark:border-stone-800 bg-white
        dark:bg-stone-950 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <Calculator
          className="size-5 text-emerald-600
            dark:text-emerald-400"
        />
        <h3
          className="text-base font-semibold text-stone-900
            dark:text-white"
        >
          Estimez votre tarif
        </h3>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="copros-slider"
              className="flex items-center gap-1.5 text-sm
                font-medium text-stone-700 dark:text-stone-300"
            >
              <Building2 className="size-3.5" />
              Copropriétés
            </label>
            <span
              className="text-sm font-bold text-stone-900
                dark:text-white tabular-nums"
            >
              {copros}
            </span>
          </div>
          <input
            id="copros-slider"
            type="range"
            min={1}
            max={100}
            value={copros}
            onChange={e => setCopros(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none
              cursor-pointer bg-stone-200 dark:bg-stone-700
              accent-emerald-600"
            aria-label={`${copros} copropriétés`}
          />
          <div
            className="flex justify-between text-xs text-stone-400
              mt-1"
          >
            <span>1</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="users-slider"
              className="flex items-center gap-1.5 text-sm
                font-medium text-stone-700 dark:text-stone-300"
            >
              <Users className="size-3.5" />
              Utilisateurs
            </label>
            <span
              className="text-sm font-bold text-stone-900
                dark:text-white tabular-nums"
            >
              {users}
            </span>
          </div>
          <input
            id="users-slider"
            type="range"
            min={1}
            max={50}
            value={users}
            onChange={e => setUsers(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none
              cursor-pointer bg-stone-200 dark:bg-stone-700
              accent-emerald-600"
            aria-label={`${users} utilisateurs`}
          />
          <div
            className="flex justify-between text-xs text-stone-400
              mt-1"
          >
            <span>1</span>
            <span>50</span>
          </div>
        </div>
      </div>

      <div
        className="mt-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30
          border border-emerald-200 dark:border-emerald-800 p-4"
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-sm font-medium text-emerald-800
              dark:text-emerald-300"
          >
            Plan recommandé :{' '}
            <strong>{result.plan.name}</strong>
          </span>
          <span
            className="text-lg font-bold text-emerald-700
              dark:text-emerald-400 tabular-nums"
          >
            {result.totalPrice} €/mois
          </span>
        </div>

        {(result.extraCopros > 0 || result.extraUsers > 0) && (
          <p
            className="text-xs text-emerald-600
              dark:text-emerald-500"
          >
            {result.plan.basePrice} € base
            {result.extraCopros > 0 &&
              ` + ${result.extraCopros} copro(s) suppl. (${result.extraCopros * result.plan.extraCoproPrice} €)`}
            {result.extraUsers > 0 &&
              ` + ${result.extraUsers} utilisateur(s) suppl. (${result.extraUsers * result.plan.extraUserPrice} €)`}
          </p>
        )}

        <p
          className="text-xs text-emerald-600
            dark:text-emerald-500 mt-1.5"
        >
          Soit{' '}
          <strong>{perLotPrice} €/lot/mois</strong>{' '}
          (moyenne 30 lots/copro) — les logiciels traditionnels
          facturent 3 à 8 €/lot/mois
        </p>
      </div>
    </motion.div>
  )
}
