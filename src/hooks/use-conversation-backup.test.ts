import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConversationBackup, type ImportedBackupIds } from "./use-conversation-backup";
import { db } from "@/lib/db";
import {
  clearTestDatabase,
  seedConversation,
  seedDocument,
  seedFolder,
} from "@/testing/db-helpers";
import {
  createMockConversation,
  createMockDocument,
  createMockFolder,
  createMockMessage,
} from "@/testing/mocks/factories";
import {
  parseConversationBackup,
  type ConversationBackup,
} from "@/lib/schemas/conversation-backup-schema";
import { mockToast } from "@/testing/mocks/modules";

describe("useConversationBackup", () => {
  const originalCreateElement = document.createElement.bind(document);
  let mockAnchor: { setAttribute: ReturnType<typeof vi.fn>; click: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
    mockAnchor = { setAttribute: vi.fn(), click: vi.fn() };

    document.createElement = ((tagName: string) => {
      if (tagName === "a") {
        return mockAnchor as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    }) as typeof document.createElement;
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
    vi.restoreAllMocks();
  });

  function exportedBackup() {
    const href = mockAnchor.setAttribute.mock.calls.find(([name]) => name === "href")?.[1] as string;
    return JSON.parse(decodeURIComponent(href.replace("data:application/json;charset=utf-8,", "")));
  }

  it("exports conversations, folders and documents as one backup document", async () => {
    await seedConversation({ title: "Test Chat" });
    await seedFolder({ name: "Work" });
    await seedDocument({ filename: "notes.txt" });

    const { result } = renderHook(() => useConversationBackup());

    await act(async () => {
      await result.current.exportConversations();
    });

    const exported = exportedBackup();

    expect(exported.conversations[0].title).toBe("Test Chat");
    expect(exported.folders[0].name).toBe("Work");
    expect(exported.documents[0].filename).toBe("notes.txt");
    expect(mockAnchor.setAttribute).toHaveBeenCalledWith("download", expect.stringMatching(/brokebot-conversations-.*\.json/));
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  it("rejects when reading folders fails during export", async () => {
    vi.spyOn(db.folders, "toArray").mockRejectedValueOnce(new Error("folders unavailable"));

    const { result } = renderHook(() => useConversationBackup());

    await act(async () => {
      await expect(result.current.exportConversations()).rejects.toThrow("folders unavailable");
    });
  });

  function backupOf(overrides: Partial<ConversationBackup> = {}): ConversationBackup {
    return { conversations: [], folders: [], documents: [], ...overrides };
  }

  it("imports new conversations and returns their ids", async () => {
    const { result } = renderHook(() => useConversationBackup());

    let importedIds: string[] = [];
    await act(async () => {
      importedIds = (
        await result.current.importConversations(
          backupOf({
            conversations: [
              createMockConversation({
                id: "import-1",
                title: "Imported Chat",
                messages: [createMockMessage({ id: "msg-1", content: "Hello" })],
              }),
            ],
          })
        )
      ).conversations;
    });

    expect(importedIds).toEqual(["import-1"]);
    await expect(db.conversations.get("import-1")).resolves.toMatchObject({
      title: "Imported Chat",
    });
  });

  it("skips conversations that are already stored", async () => {
    await seedConversation({ id: "existing-id", title: "Stored" });

    const { result } = renderHook(() => useConversationBackup());

    let importedIds: string[] = [];
    await act(async () => {
      importedIds = (
        await result.current.importConversations(
          backupOf({
            conversations: [createMockConversation({ id: "existing-id", title: "Duplicate" })],
          })
        )
      ).conversations;
    });

    expect(importedIds).toEqual([]);
    await expect(db.conversations.get("existing-id")).resolves.toMatchObject({
      title: "Stored",
    });
  });

  it("returns only the ids it added when a stored conversation comes first", async () => {
    await seedConversation({ id: "existing-id", title: "Stored" });

    const { result } = renderHook(() => useConversationBackup());

    let importedIds: string[] = [];
    await act(async () => {
      importedIds = (
        await result.current.importConversations(
          backupOf({
            conversations: [
              createMockConversation({ id: "existing-id", title: "Duplicate" }),
              createMockConversation({ id: "import-2", title: "Fresh" }),
            ],
          })
        )
      ).conversations;
    });

    expect(importedIds).toEqual(["import-2"]);
  });

  it("rejects when writing a conversation fails during import", async () => {
    vi.spyOn(db.conversations, "add").mockRejectedValueOnce(new Error("write unavailable"));

    const { result } = renderHook(() => useConversationBackup());

    await act(async () => {
      await expect(
        result.current.importConversations(
          backupOf({ conversations: [createMockConversation()] })
        )
      ).rejects.toThrow("write unavailable");
    });

    expect(mockToast.error).toHaveBeenCalledWith("Failed to import conversations.");
  });

  it("stores nothing when a later conversation fails to import", async () => {
    const addConversation = db.conversations.add.bind(db.conversations);
    vi.spyOn(db.conversations, "add")
      .mockImplementationOnce(addConversation)
      .mockRejectedValueOnce(new Error("write unavailable"));

    const { result } = renderHook(() => useConversationBackup());

    await act(async () => {
      await expect(
        result.current.importConversations(
          backupOf({
            conversations: [
              createMockConversation({ id: "import-1" }),
              createMockConversation({ id: "import-2" }),
            ],
          })
        )
      ).rejects.toThrow("write unavailable");
    });

    await expect(db.conversations.count()).resolves.toBe(0);
  });
  it("restores folder membership and documents from an exported backup", async () => {
    const folder = await seedFolder({ id: "folder-1", name: "Work" });
    await seedConversation({ id: "conv-1", title: "Filed Chat", folderId: folder.id });
    await seedDocument({ filename: "notes.txt", content: "Remember this" });

    const { result } = renderHook(() => useConversationBackup());

    await act(async () => {
      await result.current.exportConversations();
    });

    const parsed = parseConversationBackup(exportedBackup());
    if (!parsed.success) throw new Error("exported backup did not parse");

    await clearTestDatabase();

    let imported: ImportedBackupIds | undefined;
    await act(async () => {
      imported = await result.current.importConversations(parsed.backup);
    });

    expect(imported).toEqual({
      conversations: ["conv-1"],
      folders: ["folder-1"],
      documents: [expect.any(Number)],
    });
    await expect(db.conversations.get("conv-1")).resolves.toMatchObject({ folderId: "folder-1" });
    await expect(db.folders.get("folder-1")).resolves.toMatchObject({ name: "Work" });
    await expect(db.documents.toArray()).resolves.toMatchObject([
      { filename: "notes.txt", content: "Remember this" },
    ]);
  });

  it("skips folders and documents that are already stored", async () => {
    await seedFolder({ id: "folder-1", name: "Stored Folder" });
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    const storedDocument = await seedDocument({
      filename: "stored.txt",
      content: "Stored body",
      createdAt,
    });

    const { result } = renderHook(() => useConversationBackup());

    let imported: ImportedBackupIds | undefined;
    await act(async () => {
      imported = await result.current.importConversations(
        backupOf({
          folders: [createMockFolder({ id: "folder-1", name: "Duplicate Folder" })],
          documents: [
            createMockDocument({
              id: storedDocument.id,
              filename: "stored.txt",
              content: "Stored body",
              createdAt,
            }),
          ],
        })
      );
    });

    expect(imported).toEqual({ conversations: [], folders: [], documents: [] });
    await expect(db.folders.get("folder-1")).resolves.toMatchObject({ name: "Stored Folder" });
    await expect(db.documents.count()).resolves.toBe(1);
    await expect(db.documents.get(storedDocument.id!)).resolves.toMatchObject({
      filename: "stored.txt",
      content: "Stored body",
    });
  });

  it("keeps a document whose filename and content match a stored one uploaded at another time", async () => {
    await seedDocument({
      filename: "notes.txt",
      content: "Remember this",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
    });

    const { result } = renderHook(() => useConversationBackup());

    let imported: ImportedBackupIds | undefined;
    await act(async () => {
      imported = await result.current.importConversations(
        backupOf({
          documents: [
            createMockDocument({
              filename: "notes.txt",
              content: "Remember this",
              createdAt: new Date("2025-06-01T00:00:00.000Z"),
            }),
          ],
        })
      );
    });

    expect(imported!.documents).toHaveLength(1);
    await expect(db.documents.count()).resolves.toBe(2);
  });

  it("keeps a document whose filename differs from a stored one saved at the same time", async () => {
    await seedDocument({
      filename: "local.txt",
      content: "Shared body",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
    });

    const { result } = renderHook(() => useConversationBackup());

    let imported: ImportedBackupIds | undefined;
    await act(async () => {
      imported = await result.current.importConversations(
        backupOf({
          documents: [
            createMockDocument({
              filename: "imported.txt",
              content: "Shared body",
              createdAt: new Date("2025-01-01T00:00:00.000Z"),
            }),
          ],
        })
      );
    });

    expect(imported!.documents).toHaveLength(1);
    await expect(db.documents.orderBy("filename").toArray()).resolves.toMatchObject([
      { filename: "imported.txt" },
      { filename: "local.txt" },
    ]);
  });

  it("restores both uploads of the same file from one backup", async () => {
    await seedDocument({
      filename: "notes.txt",
      content: "Remember this",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
    });
    await seedDocument({
      filename: "notes.txt",
      content: "Remember this",
      createdAt: new Date("2025-06-01T00:00:00.000Z"),
    });

    const { result } = renderHook(() => useConversationBackup());

    await act(async () => {
      await result.current.exportConversations();
    });

    const parsed = parseConversationBackup(exportedBackup());
    if (!parsed.success) throw new Error("exported backup did not parse");

    await clearTestDatabase();

    let imported: ImportedBackupIds | undefined;
    await act(async () => {
      imported = await result.current.importConversations(parsed.backup);
    });

    expect(imported!.documents).toHaveLength(2);
    await expect(db.documents.count()).resolves.toBe(2);
  });

  it("keeps a document whose exported id collides with an unrelated stored one", async () => {
    const storedDocument = await seedDocument({
      filename: "local.txt",
      content: "Local body",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
    });

    const { result } = renderHook(() => useConversationBackup());

    let imported: ImportedBackupIds | undefined;
    await act(async () => {
      imported = await result.current.importConversations(
        backupOf({
          documents: [
            createMockDocument({
              id: storedDocument.id,
              filename: "imported.txt",
              content: "Imported body",
              createdAt: new Date("2025-06-01T00:00:00.000Z"),
            }),
          ],
        })
      );
    });

    expect(imported!.documents).toHaveLength(1);
    expect(imported!.documents[0]).not.toBe(storedDocument.id);
    await expect(db.documents.orderBy("filename").toArray()).resolves.toMatchObject([
      { filename: "imported.txt", content: "Imported body" },
      { filename: "local.txt", content: "Local body" },
    ]);
  });

  it("stores nothing when a document fails after folders and conversations were written", async () => {
    vi.spyOn(db.documents, "add").mockRejectedValueOnce(new Error("write unavailable"));

    const { result } = renderHook(() => useConversationBackup());

    await act(async () => {
      await expect(
        result.current.importConversations(
          backupOf({
            folders: [createMockFolder({ id: "folder-1" })],
            conversations: [createMockConversation({ id: "conv-1", folderId: "folder-1" })],
            documents: [createMockDocument()],
          })
        )
      ).rejects.toThrow("write unavailable");
    });

    await expect(db.folders.count()).resolves.toBe(0);
    await expect(db.conversations.count()).resolves.toBe(0);
    await expect(db.documents.count()).resolves.toBe(0);
  });
});
