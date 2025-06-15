// Encryption utilities for API keys
const ENCRYPTION_KEY_NAME = 'brokebot-key';

/**
 * Gets or creates encryption key from environment or generates one
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  // Try to get key from environment first
  const envKey = import.meta.env.VITE_ENCRYPTION_KEY;
  
  if (envKey) {
    // Use environment key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(envKey),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('brokebot-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  // Fallback: get or generate persistent key for this browser
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME);
  
  if (!storedKey) {
    // Generate new key
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const exported = await crypto.subtle.exportKey('jwk', key);
    localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exported));
    return key;
  }
  
  // Import existing key
  const keyData = JSON.parse(storedKey);
  return await crypto.subtle.importKey(
    'jwk',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a string value
 */
export async function encryptValue(plaintext: string): Promise<string> {
  if (!plaintext) return '';
  
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new TextEncoder().encode(plaintext);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Combine iv + encrypted data and encode as base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    return plaintext; // Fallback to plain text
  }
}

/**
 * Decrypts a string value
 */
export async function decryptValue(encryptedText: string): Promise<string> {
  if (!encryptedText) return '';
  
  try {
    const key = await getEncryptionKey();
    const combined = new Uint8Array(
      atob(encryptedText).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Fallback to treat as plain text
  }
}

/**
 * Clears the encryption key (for security reset)
 */
export function clearEncryptionKey(): void {
  localStorage.removeItem(ENCRYPTION_KEY_NAME);
} 