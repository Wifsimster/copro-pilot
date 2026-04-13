/**
 * Log sampling utility.
 *
 * Used to keep debug logs from drowning high-traffic code paths. Each
 * call to `sample(rate, key)` returns `true` for approximately `rate`
 * (0..1) fraction of calls.
 *
 * Example:
 *   import { sample } from './utils/logSampling.js'
 *
 *   if (sample(0.01, 'query-logs')) {
 *     logger.debug('slow query', { sql })
 *   }
 *
 * The optional `key` scopes counters so different call-sites don't
 * interfere with each other. Sampling is deterministic per-key using a
 * rolling counter (every Nth call), which keeps the sampled volume
 * stable regardless of traffic patterns. Pass no key (or the same key)
 * to share a counter across call-sites.
 */

const counters = new Map()

/**
 * Returns true for approximately `rate` fraction of calls.
 *
 * @param {number} rate - Sampling rate between 0 and 1 inclusive.
 * @param {string} [key='default'] - Counter scope.
 * @returns {boolean}
 */
export const sample = (rate, key = 'default') => {
  if (typeof rate !== 'number' || Number.isNaN(rate) || rate <= 0) {
    return false
  }
  if (rate >= 1) {
    return true
  }

  const step = Math.max(1, Math.round(1 / rate))
  const current = (counters.get(key) ?? 0) + 1
  counters.set(key, current)
  return current % step === 0
}

/**
 * Resets all sampling counters. Primarily intended for tests.
 */
export const resetSampling = () => {
  counters.clear()
}

export default sample
