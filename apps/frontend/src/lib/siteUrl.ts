// Canonical absolute URL of the deployed site. Used for SEO canonicals,
// Open Graph tags, JSON-LD schemas, and absolute links to assets.
// Configurable via VITE_SITE_URL so staging / preview deployments expose
// their own origin in metadata rather than leaking the production hostname.
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://copropilot.fr'
).replace(/\/$/, '')

export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.svg`
