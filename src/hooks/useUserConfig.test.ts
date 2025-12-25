import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserConfig } from "./useUserConfig";
import { db, DEFAULT_USER_CONFIG } from "../lib/db";
import { clearTestDatabase, seedConversation, seedFolder, seedDocument } from "../test/db-helpers";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("../lib/encryptionService", () => ({
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

  describe("clearAllData", () => {
    it("clears all conversations", async () => {
      await seedConversation({ title: "Test 1" });
      await seedConversation({ title: "Test 2" });

      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config).toBeDefined();
      });

      await act(async () => {
        await result.current.clearAllData();
      });

      const conversations = await db.conversations.count();
      expect(conversations).toBe(0);
    });

    it("clears all documents", async () => {
      await seedDocument({ filename: "test.txt" });

      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config).toBeDefined();
      });

      await act(async () => {
        await result.current.clearAllData();
      });

      const documents = await db.documents.count();
      expect(documents).toBe(0);
    });

    it("clears all folders", async () => {
      await seedFolder({ name: "Work" });

      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config).toBeDefined();
      });

      await act(async () => {
        await result.current.clearAllData();
      });

      const folders = await db.folders.count();
      expect(folders).toBe(0);
    });

    it("resets config after clearing", async () => {
      await db.userConfig.update("user_config", { username: "ToBeCleared" });

      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config).toBeDefined();
      });

      await act(async () => {
        await result.current.clearAllData();
      });

      const saved = await db.userConfig.get("user_config");
      expect(saved?.username).toBe(DEFAULT_USER_CONFIG.username);
    });
  });

  describe("importConversations", () => {
    it("imports new conversations", async () => {
      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config).toBeDefined();
      });

      const conversationsToImport = [
        {
          id: "import-1",
          title: "Imported Chat",
          messages: [
            { id: "msg-1", role: "user" as const, content: "Hello", createdAt: new Date() },
          ],
          pinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      let importedCount = 0;
      await act(async () => {
        importedCount = await result.current.importConversations(conversationsToImport);
      });

      expect(importedCount!).toBe(1);
      const saved = await db.conversations.get("import-1");
      expect(saved?.title).toBe("Imported Chat");
    });

    it("skips existing conversations", async () => {
      await seedConversation({ id: "existing-id", title: "Original" });

      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config).toBeDefined();
      });

      const conversationsToImport = [
        {
          id: "existing-id",
          title: "Duplicate",
          messages: [],
          pinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      let importedCount = 0;
      await act(async () => {
        importedCount = await result.current.importConversations(conversationsToImport);
      });

      expect(importedCount!).toBe(0);
      const saved = await db.conversations.get("existing-id");
      expect(saved?.title).toBe("Original");
    });

    it("normalizes dates from JSON strings", async () => {
      const { result } = renderHook(() => useUserConfig());

      await waitFor(() => {
        expect(result.current.config).toBeDefined();
      });

      const conversationsToImport = [
        {
          id: "import-dates",
          title: "Date Test",
          messages: [
            { id: "msg-1", role: "user" as const, content: "Test", createdAt: "2024-01-15T12:00:00.000Z" as unknown as Date },
          ],
          pinned: false,
          createdAt: "2024-01-15T10:00:00.000Z" as unknown as Date,
          updatedAt: "2024-01-15T11:00:00.000Z" as unknown as Date,
        },
      ];

      await act(async () => {
        await result.current.importConversations(conversationsToImport);
      });

      const saved = await db.conversations.get("import-dates");
      expect(saved?.createdAt).toBeInstanceOf(Date);
      expect(saved?.messages[0].createdAt).toBeInstanceOf(Date);
    });
  });
});
