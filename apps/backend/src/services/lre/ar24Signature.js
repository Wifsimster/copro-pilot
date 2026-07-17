import crypto from 'node:crypto'

/**
 * AR24 request signing & response decryption.
 *
 * AR24 authenticates each request with a `token` plus a `date` and a
 * `signature` header. The signature is AES-256-CBC of the date string, with:
 *   - key = SHA-256(date + private_key)            (as hex, truncated to 32 bytes)
 *   - iv  = SHA-256(SHA-256(private_key))          (as hex, first 16 bytes)
 * and responses are AES-256-CBC-encrypted with the same key material (errors
 * are returned in clear).
 *
 * This mirrors AR24's PHP reference implementation: PHP's openssl_encrypt takes
 * the *string* key/iv (hex chars) and truncates to the cipher's block sizes, so
 * the key is the first 32 hex characters and the iv the first 16 — reproduced
 * here by slicing the hex digests. ⚠️ To confirm against the sandbox + the
 * Postman collection once credentials exist; the byte-vs-hex choice is the only
 * spot likely to need adjustment, and it is isolated here.
 */

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex')
}

/**
 * Compute the AES-256-CBC signature (base64) of `date` for a given private key.
 * Deterministic for a fixed (date, privateKey) pair.
 */
export function ar24Signature(date, privateKey) {
  if (!date || !privateKey) {
    throw new Error('ar24Signature: date and privateKey are required')
  }
  const keyHex = sha256Hex(date + privateKey) // 64 hex chars
  const ivHex = sha256Hex(sha256Hex(privateKey)) // 64 hex chars (twice-hashed)
  const key = Buffer.from(keyHex.slice(0, 32), 'utf8') // 32 bytes
  const iv = Buffer.from(ivHex.slice(0, 16), 'utf8') // 16 bytes

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([
    cipher.update(date, 'utf8'),
    cipher.final(),
  ]).toString('base64')
}

/**
 * Decrypt an AES-256-CBC AR24 response body (base64) with the same key material.
 * Returns the plaintext string (JSON). Throws on malformed input.
 */
export function ar24Decrypt(payloadBase64, date, privateKey) {
  const keyHex = sha256Hex(date + privateKey)
  const ivHex = sha256Hex(sha256Hex(privateKey))
  const key = Buffer.from(keyHex.slice(0, 32), 'utf8')
  const iv = Buffer.from(ivHex.slice(0, 16), 'utf8')

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([
    decipher.update(Buffer.from(payloadBase64, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}

/** AR24 uses the `d-m-Y H:i:s` date format for signing. */
export function ar24Date(now) {
  const d = now instanceof Date ? now : new Date(now)
  const pad = n => String(n).padStart(2, '0')
  return (
    `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  )
}
