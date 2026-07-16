import { describe, it, expect } from 'vitest'
import {
  computeOnboardingProgress,
  PREMIERE_AG_STEPS,
} from '@/lib/onboarding'

describe('computeOnboardingProgress', () => {
  it('reports zero progress with nothing completed', () => {
    const p = computeOnboardingProgress(PREMIERE_AG_STEPS, {})
    expect(p.completedCount).toBe(0)
    expect(p.ratio).toBe(0)
    expect(p.nextStep?.key).toBe('copropriete')
    expect(p.done).toBe(false)
  })

  it('counts completed steps and finds the next one', () => {
    const p = computeOnboardingProgress(PREMIERE_AG_STEPS, {
      copropriete: true,
      convocation: true,
    })
    expect(p.completedCount).toBe(2)
    expect(p.ratio).toBeCloseTo(2 / PREMIERE_AG_STEPS.length)
    expect(p.nextStep?.key).toBe('ordre_du_jour')
  })

  it('is done when every step is completed', () => {
    const all = Object.fromEntries(
      PREMIERE_AG_STEPS.map(s => [s.key, true])
    )
    const p = computeOnboardingProgress(PREMIERE_AG_STEPS, all)
    expect(p.done).toBe(true)
    expect(p.nextStep).toBeNull()
    expect(p.ratio).toBe(1)
  })

  it('ignores unknown keys in the completed map', () => {
    const p = computeOnboardingProgress(PREMIERE_AG_STEPS, {
      bogus: true,
    })
    expect(p.completedCount).toBe(0)
  })
})
