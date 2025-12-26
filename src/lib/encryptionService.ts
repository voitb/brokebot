const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

export interface EncryptionService {
  encryptValue: (plaintext: string) => Promise<string>;
  decryptValue: (encryptedText: string) => Promise<string>;
  clearCache: () => void;
}

function getBrowserFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Browser fingerprint", 2, 2);
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join("|");

  return fingerprint;
}

export function createEncryptionService(): EncryptionService {
  let cachedKey: CryptoKey | null = null;

  async function deriveKey(): Promise<CryptoKey> {
    if (cachedKey) return cachedKey;

    const fingerprint = getBrowserFingerprint();
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(fingerprint),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const salt = encoder.encode("brokebot-local-encryption-salt");

    cachedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ["encrypt", "decrypt"]
    );

    return cachedKey;
  }

  async function encryptValue(plaintext: string): Promise<string> {
    if (!plaintext) return "";

    const key = await deriveKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();

    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoder.encode(plaintext)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  async function decryptValue(encryptedText: string): Promise<string> {
    if (!encryptedText) return "";

    const key = await deriveKey();
    const combined = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0));

    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  }

  function clearCache(): void {
    cachedKey = null;
    localStorage.removeItem("apiKeys");
  }

  return { encryptValue, decryptValue, clearCache };
}

// Default instance for convenience
const defaultService = createEncryptionService();

export const encryptValue = defaultService.encryptValue;
export const decryptValue = defaultService.decryptValue;
export const clearEncryptionCache = defaultService.clearCache;
