import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist'
import { PREMIERE_AG_STEPS } from '@/lib/onboarding'

describe('OnboardingChecklist', () => {
  it('renders every step and the progress counter', () => {
    render(<OnboardingChecklist steps={PREMIERE_AG_STEPS} />)
    expect(screen.getByText('Créer votre copropriété')).toBeInTheDocument()
    expect(
      screen.getByText('Générer le procès-verbal')
    ).toBeInTheDocument()
    expect(
      screen.getByText(`0/${PREMIERE_AG_STEPS.length}`)
    ).toBeInTheDocument()
  })

  it('shows the completion banner when all steps are done', () => {
    const all = Object.fromEntries(
      PREMIERE_AG_STEPS.map(s => [s.key, true])
    )
    render(
      <OnboardingChecklist steps={PREMIERE_AG_STEPS} completed={all} />
    )
    expect(
      screen.getByText(/Votre première AG est prête/)
    ).toBeInTheDocument()
  })
})
