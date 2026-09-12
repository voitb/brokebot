import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDataManagement } from "./use-data-management";
import { toast } from "sonner";
import { db, DEFAULT_USER_CONFIG } from "@/lib/db";
import { clearTestDatabase, seedConversation, seedFolder, seedDocument } from "@/testing/db-helpers";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("useDataManagement", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    await db.userConfig.clear();
    await db.userConfig.add({ ...DEFAULT_USER_CONFIG });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("clearAllData", () => {
    it("clears all conversations", async () => {
      await seedConversation({ title: "Test 1" });
      await seedConversation({ title: "Test 2" });

      const { result } = renderHook(() => useDataManagement());

      await act(async () => {
        await result.current.clearAllData();
      });

      const conversations = await db.conversations.count();
      expect(conversations).toBe(0);
    });

    it("clears all documents", async () => {
      await seedDocument({ filename: "test.txt" });

      const { result } = renderHook(() => useDataManagement());

      await act(async () => {
        await result.current.clearAllData();
      });

      const documents = await db.documents.count();
      expect(documents).toBe(0);
    });

    it("clears all folders", async () => {
      await seedFolder({ name: "Work" });

      const { result } = renderHook(() => useDataManagement());

      await act(async () => {
        await result.current.clearAllData();
      });

      const folders = await db.folders.count();
      expect(folders).toBe(0);
    });

    it("resets config after clearing", async () => {
      await db.userConfig.update("user_config", { username: "ToBeCleared" });

      const { result } = renderHook(() => useDataManagement());

      await act(async () => {
        await result.current.clearAllData();
      });

      const saved = await db.userConfig.get("user_config");
      expect(saved?.username).toBe(DEFAULT_USER_CONFIG.username);
    });

    it("clears the persisted sidebar state cookie", async () => {
      document.cookie = "sidebar_state=true; path=/";

      const { result } = renderHook(() => useDataManagement());

      await act(async () => {
        await result.current.clearAllData();
      });

      expect(document.cookie).not.toContain("sidebar_state=");
    });

    it("warns but still reports success when the model cache cannot be removed", async () => {
      await seedConversation({ title: "Test" });
      vi.stubGlobal("caches", {
        keys: vi.fn().mockRejectedValue(new Error("insecure context")),
      });

      const { result } = renderHook(() => useDataManagement());

      await act(async () => {
        await result.current.clearAllData();
      });

      expect(await db.conversations.count()).toBe(0);
      expect(toast.warning).toHaveBeenCalledTimes(1);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("initializes with isClearing as false", () => {
      const { result } = renderHook(() => useDataManagement());

      expect(result.current.isClearing).toBe(false);
    });

    it("returns isClearing as false after completion", async () => {
      const { result } = renderHook(() => useDataManagement());

      await act(async () => {
        await result.current.clearAllData();
      });

      expect(result.current.isClearing).toBe(false);
    });
  });
});
