import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: "C'est vraiment gratuit ?",
    answer:
      "Oui. Le plan Cloud Gratuit vous donne acces a la gestion"
      + " complete d'une copropriete de 20 lots maximum, sans"
      + " limite de duree et sans carte bancaire. Vous n'evoluez"
      + " vers un plan payant que si vous en avez besoin.",
  },
  {
    question:
      'Je suis syndic benevole, est-ce fait pour moi ?',
    answer:
      "Absolument, c'est notre cible principale. CoproPilot a"
      + " ete concu pour etre utilisable sans formation, meme si"
      + " vous n'etes pas a l'aise avec l'informatique."
      + " L'interface est simple et vous guide a chaque etape.",
  },
  {
    question:
      'Est-ce que mes donnees sont en securite ?',
    answer:
      'Vos donnees sont hebergees en France, conformement au'
      + ' RGPD. Nous effectuons des sauvegardes quotidiennes et'
      + ' utilisons un chiffrement pour toutes les'
      + ' communications. Le code source est auditable'
      + ' publiquement.',
  },
  {
    question:
      'Puis-je importer mes donnees existantes ?',
    answer:
      "Oui, vous pouvez importer vos donnees depuis un fichier"
      + " Excel. Pour les plans Entreprise, nous proposons une"
      + " migration assistee depuis les logiciels traditionnels"
      + " (POWIMO, Thetrawin, etc.).",
  },
  {
    question: 'Que se passe-t-il si je depasse 20 lots ?',
    answer:
      "Vous recevrez une notification vous invitant a passer au"
      + " plan Essentiel (19 EUR/mois). Vos donnees restent"
      + " accessibles en lecture, vous ne perdez jamais rien."
      + " La mise a niveau se fait en un clic.",
  },
  {
    question: "Y a-t-il un engagement ?",
    answer:
      "Aucun engagement. Tous les plans payants sont mensuels,"
      + " resiliables a tout moment. Vous pouvez exporter"
      + " l'integralite de vos donnees en un clic a tout moment.",
  },
]

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="border-b border-stone-200/60
        dark:border-stone-800 last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between
          py-5 text-left group"
      >
        <span
          className="font-display text-lg font-medium
            text-stone-900 dark:text-white pr-4
            group-hover:text-emerald-700
            dark:group-hover:text-emerald-400
            transition-colors"
        >
          {item.question}
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-stone-400
            dark:text-stone-500 transition-transform
            duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p
              className="pb-5 text-sm text-stone-500
                dark:text-stone-400 leading-relaxed"
            >
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="faq"
      className="py-20 sm:py-28 bg-[#FAF8F5]
        dark:bg-stone-950"
    >
      <div
        ref={ref}
        className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            className="font-display text-3xl sm:text-4xl
              font-semibold text-stone-900
              dark:text-stone-50"
          >
            Questions frequentes
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-xl border border-stone-200/60
            dark:border-stone-800 bg-white
            dark:bg-stone-900 px-6"
        >
          {faqs.map((faq, index) => (
            <FaqAccordionItem
              key={faq.question}
              item={faq}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(
                  openIndex === index ? null : index
                )
              }
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
