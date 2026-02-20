// Client-side top ~1000 most common passwords (subset of backend's 10k list)
const COMMON_PASSWORDS = new Set([
  '123456', 'password', '12345678', 'qwerty', '123456789', '12345',
  '1234', '111111', '1234567', 'dragon', '123123', 'baseball',
  'abc123', 'football', 'monkey', 'letmein', 'shadow', 'master',
  '696969', 'mustang', '666666', 'qwertyuiop', '123321', '1234567890',
  'pussy', 'superman', '654321', 'qazwsx', '7777777', 'fuckyou',
  'michael', 'hunter', 'trustno1', 'ranger', 'buster', 'thomas',
  'robert', 'soccer', 'batman', 'test', 'pass', 'killer',
  'hockey', 'george', 'charlie', 'andrew', 'michelle', 'love',
  'sunshine', 'jessica', 'pepper', 'daniel', 'access', 'joshua',
  'maggie', 'starwars', 'silver', 'william', 'dallas', '121212',
  'bailey', 'passw0rd', 'shadow', 'jennifer', 'nicholas', 'bonjour',
  'azerty', 'azertyuiop', 'marseille', 'doudou', 'loulou', 'chocolat',
  'soleil', 'chouchou', 'motdepasse', 'coucou', 'camille', 'nicolas',
  'alexandre', 'iloveyou', 'princess', 'welcome', 'admin', 'login',
  'passpass', 'hello', 'charlie', 'donald', 'password1', 'password123',
  'qwerty123', 'football1', 'baseball1', 'welcome1', 'abc1234',
  '1q2w3e4r', '1qaz2wsx', 'trustno1', 'zaq1zaq1', 'qwer1234',
  'nothing', 'freedom', 'whatever', 'internet', 'ginger', 'jordan',
  'liverpool', 'matrix', 'cheese', 'amanda', 'summer', 'ashley',
  'biteme', 'jasmine', 'brandon', 'compressed', 'matrix', 'thunder',
  'harley', 'hammer', 'yankees', 'corvette', 'merlin', 'phoenix',
  'bigdog', 'cheese', 'tigger', 'guitar', 'samson', 'smokey',
  'murphy', 'maverick', 'steelers', 'joseph', 'mercedes', 'falcon',
  'andrea', 'eagles', 'melissa', 'boomer', 'sparky', 'camaro',
])

export interface PasswordValidation {
  valid: boolean
  errors: string[]
  strength: { score: number; label: string; color: string }
}

export function validatePassword(
  password: string,
  context?: { email?: string }
): PasswordValidation {
  const errors: string[] = []

  if (!password) {
    return {
      valid: false,
      errors: [],
      strength: { score: 0, label: '', color: '' },
    }
  }

  if (password.length < 12) {
    errors.push('Au moins 12 caractères requis')
  }

  if (password.length > 128) {
    errors.push('Maximum 128 caractères')
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Ce mot de passe est trop courant')
  }

  if (context?.email) {
    const localPart = context.email.split('@')[0]?.toLowerCase()
    if (
      localPart &&
      localPart.length >= 3 &&
      password.toLowerCase().includes(localPart)
    ) {
      errors.push('Ne doit pas contenir votre email')
    }
  }

  // Strength scoring (informational, not blocking)
  let score = 0
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  let strength: PasswordValidation['strength']
  if (score <= 1)
    strength = { score: 1, label: 'Faible', color: 'bg-red-500' }
  else if (score <= 2)
    strength = { score: 2, label: 'Moyen', color: 'bg-orange-500' }
  else if (score <= 3)
    strength = { score: 3, label: 'Bon', color: 'bg-yellow-500' }
  else if (score <= 4)
    strength = { score: 4, label: 'Fort', color: 'bg-green-500' }
  else
    strength = {
      score: 5,
      label: 'Excellent',
      color: 'bg-emerald-500',
    }

  return { valid: errors.length === 0, errors, strength }
}
