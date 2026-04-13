import crypto from 'crypto'

/**
 * Compute SHA-256 hex digest of an input string.
 * Used for tamper-proof audit log hash chaining.
 *
 * @param {string} input
 * @returns {string} 64-char lowercase hex digest
 */
export function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

/**
 * Deterministic JSON stringify with stable key ordering.
 * Ensures hashes are reproducible regardless of property
 * insertion order.
 *
 * @param {Record<string, unknown>} obj
 * @returns {string}
 */
export function canonicalStringify(obj) {
  const keys = Object.keys(obj).sort()
  const sorted = {}
  for (const k of keys) sorted[k] = obj[k]
  return JSON.stringify(sorted)
}
