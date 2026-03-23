import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { validatePassword } from '@/utils/passwordValidation'
import type { PasswordValidation } from '@/utils/passwordValidation'

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = '••••••••••••',
  autoComplete,
  minLength,
}: {
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  autoComplete?: string
  minLength?: number
}) {
  const [show, setShow] = useState(false)

  return (
    <div data-slot="password-input" className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className="h-11 pr-10"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={
          show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
        }
      >
        {show ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
    </div>
  )
}

export function PasswordStrength({
  password,
  email,
  showErrors = false,
}: {
  password: string
  email?: string
  showErrors?: boolean
}) {
  if (!password) return null

  const validation: PasswordValidation = validatePassword(password, {
    email,
  })

  return (
    <div data-slot="password-strength" className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= validation.strength.score
                ? validation.strength.color
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Force :{' '}
        <span className="font-medium">
          {validation.strength.label}
        </span>
      </p>
      {showErrors && validation.errors.length > 0 && (
        <ul className="text-xs text-destructive space-y-0.5">
          {validation.errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
