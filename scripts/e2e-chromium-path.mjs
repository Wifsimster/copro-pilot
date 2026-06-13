#!/usr/bin/env node
/**
 * Resolve a usable Chromium executable path for the Playwright E2E suite when
 * Playwright's own browser CDN is unreachable (restricted-egress CI / sandbox
 * networks return 403 for cdn.playwright.dev and storage.googleapis.com).
 *
 * It extracts the Chromium binary shipped inside the @sparticuz/chromium npm
 * package (delivered over the npm registry, which is reachable) and prints its
 * absolute path on stdout, so callers can wire it into Playwright via the
 * E2E_CHROMIUM_PATH environment variable read by playwright.config.ts.
 *
 * Usage:
 *   echo "E2E_CHROMIUM_PATH=$(node scripts/e2e-chromium-path.mjs)" >> "$GITHUB_ENV"
 */
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

try {
  const mod = require('@sparticuz/chromium')
  const chromium = mod.default ?? mod
  const execPath = await chromium.executablePath()
  if (!execPath) throw new Error('empty executablePath')
  process.stdout.write(execPath)
} catch (err) {
  process.stderr.write(
    `[e2e-chromium-path] failed to resolve Chromium: ${err.message}\n`
  )
  process.exit(1)
}
