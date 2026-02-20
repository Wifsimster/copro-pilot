import { useRef, useState } from 'react'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focused, setFocused] = useState(-1)

  const digits = value.padEnd(length, '').split('').slice(0, length)

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return

    const newDigits = [...digits]
    newDigits[index] = char.slice(-1)
    const newValue = newDigits.join('')
    onChange(newValue)

    // Auto-focus next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length)
    if (pasted) {
      onChange(pasted)
      const nextIndex = Math.min(pasted.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={el => {
            inputRefs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={() => setFocused(i)}
          onBlur={() => setFocused(-1)}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-2xl font-bold
            rounded-lg border-2 bg-background
            transition-colors duration-150
            focus:outline-none
            ${
              focused === i
                ? 'border-primary ring-2 ring-primary/20'
                : digits[i]
                  ? 'border-primary/50'
                  : 'border-border'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label={`Chiffre ${i + 1}`}
        />
      ))}
    </div>
  )
}
