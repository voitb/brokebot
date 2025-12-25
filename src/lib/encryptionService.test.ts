import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { encryptValue, decryptValue, clearEncryptionCache } from "./encryptionService";

// Mock the browser APIs
const mockCanvas = {
  getContext: vi.fn(() => ({
    textBaseline: "",
    font: "",
    fillText: vi.fn(),
  })),
  toDataURL: vi.fn(() => "data:image/png;base64,mockcanvas"),
};

vi.stubGlobal("document", {
  createElement: vi.fn(() => mockCanvas),
});

vi.stubGlobal("navigator", {
  userAgent: "Mozilla/5.0 Test Browser",
  language: "en-US",
});

vi.stubGlobal("screen", {
  width: 1920,
  height: 1080,
});

describe("encryptionService", () => {
  beforeEach(() => {
    clearEncryptionCache();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
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
      // Base64 encoded string should only contain valid characters
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it("produces different output for same input (random IV)", async () => {
      const plaintext = "test-value";

      const encrypted1 = await encryptValue(plaintext);
      const encrypted2 = await encryptValue(plaintext);

      // Different IV means different ciphertext
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
      // Tamper with the encrypted data
      const tampered = encrypted.slice(0, -5) + "XXXXX";

      await expect(decryptValue(tampered)).rejects.toThrow();
    });
  });

  describe("clearEncryptionCache", () => {
    it("clears localStorage apiKeys", async () => {
      localStorage.setItem("apiKeys", JSON.stringify({ test: "value" }));

      clearEncryptionCache();

      expect(localStorage.getItem("apiKeys")).toBeNull();
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
