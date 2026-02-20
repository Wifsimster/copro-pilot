import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let commonPasswordsSet = null

function loadCommonPasswords() {
  if (commonPasswordsSet) return commonPasswordsSet
  try {
    const filePath = path.join(__dirname, 'common-passwords.json')
    const data = JSON.parse(readFileSync(filePath, 'utf-8'))
    commonPasswordsSet = new Set(data)
  } catch {
    commonPasswordsSet = new Set()
  }
  return commonPasswordsSet
}

/**
 * Validate a password against OWASP ASVS 2.1 recommendations.
 *
 * Rules:
 * - Minimum 12 characters
 * - Maximum 128 characters
 * - Not in common passwords blocklist (top 10k)
 * - Does not contain the user's email local part
 * - All Unicode characters allowed
 * - No composition rules (OWASP deprecated forced uppercase/digit/symbol)
 *
 * @param {string} password
 * @param {{ email?: string }} [context]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePasswordOWASP(password, context = {}) {
  const errors = []

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Le mot de passe est requis'] }
  }

  if (password.length < 12) {
    errors.push(
      'Le mot de passe doit contenir au moins 12 caractères'
    )
  }

  if (password.length > 128) {
    errors.push(
      'Le mot de passe ne doit pas dépasser 128 caractères'
    )
  }

  const commonPasswords = loadCommonPasswords()
  if (commonPasswords.has(password.toLowerCase())) {
    errors.push(
      'Ce mot de passe est trop courant, veuillez en choisir un autre'
    )
  }

  if (context.email) {
    const localPart = context.email.split('@')[0]?.toLowerCase()
    if (
      localPart &&
      localPart.length >= 3 &&
      password.toLowerCase().includes(localPart)
    ) {
      errors.push(
        'Le mot de passe ne doit pas contenir votre adresse email'
      )
    }
  }

  return { valid: errors.length === 0, errors }
}
