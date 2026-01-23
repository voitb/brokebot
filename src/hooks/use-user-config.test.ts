import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserConfig } from "./use-user-config";
import { db, DEFAULT_USER_CONFIG } from "@/lib/db";
import { clearTestDatabase } from "@/testing/db-helpers";

vi.mock("@/lib/encryption-service", () => ({
  encryptValue: vi.fn((val: string) => Promise.resolve(`encrypted_${val}`)),
  decryptValue: vi.fn((val: string) => Promise.resolve(val.replace("encrypted_", ""))),
}));

describe("useUserConfig", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    await db.userConfig.clear();
    await db.userConfig.add({ ...DEFAULT_USER_CONFIG });
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("returns default config initially", async () => {
      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config.username).toBe(DEFAULT_USER_CONFIG.username);
      });
    });

    it("decrypts API key on load", async () => {
      await db.userConfig.update("user_config", {
        openrouterApiKey: "encrypted_sk-test-key",
      });

      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config.openrouterApiKey).toBe("sk-test-key");
      });
    });
  });

  describe("updateConfig", () => {
    it("updates username", async () => {
      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config).toBeDefined();
      });

      await act(async () => {
        await result.current.updateConfig({ username: "NewUser" });
      });

      const saved = await db.userConfig.get("user_config");
      expect(saved?.username).toBe("NewUser");
    });

    it("encrypts API key before saving", async () => {
      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config).toBeDefined();
      });

      await act(async () => {
        await result.current.updateConfig({ openrouterApiKey: "sk-my-secret-key" });
      });

      const saved = await db.userConfig.get("user_config");
      expect(saved?.openrouterApiKey).toBe("encrypted_sk-my-secret-key");
    });

    it("updates timestamp on save", async () => {
      const oldDate = new Date(2020, 0, 1);
      await db.userConfig.update("user_config", { updatedAt: oldDate });

      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config).toBeDefined();
      });

      await act(async () => {
        await result.current.updateConfig({ username: "Updated" });
      });

      const saved = await db.userConfig.get("user_config");
      expect(saved?.updatedAt.getTime()).toBeGreaterThan(oldDate.getTime());
    });
  });

  describe("resetConfig", () => {
    it("resets config to defaults", async () => {
      await db.userConfig.update("user_config", {
        username: "CustomUser",
        theme: "dark",
      });

      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config).toBeDefined();
      });

      await act(async () => {
        await result.current.resetConfig();
      });

      const saved = await db.userConfig.get("user_config");
      expect(saved?.username).toBe(DEFAULT_USER_CONFIG.username);
      expect(saved?.theme).toBe(DEFAULT_USER_CONFIG.theme);
    });
  });
});
