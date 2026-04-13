import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // GCM recommended IV length
const KEY_LENGTH = 32 // AES-256 requires 32-byte key
const TAG_LENGTH = 16

function getKey() {
  const keyHex = process.env.PII_ENCRYPTION_KEY
  if (!keyHex) {
    throw new Error('PII_ENCRYPTION_KEY env var is required')
  }
  const key = Buffer.from(keyHex, 'hex')
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `PII_ENCRYPTION_KEY must be ${KEY_LENGTH * 2} hex characters (${KEY_LENGTH} bytes)`
    )
  }
  return key
}

export function encrypt(plaintext) {
  if (plaintext == null || plaintext === '') return plaintext
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(String(plaintext), 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  // Format: enc:v1:<iv_hex>:<tag_hex>:<ciphertext_hex>
  return `enc:v1:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(value) {
  if (value == null || value === '') return value
  if (typeof value !== 'string' || !value.startsWith('enc:v1:')) {
    // Not encrypted — return as-is for backwards compatibility
    return value
  }
  const key = getKey()
  const parts = value.split(':')
  if (parts.length !== 5) throw new Error('Invalid encrypted value format')
  const iv = Buffer.from(parts[2], 'hex')
  const tag = Buffer.from(parts[3], 'hex')
  const ciphertext = Buffer.from(parts[4], 'hex')
  if (tag.length !== TAG_LENGTH) {
    throw new Error('Invalid auth tag length')
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

export function isEncrypted(value) {
  return typeof value === 'string' && value.startsWith('enc:v1:')
}

export function generateKey() {
  return crypto.randomBytes(KEY_LENGTH).toString('hex')
}

export function maybeEncrypt(value) {
  if (!process.env.PII_ENCRYPTION_KEY) return value
  return encrypt(value)
}

export function maybeDecrypt(value) {
  if (!process.env.PII_ENCRYPTION_KEY) return value
  if (!isEncrypted(value)) return value
  return decrypt(value)
}
