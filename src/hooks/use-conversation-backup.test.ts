import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConversationBackup } from "./use-conversation-backup";
import { createMockConversation, createMockMessage } from "@/testing/mocks/factories";

const mockConversationsToArray = vi.fn();
const mockConversationsGet = vi.fn();
const mockConversationsAdd = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    conversations: {
      toArray: () => mockConversationsToArray(),
      get: (id: string) => mockConversationsGet(id),
      add: (conv: unknown) => mockConversationsAdd(conv),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("useConversationBackup", () => {
  const originalCreateElement = document.createElement.bind(document);
  let mockAnchor: { setAttribute: ReturnType<typeof vi.fn>; click: ReturnType<typeof vi.fn> };

  beforeEach(() => {
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
  });

  it("exports conversations and creates download link", async () => {
    const conversations = [createMockConversation({ title: "Test Chat" })];
    mockConversationsToArray.mockResolvedValue(conversations);

    const { result } = renderHook(() => useConversationBackup());

    await act(async () => {
      await result.current.exportConversations();
    });

    expect(mockAnchor.setAttribute).toHaveBeenCalledWith("href", expect.stringContaining("data:application/json"));
    expect(mockAnchor.setAttribute).toHaveBeenCalledWith("download", expect.stringMatching(/brokebot-conversations-.*\.json/));
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  it("imports new conversations and returns count", async () => {
    mockConversationsGet.mockResolvedValue(undefined);
    mockConversationsAdd.mockResolvedValue(undefined);

    const { result } = renderHook(() => useConversationBackup());

    const conversationsToImport = [
      createMockConversation({
        id: "import-1",
        title: "Imported Chat",
        messages: [createMockMessage({ id: "msg-1", role: "user", content: "Hello" })],
      }),
    ];

    let importedCount = 0;
    await act(async () => {
      importedCount = await result.current.importConversations(conversationsToImport);
    });

    expect(importedCount).toBe(1);
    expect(mockConversationsAdd).toHaveBeenCalledWith(expect.objectContaining({
      id: "import-1",
      title: "Imported Chat",
    }));
  });

  it("skips existing conversations during import", async () => {
    mockConversationsGet.mockResolvedValue(createMockConversation({ id: "existing-id" }));

    const { result } = renderHook(() => useConversationBackup());

    const conversationsToImport = [createMockConversation({ id: "existing-id", title: "Duplicate" })];

    let importedCount = 0;
    await act(async () => {
      importedCount = await result.current.importConversations(conversationsToImport);
    });

    expect(importedCount).toBe(0);
    expect(mockConversationsAdd).not.toHaveBeenCalled();
  });
});
