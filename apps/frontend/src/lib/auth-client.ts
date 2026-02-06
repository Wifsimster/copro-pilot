import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

function getBaseURL() {
  if (import.meta.env.VITE_BACKEND_URL) {
    return `${import.meta.env.VITE_BACKEND_URL}/auth`
  }
  return `${window.location.origin}/api/auth`
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [adminClient()],
})

export type Session = typeof authClient.$Infer.Session
