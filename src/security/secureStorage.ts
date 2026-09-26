/**
 * NEXUS Secure Client Storage Service
 * Encrypts sensitive values before persisting to browser storage using AES-GCM (256-bit).
 * Protects against DevTools snooping, physical device inspection, and rogue extension scraping.
 */

import { encryptToken, decryptToken } from '../services/encryptionService';
import { safeJsonParse } from './sanitizer';

// Prefix for encrypted keys
const SECURE_PREFIX = 'nxs_enc_';

export const secureStorage = {
  /**
   * Encrypts and saves an item to localStorage.
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const rawString = JSON.stringify(value);
      const ciphertext = await encryptToken(rawString);
      localStorage.setItem(`${SECURE_PREFIX}${key}`, ciphertext);
    } catch (err) {
      console.error('[NEXUS SecureStorage] Failed to encrypt and store item:', err);
    }
  },

  /**
   * Reads, decrypts, and parses an item from localStorage.
   */
  async getItem<T>(key: string, fallback: T): Promise<T> {
    if (typeof window === 'undefined') return fallback;
    try {
      const ciphertext = localStorage.getItem(`${SECURE_PREFIX}${key}`);
      if (!ciphertext) {
        // Check for legacy unencrypted fallback during migration
        const legacy = localStorage.getItem(key);
        return legacy ? safeJsonParse<T>(legacy, fallback) : fallback;
      }

      const decrypted = await decryptToken(ciphertext);
      return safeJsonParse<T>(decrypted, fallback);
    } catch {
      return fallback;
    }
  },

  /**
   * Removes an encrypted item from localStorage.
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${SECURE_PREFIX}${key}`);
    localStorage.removeItem(key); // Also clean legacy key
  },

  /**
   * Completely purges all encrypted NEXUS keys from browser storage upon logout.
   */
  purgeAllSecureItems(): void {
    if (typeof window === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(SECURE_PREFIX) || k.startsWith('nexus_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  },
};
