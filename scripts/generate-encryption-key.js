#!/usr/bin/env node
// Generate a new PII encryption key
// Usage: node scripts/generate-encryption-key.js
import { generateKey } from '../apps/backend/src/utils/encryption.js'

console.log(
  'Generated PII encryption key (save this securely and set as PII_ENCRYPTION_KEY):'
)
console.log(generateKey())
