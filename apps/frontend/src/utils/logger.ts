const isDevelopment = import.meta.env.DEV

const logger = {
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info('[ImmoIA]', ...args)
    }
  },
  warn: (...args: unknown[]) => {
    console.warn('[ImmoIA]', ...args)
  },
  error: (...args: unknown[]) => {
    console.error('[ImmoIA]', ...args)
  },
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug('[ImmoIA]', ...args)
    }
  },
}

export default logger
