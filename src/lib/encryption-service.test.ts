import { describe, it, expect, beforeEach, vi } from "vitest";
import { encryptValue, decryptValue, clearEncryptionCache } from "./encryption-service";

vi.mock("./db", () => {
  let storage: Map<string, { id: string; key: CryptoKey }> = new Map();

  return {
    db: {
      encryptionKey: {
        get: vi.fn(async (id: string) => storage.get(id)),
        put: vi.fn(async (record: { id: string; key: CryptoKey }) => {
          storage.set(record.id, record);
        }),
      },
    },
    __resetStorage: () => {
      storage = new Map();
    },
  };
});

describe("encryptionService", () => {
  beforeEach(async () => {
    clearEncryptionCache();
    const dbModule = (await import("./db")) as typeof import("./db") & {
      __resetStorage: () => void;
    };
    dbModule.__resetStorage();
  });

  it("encrypts and decrypts values correctly", async () => {
    const original = "my-secret-api-key";

    const encrypted = await encryptValue(original);
    const decrypted = await decryptValue(encrypted);

    expect(encrypted).not.toBe(original);
    expect(decrypted).toBe(original);
  });

  it("produces different ciphertext for same input (random IV)", async () => {
    const plaintext = "test-value";

    const encrypted1 = await encryptValue(plaintext);
    const encrypted2 = await encryptValue(plaintext);

    expect(encrypted1).not.toBe(encrypted2);
  });

  it("throws for invalid encrypted data", async () => {
    await expect(decryptValue("not-valid-base64!@#")).rejects.toThrow();
  });

  it("throws for tampered data", async () => {
    const encrypted = await encryptValue("secret");
    const tampered = encrypted.slice(0, -5) + "XXXXX";

    await expect(decryptValue(tampered)).rejects.toThrow();
  });
});
