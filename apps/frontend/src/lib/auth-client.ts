import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

/**
 * Get absolute API URL for Better Auth
 */
function getAbsoluteApiUrl(): string {
  const apiUrl = import.meta.env.VITE_BACKEND_URL || '/api'

  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    return `${apiUrl}/auth`
  }

  return `${window.location.origin}${apiUrl}/auth`
}

export const authClient = createAuthClient({
  baseURL: getAbsoluteApiUrl(),
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [adminClient()],
})

export type Session = typeof authClient.$Infer.Session
