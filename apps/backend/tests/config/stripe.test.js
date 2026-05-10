import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

beforeEach(() => {
  process.env.STRIPE_PRICE_ESSENTIEL_MONTHLY = 'price_essentiel_m'
  process.env.STRIPE_PRICE_ESSENTIEL_YEARLY = 'price_essentiel_y'
  process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_m'
  process.env.STRIPE_PRICE_PRO_YEARLY = 'price_pro_y'
  process.env.STRIPE_PRICE_ENTREPRISE_MONTHLY = 'price_entreprise_m'
  process.env.STRIPE_PRICE_ENTREPRISE_YEARLY = 'price_entreprise_y'
  vi.resetModules()
})

describe('PLAN_PRICE_MAP', () => {
  it('exposes monthly and yearly price IDs for each paid plan', async () => {
    const { PLAN_PRICE_MAP } = await import('../../src/config/stripe.js')
    expect(PLAN_PRICE_MAP).toEqual({
      essentiel: {
        monthly: 'price_essentiel_m',
        yearly: 'price_essentiel_y',
      },
      pro: { monthly: 'price_pro_m', yearly: 'price_pro_y' },
      entreprise: {
        monthly: 'price_entreprise_m',
        yearly: 'price_entreprise_y',
      },
    })
  })
})

describe('getPriceId', () => {
  it('returns the correct price id for plan + cadence', async () => {
    const { getPriceId } = await import('../../src/config/stripe.js')
    expect(getPriceId('pro', 'monthly')).toBe('price_pro_m')
    expect(getPriceId('pro', 'yearly')).toBe('price_pro_y')
    expect(getPriceId('entreprise', 'yearly')).toBe('price_entreprise_y')
  })

  it('defaults cadence to monthly', async () => {
    const { getPriceId } = await import('../../src/config/stripe.js')
    expect(getPriceId('essentiel')).toBe('price_essentiel_m')
  })

  it('returns undefined for unknown plan or cadence', async () => {
    const { getPriceId } = await import('../../src/config/stripe.js')
    expect(getPriceId('gratuit', 'monthly')).toBeUndefined()
    expect(getPriceId('pro', 'weekly')).toBeUndefined()
  })
})

describe('getPlanCadenceFromPriceId', () => {
  it('reverses any configured price id back to plan + cadence', async () => {
    const { getPlanCadenceFromPriceId } = await import(
      '../../src/config/stripe.js'
    )
    expect(getPlanCadenceFromPriceId('price_pro_y')).toEqual({
      plan: 'pro',
      cadence: 'yearly',
    })
    expect(getPlanCadenceFromPriceId('price_essentiel_m')).toEqual({
      plan: 'essentiel',
      cadence: 'monthly',
    })
  })

  it('returns null for unknown or empty price ids', async () => {
    const { getPlanCadenceFromPriceId } = await import(
      '../../src/config/stripe.js'
    )
    expect(getPlanCadenceFromPriceId('price_unknown')).toBeNull()
    expect(getPlanCadenceFromPriceId('')).toBeNull()
    expect(getPlanCadenceFromPriceId(null)).toBeNull()
    expect(getPlanCadenceFromPriceId(undefined)).toBeNull()
  })
})

describe('validatePriceConfiguration', () => {
  it('returns an empty array when all price ids are configured', async () => {
    const { validatePriceConfiguration } = await import(
      '../../src/config/stripe.js'
    )
    expect(validatePriceConfiguration()).toEqual([])
  })

  it('reports each missing plan/cadence combination', async () => {
    delete process.env.STRIPE_PRICE_PRO_YEARLY
    delete process.env.STRIPE_PRICE_ENTREPRISE_MONTHLY
    vi.resetModules()
    const { validatePriceConfiguration } = await import(
      '../../src/config/stripe.js'
    )
    const missing = validatePriceConfiguration()
    expect(missing).toContain('pro/yearly')
    expect(missing).toContain('entreprise/monthly')
    expect(missing).not.toContain('pro/monthly')
  })
})
