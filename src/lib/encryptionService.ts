import { functions } from './appwriteClient';
import { account } from './appwriteClient';

const ENCRYPTION_FUNCTION_ID = 'encrypt-keys';

/**
 * Gets current user ID for encryption context
 */
async function getCurrentUserId(): Promise<string> {
  try {
    const user = await account.get();
    return user.$id;
  } catch (error) {
    // For anonymous users, use a browser fingerprint
    return getBrowserFingerprint();
  }
}

/**
 * Creates a unique browser fingerprint for anonymous users
 */
function getBrowserFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Create a hash of the fingerprint
  return btoa(fingerprint).slice(0, 32);
}

/**
 * Encrypts data using Appwrite function
 */
export async function encryptValue(plaintext: string): Promise<string> {
  if (!plaintext) return '';
  
  try {
    const userId = await getCurrentUserId();
    
    const response = await functions.createExecution(
      ENCRYPTION_FUNCTION_ID,
      JSON.stringify({
        action: 'encrypt',
        data: plaintext,
        userId: userId
      })
    );
    
    if (response.responseStatusCode !== 200) {
      throw new Error(`Encryption failed with status: ${response.responseStatusCode}`);
    }
    
    const result = JSON.parse(response.responseBody);
    
    if (!result.success) {
      throw new Error(result.error || 'Encryption failed');
    }
    
    return result.encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypts data using Appwrite function
 */
export async function decryptValue(encryptedText: string): Promise<string> {
  if (!encryptedText) return '';
  
  try {
    const userId = await getCurrentUserId();
    
    const response = await functions.createExecution(
      ENCRYPTION_FUNCTION_ID,
      JSON.stringify({
        action: 'decrypt',
        data: encryptedText,
        userId: userId
      })
    );
    
    if (response.responseStatusCode !== 200) {
      throw new Error(`Decryption failed with status: ${response.responseStatusCode}`);
    }
    
    const result = JSON.parse(response.responseBody);
    
    if (!result.success) {
      throw new Error(result.error || 'Decryption failed');
    }
    
    return result.decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
}

/**
 * Clears encryption cache (for security reset)
 */
export function clearEncryptionCache(): void {
  // Since encryption is server-side, we just need to clear localStorage
  localStorage.removeItem('apiKeys');
} 