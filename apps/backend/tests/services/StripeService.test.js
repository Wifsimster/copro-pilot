import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

const mockCreate = vi.fn()
const mockGetStripe = vi.fn(() => ({
  checkout: { sessions: { create: mockCreate } },
}))

vi.mock('../../src/config/stripe.js', () => ({
  getStripe: (...args) => mockGetStripe(...args),
  getPriceId: (plan, cadence) =>
    ({
      essentiel: { monthly: 'price_e_m', yearly: 'price_e_y' },
      pro: { monthly: 'price_p_m', yearly: 'price_p_y' },
      entreprise: { monthly: 'price_x_m', yearly: 'price_x_y' },
    })[plan]?.[cadence],
  getPlanCadenceFromPriceId: priceId =>
    ({
      price_p_y: { plan: 'pro', cadence: 'yearly' },
    })[priceId] || null,
  PLAN_QUOTAS: {
    gratuit: { coproprietes: 1, users: 3 },
    pro: { coproprietes: 20, users: 10 },
  },
  OVERAGE_PRICE_MAP: {},
}))

const mockGetByUserId = vi.fn()
vi.mock('../../src/models/Subscription.js', () => ({
  SubscriptionModel: {
    getByUserId: (...args) => mockGetByUserId(...args),
    getByStripeCustomerId: vi.fn(),
    getByStripeSubscriptionId: vi.fn(),
    upsertByStripeCustomerId: vi.fn(),
    update: vi.fn(),
    updateUserPlan: vi.fn(),
    getActiveWithOverage: vi.fn(),
  },
}))

vi.mock('../../src/middleware/requireQuota.js', () => ({
  getUserUsage: vi.fn(),
}))

vi.mock('../../src/services/ExtranetPaymentService.js', () => ({
  extranetPaymentService: { handlePaymentSuccess: vi.fn() },
}))

vi.mock('../../src/config/knex-database.js', () => ({
  default: { getKnex: () => ({ transaction: async fn => fn({}) }) },
}))

const { stripeService } = await import(
  '../../src/services/StripeService.js'
)

beforeEach(() => {
  vi.clearAllMocks()
  mockGetByUserId.mockResolvedValue(null)
  mockCreate.mockResolvedValue({
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/c/cs_test_123',
  })
})

describe('StripeService.createCheckoutSession', () => {
  it('uses the monthly price id by default', async () => {
    await stripeService.createCheckoutSession(
      'user_1',
      'a@b.fr',
      'pro'
    )
    const params = mockCreate.mock.calls[0][0]
    expect(params.line_items[0].price).toBe('price_p_m')
    expect(params.metadata).toEqual({
      plan: 'pro',
      cadence: 'monthly',
      user_id: 'user_1',
    })
  })

  it('uses the yearly price id when cadence=yearly', async () => {
    await stripeService.createCheckoutSession(
      'user_1',
      'a@b.fr',
      'pro',
      'yearly'
    )
    const params = mockCreate.mock.calls[0][0]
    expect(params.line_items[0].price).toBe('price_p_y')
    expect(params.metadata.cadence).toBe('yearly')
  })

  it('throws when no price id is configured', async () => {
    await expect(
      stripeService.createCheckoutSession(
        'user_1',
        'a@b.fr',
        'unknown',
        'monthly'
      )
    ).rejects.toThrow(/No Stripe price/)
  })
})
