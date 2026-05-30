import { useState, useRef } from 'react'
import { m, useInView, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { faqs, type FaqItem } from './faqData'


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
      <button type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between
          py-5 text-left group"
      >
        <h3
          className="font-display text-lg font-medium
            text-stone-900 dark:text-white pr-4
            group-hover:text-emerald-700
            dark:group-hover:text-emerald-400
            transition-colors"
        >
          {item.question}
        </h3>
        <ChevronDown
          className={`size-5 shrink-0 text-stone-400
            dark:text-stone-500 transition-transform
            duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <m.div
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
          </m.div>
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
        <m.div
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
            Questions fréquentes
          </h2>
        </m.div>

        <m.div
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
        </m.div>
      </div>
    </section>
  )
}
