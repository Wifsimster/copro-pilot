const isDevelopment = import.meta.env.DEV

const logger = {
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info('[CoproPilot]', ...args)
    }
  },
  warn: (...args: unknown[]) => {
    console.warn('[CoproPilot]', ...args)
  },
  error: (...args: unknown[]) => {
    console.error('[CoproPilot]', ...args)
  },
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug('[CoproPilot]', ...args)
    }
  },
}

export default logger
