import { db } from "./db";

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const ENCRYPTION_KEY_ID = "app-data-encryption";

let keyPromise: Promise<CryptoKey> | null = null;

async function getOrCreateKey(): Promise<CryptoKey> {
  const record = await db.encryptionKey.get(ENCRYPTION_KEY_ID);
  if (record) return record.key;

  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );

  await db.encryptionKey.put({ id: ENCRYPTION_KEY_ID, key });
  return key;
}

function getEncryptionKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = getOrCreateKey();
  }
  return keyPromise;
}

export async function encryptValue(plaintext: string): Promise<string> {
  if (!plaintext) return "";

  const key = await getEncryptionKey();
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

export async function decryptValue(encryptedText: string): Promise<string> {
  if (!encryptedText) return "";

  const key = await getEncryptionKey();
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

/** @internal Test-only: resets the cached encryption key */
export function clearEncryptionCache(): void {
  keyPromise = null;
}
