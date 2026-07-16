import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/logger.js', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

const modelMock = {
  record: vi.fn(),
  countByType: vi.fn(),
  countDistinctUsers: vi.fn(),
  churnByCause: vi.fn(),
}

vi.mock('../../src/models/AnalyticsEvent.js', () => ({
  AnalyticsEventModel: modelMock,
  ANALYTICS_EVENT_TYPES: ['signup', 'activation', 'conversion', 'churn'],
}))

const { analyticsService } = await import(
  '../../src/services/AnalyticsService.js'
)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AnalyticsService recorders', () => {
  it('records a conversion with plan', async () => {
    modelMock.record.mockResolvedValue({ id: '1' })
    await analyticsService.recordConversion('user-1', 'pro')
    expect(modelMock.record).toHaveBeenCalledWith({
      event_type: 'conversion',
      user_id: 'user-1',
      plan: 'pro',
    })
  })

  it('records churn with a cause', async () => {
    modelMock.record.mockResolvedValue({ id: '2' })
    await analyticsService.recordChurn('user-2', 'pro', 'payment_failed')
    expect(modelMock.record).toHaveBeenCalledWith({
      event_type: 'churn',
      user_id: 'user-2',
      plan: 'pro',
      cause: 'payment_failed',
    })
  })

  it('never throws when the model fails (best-effort)', async () => {
    modelMock.record.mockRejectedValue(new Error('db down'))
    await expect(
      analyticsService.recordSignup('user-3')
    ).resolves.toBeNull()
  })
})

describe('AnalyticsService.getFunnel', () => {
  it('aggregates counts and derives rates', async () => {
    modelMock.countByType.mockImplementation(type =>
      Promise.resolve(type === 'signup' ? 100 : 25)
    )
    modelMock.countDistinctUsers.mockResolvedValue(40)
    modelMock.churnByCause.mockResolvedValue({
      voluntary: 3,
      payment_failed: 2,
    })

    const funnel = await analyticsService.getFunnel({})

    expect(funnel.signups).toBe(100)
    expect(funnel.activations).toBe(40)
    expect(funnel.conversions).toBe(25)
    expect(funnel.churn).toEqual({
      total: 5,
      by_cause: { voluntary: 3, payment_failed: 2 },
    })
    expect(funnel.rates.activation).toBeCloseTo(0.4)
    expect(funnel.rates.conversion).toBeCloseTo(0.25)
    expect(funnel.rates.activation_to_paid).toBeCloseTo(0.625)
  })

  it('returns null rates instead of NaN when there are no signups', async () => {
    modelMock.countByType.mockResolvedValue(0)
    modelMock.countDistinctUsers.mockResolvedValue(0)
    modelMock.churnByCause.mockResolvedValue({})

    const funnel = await analyticsService.getFunnel({})

    expect(funnel.rates.activation).toBeNull()
    expect(funnel.rates.conversion).toBeNull()
    expect(funnel.churn.total).toBe(0)
  })
})
