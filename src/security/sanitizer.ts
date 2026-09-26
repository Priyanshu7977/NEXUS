/**
 * NEXUS Sanitization & Anti-XSS Engine
 * Protects against DOM-based XSS, prototype pollution, dangerous URL schemes,
 * and malicious input injection across client views and APIs.
 */

const DANGEROUS_PROTOCOLS = ['javascript:', 'data:text/html', 'vbscript:', 'file:'];

/**
 * Escapes unsafe HTML characters into safe HTML entities.
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe || typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates that an external or user-provided URL uses an approved, safe protocol.
 * Rejects javascript:, data:text/html, and other arbitrary execution vectors.
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();

  for (const proto of DANGEROUS_PROTOCOLS) {
    if (trimmed.startsWith(proto)) {
      return false;
    }
  }

  // Allow relative URLs, http, https, mailto, tel
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return true;
  }

  return false;
}

/**
 * Sanitizes a URL for safe rendering in an href attribute.
 * If the URL is dangerous, returns '#' to neutralize attacks.
 */
export function sanitizeHref(url: string, fallback: string = '#'): string {
  return isSafeUrl(url) ? url : fallback;
}

/**
 * Safely parses JSON strings with prototype pollution safeguards.
 * Automatically eliminates `__proto__`, `constructor`, and `prototype` keys.
 */
export function safeJsonParse<T = any>(raw: string, fallback: T): T {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    return JSON.parse(raw, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined; // Neutralize prototype poisoning
      }
      return value;
    });
  } catch {
    return fallback;
  }
}

/**
 * Sanitizes user input string: strips non-printable control characters, trims whitespace,
 * and caps maximum length to prevent resource exhaustion attacks.
 */
export function sanitizeString(input: string, maxLength: number = 5000): string {
  if (!input || typeof input !== 'string') return '';
  // Remove non-printable control characters (excluding standard whitespace \t, \n, \r)
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.trim().slice(0, maxLength);
}

/**
 * Validates an external public web URL, enforcing strict http/https scheme and blocking SSRF
 * vectors against internal networks, cloud metadata services, and loopback addresses.
 */
export function isSafeExternalUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host === '169.254.169.254' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('172.16.') ||
      host.startsWith('172.17.') ||
      host.startsWith('172.18.') ||
      host.startsWith('172.19.') ||
      host.startsWith('172.2') ||
      host.startsWith('172.3')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

