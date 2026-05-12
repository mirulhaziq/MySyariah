/**
 * Safely converts any value returned by the API to a renderable string.
 * Handles objects, arrays, null, undefined, numbers, booleans.
 */
export function safeStr(val, fallback = '—') {
  if (val === null || val === undefined) return fallback
  if (typeof val === 'string') return val || fallback
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)
  if (Array.isArray(val)) return val.map((v) => safeStr(v, '')).filter(Boolean).join(', ') || fallback
  if (typeof val === 'object') {
    try {
      // Flatten object values into a readable sentence
      const parts = Object.entries(val)
        .map(([k, v]) => `${k}: ${safeStr(v, '')}`)
        .filter(Boolean)
      return parts.join(' | ') || fallback
    } catch (_) {
      return fallback
    }
  }
  return fallback
}
