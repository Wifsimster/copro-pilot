import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

const ENDPOINT = '/api/web-vitals'

function send(metric: Metric) {
  const payload = JSON.stringify({
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
  })

  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.sendBeacon === 'function'
  ) {
    const blob = new Blob([payload], { type: 'application/json' })
    if (navigator.sendBeacon(ENDPOINT, blob)) return
  }

  // Fallback for browsers without sendBeacon, or when the call returns false
  // (typically because the page is unloading). keepalive lets the request
  // outlive the page.
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
    credentials: 'omit',
  }).catch(() => {})
}

export function reportWebVitals() {
  onCLS(send)
  onFCP(send)
  onINP(send)
  onLCP(send)
  onTTFB(send)
}
