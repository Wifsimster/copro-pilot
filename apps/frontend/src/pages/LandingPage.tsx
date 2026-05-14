import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroSection } from '@/components/landing/HeroSection'
import { TrustBar } from '@/components/landing/TrustBar'
import { PainReliefSection } from '@/components/landing/PainReliefSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { ComparisonSection } from '@/components/landing/ComparisonSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { FaqSection, faqs } from '@/components/landing/FaqSection'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { SEOHead } from '@/components/SEO/SEOHead'
import { SITE_URL } from '@/lib/siteUrl'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CoproPilot',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description:
    'Logiciel de gestion de copropriété pour syndics bénévoles et professionnels.',
  areaServed: 'FR',
}

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CoproPilot',
  url: SITE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    "Plateforme moderne de gestion de copropriété : appels de fonds, assemblées générales, comptabilité réglementaire ALUR, extranet copropriétaires, gestion des incidents et des contrats.",
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: 'Plan Cloud Gratuit jusqu’à 20 lots, sans carte bancaire.',
  },
  inLanguage: 'fr-FR',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answer,
    },
  })),
}

export default function LandingPage() {
  return (
    <div className="min-h-screen font-body antialiased">
      <SEOHead
        title="CoproPilot — Logiciel de gestion de copropriété pour syndics"
        description="Logiciel moderne de gestion de copropriété pour syndics bénévoles et professionnels : appels de fonds, AG, comptabilité ALUR, extranet copropriétaires. Gratuit jusqu’à 20 lots."
        canonical="/"
        jsonLd={[
          organizationSchema,
          softwareApplicationSchema,
          faqSchema,
        ]}
      />
      <LandingHeader />
      <HeroSection />
      <TrustBar />
      <PainReliefSection />
      <FeaturesSection />
      <ComparisonSection />
      <TestimonialsSection />
      <PricingSection />
      <HowItWorksSection />
      <FaqSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  )
}
