import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const useSubscriptionMock = vi.fn()

vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => useSubscriptionMock(),
}))

const { PlanGuard, hasPlanAccess } = await import(
  '@/components/subscription/PlanGuard'
)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('hasPlanAccess', () => {
  it('grants access when the current plan meets the requirement', () => {
    expect(hasPlanAccess('pro', 'essentiel')).toBe(true)
    expect(hasPlanAccess('pro', 'pro')).toBe(true)
    expect(hasPlanAccess('entreprise', 'pro')).toBe(true)
  })

  it('denies access when the current plan is below the requirement', () => {
    expect(hasPlanAccess('gratuit', 'essentiel')).toBe(false)
    expect(hasPlanAccess('essentiel', 'pro')).toBe(false)
  })

  it('treats a missing plan as gratuit', () => {
    expect(hasPlanAccess(undefined, 'essentiel')).toBe(false)
    expect(hasPlanAccess(null, 'gratuit')).toBe(true)
  })

  it('fails open on an unknown requirement', () => {
    expect(hasPlanAccess('gratuit', 'mystery' as never)).toBe(true)
  })
})

describe('PlanGuard', () => {
  it('renders children when the plan is sufficient', () => {
    useSubscriptionMock.mockReturnValue({
      data: { plan: 'pro' },
      isLoading: false,
    })
    render(
      <PlanGuard requiredPlan="essentiel">
        <div>secret content</div>
      </PlanGuard>
    )
    expect(screen.getByText('secret content')).toBeInTheDocument()
  })

  it('renders the upgrade wall with a CTA when the plan is insufficient', () => {
    useSubscriptionMock.mockReturnValue({
      data: { plan: 'gratuit' },
      isLoading: false,
    })
    render(
      <PlanGuard requiredPlan="pro" feature="Le temps réel">
        <div>secret content</div>
      </PlanGuard>
    )
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
    expect(screen.getByText('Incluse dans le plan Pro')).toBeInTheDocument()
    expect(screen.getByText(/Le temps réel/)).toBeInTheDocument()
    const cta = screen.getByRole('link', { name: /Voir le plan Pro/ })
    expect(cta).toHaveAttribute('href', '/subscription?plan=pro')
  })

  it('does not flash the wall while loading', () => {
    useSubscriptionMock.mockReturnValue({ data: undefined, isLoading: true })
    render(
      <PlanGuard requiredPlan="pro">
        <div>secret content</div>
      </PlanGuard>
    )
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
    expect(screen.queryByText(/Incluse dans le plan/)).not.toBeInTheDocument()
  })
})
