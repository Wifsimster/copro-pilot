import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  encrypt,
  decrypt,
  isEncrypted,
  generateKey,
  maybeEncrypt,
  maybeDecrypt,
} from '../../src/utils/encryption.js'

describe('encryption utility', () => {
  let previousKey

  beforeAll(() => {
    previousKey = process.env.PII_ENCRYPTION_KEY
    process.env.PII_ENCRYPTION_KEY = generateKey()
  })

  afterAll(() => {
    if (previousKey === undefined) {
      delete process.env.PII_ENCRYPTION_KEY
    } else {
      process.env.PII_ENCRYPTION_KEY = previousKey
    }
  })

  describe('encrypt / decrypt', () => {
    it('returns original plaintext after encrypt then decrypt', () => {
      const plaintext = 'FR7630006000011234567890189'
      const encrypted = encrypt(plaintext)
      expect(encrypted).not.toBe(plaintext)
      expect(decrypt(encrypted)).toBe(plaintext)
    })

    it('handles unicode and special characters', () => {
      const plaintext = 'Éléonore-Müller@example.com ☃'
      expect(decrypt(encrypt(plaintext))).toBe(plaintext)
    })

    it('returns null/empty values unchanged on encrypt', () => {
      expect(encrypt(null)).toBe(null)
      expect(encrypt(undefined)).toBe(undefined)
      expect(encrypt('')).toBe('')
    })

    it('returns null/empty values unchanged on decrypt', () => {
      expect(decrypt(null)).toBe(null)
      expect(decrypt(undefined)).toBe(undefined)
      expect(decrypt('')).toBe('')
    })

    it('produces different ciphertext for the same plaintext (random IV)', () => {
      const plaintext = 'FR7630006000011234567890189'
      const a = encrypt(plaintext)
      const b = encrypt(plaintext)
      expect(a).not.toBe(b)
      expect(decrypt(a)).toBe(plaintext)
      expect(decrypt(b)).toBe(plaintext)
    })

    it('fails decryption on tampered ciphertext (auth tag validation)', () => {
      const plaintext = 'sensitive-value'
      const encrypted = encrypt(plaintext)
      const parts = encrypted.split(':')
      // Flip one byte of the ciphertext hex
      const cipherHex = parts[4]
      const tamperedByte = cipherHex[0] === '0' ? '1' : '0'
      parts[4] = tamperedByte + cipherHex.slice(1)
      const tampered = parts.join(':')
      expect(() => decrypt(tampered)).toThrow()
    })

    it('fails decryption on tampered auth tag', () => {
      const plaintext = 'sensitive-value'
      const encrypted = encrypt(plaintext)
      const parts = encrypted.split(':')
      const tagHex = parts[3]
      const tamperedByte = tagHex[0] === '0' ? '1' : '0'
      parts[3] = tamperedByte + tagHex.slice(1)
      const tampered = parts.join(':')
      expect(() => decrypt(tampered)).toThrow()
    })
  })

  describe('isEncrypted', () => {
    it('identifies encrypted values', () => {
      const encrypted = encrypt('hello')
      expect(isEncrypted(encrypted)).toBe(true)
    })

    it('returns false for plain strings', () => {
      expect(isEncrypted('FR7630006000011234567890189')).toBe(false)
      expect(isEncrypted('hello world')).toBe(false)
    })

    it('returns false for non-string values', () => {
      expect(isEncrypted(null)).toBe(false)
      expect(isEncrypted(undefined)).toBe(false)
      expect(isEncrypted(123)).toBe(false)
      expect(isEncrypted({})).toBe(false)
    })
  })

  describe('backwards compatibility', () => {
    it('decrypt returns non-encrypted values unchanged', () => {
      expect(decrypt('plain-iban-value')).toBe('plain-iban-value')
      expect(decrypt('FR7630006000011234567890189')).toBe(
        'FR7630006000011234567890189'
      )
    })
  })

  describe('generateKey', () => {
    it('generates a 64-character hex key (32 bytes)', () => {
      const key = generateKey()
      expect(key).toMatch(/^[0-9a-f]{64}$/)
    })

    it('generates different keys on each call', () => {
      expect(generateKey()).not.toBe(generateKey())
    })
  })
})

describe('maybeEncrypt / maybeDecrypt without env var', () => {
  let previousKey

  beforeAll(() => {
    previousKey = process.env.PII_ENCRYPTION_KEY
    delete process.env.PII_ENCRYPTION_KEY
  })

  afterAll(() => {
    if (previousKey !== undefined) {
      process.env.PII_ENCRYPTION_KEY = previousKey
    }
  })

  it('maybeEncrypt is a no-op when env var is not set', () => {
    expect(maybeEncrypt('plain-value')).toBe('plain-value')
    expect(maybeEncrypt(null)).toBe(null)
    expect(maybeEncrypt('')).toBe('')
  })

  it('maybeDecrypt is a no-op when env var is not set', () => {
    expect(maybeDecrypt('plain-value')).toBe('plain-value')
    expect(maybeDecrypt(null)).toBe(null)
    expect(maybeDecrypt('')).toBe('')
  })

  it('maybeDecrypt does not attempt to decrypt encrypted-looking values without key', () => {
    // Pretend there's an "encrypted" value in the DB but no key set.
    // Should return the value as-is (no-op), not throw.
    const fakeEncrypted = 'enc:v1:aabbcc:ddeeff:112233'
    expect(maybeDecrypt(fakeEncrypted)).toBe(fakeEncrypted)
  })
})

describe('maybeEncrypt / maybeDecrypt with env var', () => {
  let previousKey

  beforeAll(() => {
    previousKey = process.env.PII_ENCRYPTION_KEY
    process.env.PII_ENCRYPTION_KEY = generateKey()
  })

  afterAll(() => {
    if (previousKey === undefined) {
      delete process.env.PII_ENCRYPTION_KEY
    } else {
      process.env.PII_ENCRYPTION_KEY = previousKey
    }
  })

  it('maybeEncrypt encrypts when env var is set', () => {
    const value = 'FR7630006000011234567890189'
    const encrypted = maybeEncrypt(value)
    expect(encrypted).not.toBe(value)
    expect(isEncrypted(encrypted)).toBe(true)
  })

  it('maybeDecrypt decrypts encrypted values when env var is set', () => {
    const value = 'FR7630006000011234567890189'
    const encrypted = maybeEncrypt(value)
    expect(maybeDecrypt(encrypted)).toBe(value)
  })

  it('maybeDecrypt leaves plain values unchanged (backwards compatibility)', () => {
    expect(maybeDecrypt('plain-legacy-value')).toBe('plain-legacy-value')
  })
})
