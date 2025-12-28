import { describe, it, expect, beforeEach, vi } from "vitest";
import { encryptValue, decryptValue, clearEncryptionCache } from "./encryption-service";

// Mock the db module
vi.mock("./db", () => {
  let storage: Map<string, { id: string; key: CryptoKey }> = new Map();

  return {
    db: {
      encryptionKey: {
        get: vi.fn(async (id: string) => storage.get(id)),
        add: vi.fn(async (record: { id: string; key: CryptoKey }) => {
          storage.set(record.id, record);
        }),
      },
    },
    // Reset storage for tests
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

  describe("encryptValue", () => {
    it("returns empty string for empty input", async () => {
      const result = await encryptValue("");
      expect(result).toBe("");
    });

    it("encrypts a simple string", async () => {
      const plaintext = "my-secret-api-key";
      const encrypted = await encryptValue(plaintext);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it("produces different output for same input (random IV)", async () => {
      const plaintext = "test-value";

      const encrypted1 = await encryptValue(plaintext);
      const encrypted2 = await encryptValue(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it("handles special characters", async () => {
      const plaintext = "sk-or-v1-abc123!@#$%^&*()";
      const encrypted = await encryptValue(plaintext);

      expect(encrypted).toBeTruthy();
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it("handles unicode characters", async () => {
      const plaintext = "secret-with-emoji-🔐";
      const encrypted = await encryptValue(plaintext);

      expect(encrypted).toBeTruthy();
    });
  });

  describe("decryptValue", () => {
    it("returns empty string for empty input", async () => {
      const result = await decryptValue("");
      expect(result).toBe("");
    });

    it("decrypts to original value", async () => {
      const original = "my-api-key-12345";
      const encrypted = await encryptValue(original);
      const decrypted = await decryptValue(encrypted);

      expect(decrypted).toBe(original);
    });

    it("correctly decrypts special characters", async () => {
      const original = "sk-or-v1-!@#$%^&*()_+-=[]{}|;':\",./<>?";
      const encrypted = await encryptValue(original);
      const decrypted = await decryptValue(encrypted);

      expect(decrypted).toBe(original);
    });

    it("correctly decrypts unicode", async () => {
      const original = "key-with-unicode-日本語-🔐";
      const encrypted = await encryptValue(original);
      const decrypted = await decryptValue(encrypted);

      expect(decrypted).toBe(original);
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

  describe("encryption roundtrip", () => {
    it("maintains data integrity through multiple encrypt/decrypt cycles", async () => {
      const original = "test-api-key-xyz";

      for (let i = 0; i < 5; i++) {
        const encrypted = await encryptValue(original);
        const decrypted = await decryptValue(encrypted);
        expect(decrypted).toBe(original);
      }
    });

    it("handles long strings", async () => {
      const original = "a".repeat(1000);
      const encrypted = await encryptValue(original);
      const decrypted = await decryptValue(encrypted);

      expect(decrypted).toBe(original);
    });
  });
});
