// Simple encryption/decryption for API keys
// Note: This is basic obfuscation, not real security for production
const STORAGE_KEY = 'local_gpt_api_keys';
const SECRET_KEY = 'local-gpt-secret-2024'; // In production, this should be more secure

function simpleEncrypt(text: string): string {
  return btoa(text + SECRET_KEY);
}

function simpleDecrypt(encrypted: string): string {
  try {
    const decoded = atob(encrypted);
    return decoded.replace(SECRET_KEY, '');
  } catch {
    return '';
  }
}

export interface ApiKeys {
  openrouter?: string;
}

export function getStoredApiKeys(): ApiKeys {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const encrypted = JSON.parse(stored);
    const decrypted: ApiKeys = {};
    
    if (encrypted.openrouter) {
      decrypted.openrouter = simpleDecrypt(encrypted.openrouter);
    }
    
    return decrypted;
  } catch {
    return {};
  }
}

export function storeApiKey(provider: keyof ApiKeys, key: string) {
  const current = getStoredApiKeys();
  const encrypted = { ...current };
  
  if (key.trim()) {
    encrypted[provider] = simpleEncrypt(key.trim());
  } else {
    delete encrypted[provider];
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
}

export function removeApiKey(provider: keyof ApiKeys) {
  const current = getStoredApiKeys();
  delete current[provider];
  
  const encrypted: Record<string, string> = {};
  Object.entries(current).forEach(([key, value]) => {
    if (value) {
      encrypted[key] = simpleEncrypt(value);
    }
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
}

export function hasApiKey(provider: keyof ApiKeys): boolean {
  const keys = getStoredApiKeys();
  return !!(keys[provider] && keys[provider].length > 0);
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
} 