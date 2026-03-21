import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: 'Est-ce que mes donnees sont en securite ?',
    answer:
      'Absolument. Vos donnees sont hebergees en France, conformement au RGPD. Nous effectuons des sauvegardes quotidiennes et utilisons un chiffrement de bout en bout pour toutes les communications.',
  },
  {
    question: 'Combien de temps pour prendre en main ?',
    answer:
      'Entre 5 et 15 minutes suffisent pour creer votre compte et ajouter votre premiere copropriete. L\'interface est concue pour etre intuitive, sans besoin de formation.',
  },
  {
    question: 'Puis-je importer mes donnees existantes ?',
    answer:
      'Oui, vous pouvez importer vos donnees depuis un fichier Excel. Notre equipe vous accompagne gratuitement pour vous aider a migrer vos donnees existantes.',
  },
  {
    question: 'Y a-t-il un engagement ?',
    answer:
      'Aucun engagement. Vous pouvez arreter a tout moment et exporter l\'integralite de vos donnees en un clic.',
  },
  {
    question: 'Et si j\'ai besoin d\'aide ?',
    answer:
      'Notre equipe de support humain est disponible par email. Pas de chatbot, pas de reponse automatique — une vraie personne vous repond sous 24 heures.',
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
    <div className="border-b border-slate-200 dark:border-slate-700">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-base font-medium text-slate-900 dark:text-white pr-4">
          {item.question}
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id="faq"
      className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900"
    >
      <div ref={ref} className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-12"
        >
          Questions frequentes
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-6"
        >
          {faqs.map((faq, index) => (
            <FaqAccordionItem
              key={faq.question}
              item={faq}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
