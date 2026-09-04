/**
 * NEXUS Token Encryption Service
 * Provides AES-GCM (256-bit) encryption and decryption for sensitive third-party connector tokens.
 * Utilizes the standard Web Crypto API (crypto.subtle) for secure browser/client and edge execution.
 */

// Fallback key used only when VITE_CONNECTOR_ENCRYPTION_KEY is not defined in .env
const DEFAULT_KEY_SEED = 'nexus_default_connector_enc_key_32bytes!';

const getEncryptionKeyMaterial = (): string => {
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CONNECTOR_ENCRYPTION_KEY) || '';
  if (envKey && envKey.length >= 16) {
    return envKey;
  }
  return DEFAULT_KEY_SEED;
};

// Derive a CryptoKey from the string material using SHA-256
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = enc.encode(getEncryptionKeyMaterial());
  const hash = await crypto.subtle.digest('SHA-256', keyMaterial);
  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypt a plaintext token (e.g. GitHub access token) into a secure AES-GCM ciphertext
 * Format: "iv_base64:ciphertext_base64"
 */
export async function encryptToken(plainText: string): Promise<string> {
  if (!plainText) return '';
  try {
    const key = await getCryptoKey();
    // 12-byte IV for AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoded
    );

    const ivB64 = arrayBufferToBase64(iv);
    const cipherB64 = arrayBufferToBase64(ciphertext);

    return `${ivB64}:${cipherB64}`;
  } catch (err) {
    console.error('[NEXUS Encryption] Failed to encrypt token safely');
    throw new Error('Encryption operation failed');
  }
}

/**
 * Decrypt an AES-GCM ciphertext back into the original plaintext token
 */
export async function decryptToken(encryptedPayload: string): Promise<string> {
  if (!encryptedPayload) return '';
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted payload format');
    }

    const iv = new Uint8Array(base64ToArrayBuffer(parts[0]));
    const ciphertext = base64ToArrayBuffer(parts[1]);
    const key = await getCryptoKey();

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error('[NEXUS Encryption] Failed to decrypt token safely');
    throw new Error('Decryption operation failed');
  }
}
