import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroSection } from '@/components/landing/HeroSection'
import { TrustBar } from '@/components/landing/TrustBar'
import { PainReliefSection } from '@/components/landing/PainReliefSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { FaqSection } from '@/components/landing/FaqSection'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <HeroSection />
      <TrustBar />
      <PainReliefSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FaqSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  )
}
