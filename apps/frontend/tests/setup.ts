import '@testing-library/jest-dom/vitest'

// Provide globals expected by the app at module scope
Object.defineProperty(globalThis, '__BUILD_DATE__', { value: '2025-01-01T00:00:00.000Z' })
Object.defineProperty(globalThis, '__APP_VERSION__', { value: '0.0.0-test' })
