import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConversationBackup } from "./use-conversation-backup";
import { db, DEFAULT_USER_CONFIG } from "@/lib/db";
import { clearTestDatabase, seedConversation } from "@/testing/db-helpers";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Store original createElement before any mocking
const originalCreateElement = document.createElement.bind(document);

describe("useConversationBackup", () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await clearTestDatabase();
    await db.userConfig.clear();
    await db.userConfig.add({ ...DEFAULT_USER_CONFIG });
    vi.clearAllMocks();

    // Setup document.createElement mock before each test
    createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "a") {
        return {
          setAttribute: vi.fn(),
          click: vi.fn(),
        } as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    createElementSpy?.mockRestore();
  });

  describe("exportConversations", () => {
    it("creates download link with conversations data", async () => {
      await seedConversation({ title: "Test Chat" });

      const { result } = renderHook(() => useConversationBackup());

      await act(async () => {
        await result.current.exportConversations();
      });

      expect(createElementSpy).toHaveBeenCalledWith("a");
    });

    it("initializes with isExporting as false", () => {
      const { result } = renderHook(() => useConversationBackup());

      expect(result.current.isExporting).toBe(false);
    });

    it("returns isExporting as false after completion", async () => {
      const { result } = renderHook(() => useConversationBackup());

      await act(async () => {
        await result.current.exportConversations();
      });

      expect(result.current.isExporting).toBe(false);
    });
  });

  describe("importConversations", () => {
    it("imports new conversations", async () => {
      const { result } = renderHook(() => useConversationBackup());

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

      expect(importedCount).toBe(1);
      const saved = await db.conversations.get("import-1");
      expect(saved?.title).toBe("Imported Chat");
    });

    it("skips existing conversations", async () => {
      await seedConversation({ id: "existing-id", title: "Original" });

      const { result } = renderHook(() => useConversationBackup());

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

      expect(importedCount).toBe(0);
      const saved = await db.conversations.get("existing-id");
      expect(saved?.title).toBe("Original");
    });

    it("normalizes dates from JSON strings", async () => {
      const { result } = renderHook(() => useConversationBackup());

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

    it("initializes with isImporting as false", () => {
      const { result } = renderHook(() => useConversationBackup());

      expect(result.current.isImporting).toBe(false);
    });

    it("returns isImporting as false after completion", async () => {
      const { result } = renderHook(() => useConversationBackup());

      await act(async () => {
        await result.current.importConversations([
          {
            id: "test-import",
            title: "Test",
            messages: [],
            pinned: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      });

      expect(result.current.isImporting).toBe(false);
    });
  });
});
