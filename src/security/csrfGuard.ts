/**
 * NEXUS Anti-CSRF & Cryptographic State Token Guard
 * Generates cryptographically secure, high-entropy single-use state tokens
 * for OAuth integrations and sensitive state transitions.
 */

const CSRF_STORAGE_PREFIX = 'nexus_csrf_state_';
const TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

interface StoredState {
  token: string;
  action: string;
  createdAt: number;
}

/**
 * Generates a high-entropy cryptographically random hex string.
 */
export function generateCryptographicNonce(byteLength: number = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Issues a new CSRF state token for a specific action (e.g. 'oauth_github').
 * Persists the state token in sessionStorage with an expiration timestamp.
 */
export function createCsrfState(action: string): string {
  const token = generateCryptographicNonce(32);
  const state: StoredState = {
    token,
    action,
    createdAt: Date.now(),
  };

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(`${CSRF_STORAGE_PREFIX}${token}`, JSON.stringify(state));
    } catch {
      // Fallback
    }
  }

  return token;
}

/**
 * Validates and consumes an incoming CSRF state token.
 * Tokens are single-use and expire after 10 minutes.
 */
export function validateAndConsumeCsrfState(token: string, expectedAction?: string): boolean {
  if (!token || typeof token !== 'string') return false;
  if (typeof window === 'undefined' || !window.sessionStorage) return false;

  const key = `${CSRF_STORAGE_PREFIX}${token}`;
  const raw = window.sessionStorage.getItem(key);

  if (!raw) {
    return false; // Token does not exist or was already consumed
  }

  // Single-use: immediately delete the token
  window.sessionStorage.removeItem(key);

  try {
    const state: StoredState = JSON.parse(raw);
    const isExpired = Date.now() - state.createdAt > TOKEN_EXPIRY_MS;
    if (isExpired) {
      return false;
    }

    if (expectedAction && state.action !== expectedAction) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
