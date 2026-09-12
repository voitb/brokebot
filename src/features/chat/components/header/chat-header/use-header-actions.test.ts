import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHeaderActions } from "./use-header-actions";
import {
  createMockFile,
  createMockFileList,
  mockNavigate,
  mockToast,
} from "@/testing/mocks/modules";
import {
  createMockConversation,
  createMockDocument,
  createMockFolder,
} from "@/testing/mocks/factories";
import { ActiveConversationContext } from "@/features/chat/hooks/use-active-conversation";
import type { Conversation } from "@/lib/db";

const mockTogglePinConversation = vi.fn();
const mockCreateEmptyConversation = vi.fn();
const mockDeleteConversation = vi.fn();
const mockImportConversations = vi.fn();

let mockConversations: Conversation[] = [];
let mockConversation: Conversation = createMockConversation({
  id: "conv-1",
  title: "Test Conversation",
});

vi.mock("@/hooks/use-conversations", async () => {
  const { createMockConversationsHook } = await import("@/testing/mocks/hooks");
  return {
    useConversations: () =>
      createMockConversationsHook({
        conversations: mockConversations,
        togglePinConversation: mockTogglePinConversation,
        createEmptyConversation: mockCreateEmptyConversation,
        deleteConversation: mockDeleteConversation,
      }),
  };
});

function wrapper({ children }: { children: ReactNode }) {
  return createElement(
    ActiveConversationContext.Provider,
    { value: { conversation: mockConversation, messages: mockConversation.messages } },
    children
  );
}

vi.mock("@/hooks/use-conversation-backup", async () => {
  const { createMockConversationBackupHook } = await import(
    "@/testing/mocks/hooks"
  );
  return {
    useConversationBackup: () =>
      createMockConversationBackupHook({
        importConversations: mockImportConversations,
      }),
  };
});

// Sub-hook behaviors tested in: use-title-edit.test.ts, use-conversation-delete.test.ts

function fileInputChange(file: File): React.ChangeEvent<HTMLInputElement> {
  const input = document.createElement("input");
  input.type = "file";
  Object.defineProperty(input, "files", {
    value: createMockFileList([file]),
    configurable: true,
  });
  return {
    target: input,
    currentTarget: input,
  } as React.ChangeEvent<HTMLInputElement>;
}

describe("useHeaderActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConversations = [
      createMockConversation({
        id: "conv-1",
        title: "Test Conversation",
        pinned: false,
      }),
    ];
    mockConversation = createMockConversation({
      id: "conv-1",
      title: "Test Conversation",
    });
    mockTogglePinConversation.mockResolvedValue(undefined);
    mockCreateEmptyConversation.mockResolvedValue("new-conv-id");
    mockDeleteConversation.mockResolvedValue(undefined);
    mockImportConversations.mockResolvedValue({
      conversations: ["imported-1"],
      folders: [],
      documents: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates new conversation and navigates to it", async () => {
    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    await act(async () => {
      await result.current.handleNewChat();
    });

    expect(mockCreateEmptyConversation).toHaveBeenCalledWith("New Conversation");
    expect(mockNavigate).toHaveBeenCalledWith("/chat/new-conv-id");
  });

  it("does not navigate when creating a conversation rejects", async () => {
    mockCreateEmptyConversation.mockRejectedValue(new Error("write failed"));

    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    await act(async () => {
      await result.current.handleNewChat();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("survives a failed pin toggle", async () => {
    mockTogglePinConversation.mockRejectedValue(new Error("write failed"));

    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    await act(async () => {
      await result.current.handleTogglePinConversation();
    });

    expect(mockTogglePinConversation).toHaveBeenCalledWith("conv-1");
  });

  it("toggles pin state for conversation", async () => {
    mockConversation = createMockConversation({
      id: "conv-1",
      title: "Pinned Conv",
      pinned: true,
    });

    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    expect(result.current.isConversationPinned).toBe(true);

    await act(async () => {
      await result.current.handleTogglePinConversation();
    });

    expect(mockTogglePinConversation).toHaveBeenCalledWith("conv-1");
  });

  it("imports a backup from a .json file with an empty MIME type", async () => {
    const imported = createMockConversation({
      id: "imported-1",
      title: "Imported Chat",
    });
    const payload = JSON.stringify({
      conversations: [imported],
      folders: [],
      documents: [],
    });
    const file = createMockFile("backup.json", payload, "");
    Object.defineProperty(file, "text", {
      value: () => Promise.resolve(payload),
    });

    expect(file.type).toBe("");

    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    await act(async () => {
      await result.current.handleFileImport(fileInputChange(file));
    });

    expect(mockImportConversations).toHaveBeenCalledTimes(1);
    expect(mockImportConversations).toHaveBeenCalledWith({
      conversations: [imported],
      folders: [],
      documents: [],
    });
    expect(mockToast.success).toHaveBeenCalledWith(
      "Conversation imported successfully!"
    );
    expect(mockNavigate).toHaveBeenCalledWith("/chat/imported-1");
  });

  it("hands the backup's folders and documents to the importer", async () => {
    const folder = createMockFolder({ id: "folder-1", name: "Work" });
    const document = { ...createMockDocument({ filename: "notes.txt" }), id: 3 };
    const conversation = createMockConversation({
      id: "imported-1",
      folderId: folder.id,
    });
    const payload = JSON.stringify({
      conversations: [conversation],
      folders: [folder],
      documents: [document],
    });
    const file = createMockFile("backup.json", payload, "application/json");
    Object.defineProperty(file, "text", {
      value: () => Promise.resolve(payload),
    });

    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    await act(async () => {
      await result.current.handleFileImport(fileInputChange(file));
    });

    expect(mockImportConversations).toHaveBeenCalledWith({
      conversations: [conversation],
      folders: [folder],
      documents: [document],
    });
    expect(mockNavigate).toHaveBeenCalledWith("/chat/imported-1");
  });

  it("imports a legacy export holding a single conversation object", async () => {
    const legacy = createMockConversation({
      id: "legacy-1",
      title: "Legacy Chat",
    });
    mockImportConversations.mockResolvedValue({
      conversations: ["legacy-1"],
      folders: [],
      documents: [],
    });
    const payload = JSON.stringify(legacy);
    const file = createMockFile(
      "conversation-legacy-1.json",
      payload,
      "application/json"
    );
    Object.defineProperty(file, "text", {
      value: () => Promise.resolve(payload),
    });

    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    await act(async () => {
      await result.current.handleFileImport(fileInputChange(file));
    });

    expect(mockImportConversations).toHaveBeenCalledWith({
      conversations: [legacy],
      folders: [],
      documents: [],
    });
    expect(mockNavigate).toHaveBeenCalledWith("/chat/legacy-1");
  });

  it("navigates to the conversation that was added, not the skipped duplicate", async () => {
    const existing = createMockConversation({ id: "existing-1" });
    const added = createMockConversation({ id: "added-2" });
    mockImportConversations.mockResolvedValue({
      conversations: ["added-2"],
      folders: [],
      documents: [],
    });
    const payload = JSON.stringify({
      conversations: [existing, added],
      folders: [],
      documents: [],
    });
    const file = createMockFile("backup.json", payload, "application/json");
    Object.defineProperty(file, "text", {
      value: () => Promise.resolve(payload),
    });

    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    await act(async () => {
      await result.current.handleFileImport(fileInputChange(file));
    });

    expect(mockNavigate).toHaveBeenCalledWith("/chat/added-2");
  });

  it("stays put and informs when the backup added nothing", async () => {
    const existing = createMockConversation({ id: "existing-1" });
    mockImportConversations.mockResolvedValue({
      conversations: [],
      folders: [],
      documents: [],
    });
    const payload = JSON.stringify({
      conversations: [existing],
      folders: [],
      documents: [],
    });
    const file = createMockFile("backup.json", payload, "application/json");
    Object.defineProperty(file, "text", {
      value: () => Promise.resolve(payload),
    });

    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    await act(async () => {
      await result.current.handleFileImport(fileInputChange(file));
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToast.info).toHaveBeenCalledWith(
      "Conversation already exists. No changes were made."
    );
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it("reports the folders and documents restored when no conversation was added", async () => {
    const existing = createMockConversation({ id: "existing-1" });
    mockImportConversations.mockResolvedValue({
      conversations: [],
      folders: ["folder-1"],
      documents: [7],
    });
    const payload = JSON.stringify({
      conversations: [existing],
      folders: [createMockFolder({ id: "folder-1" })],
      documents: [createMockDocument()],
    });
    const file = createMockFile("backup.json", payload, "application/json");
    Object.defineProperty(file, "text", {
      value: () => Promise.resolve(payload),
    });

    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    await act(async () => {
      await result.current.handleFileImport(fileInputChange(file));
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToast.info).toHaveBeenCalledWith(
      "Conversation already exists. Restored 2 folder(s) and document(s)."
    );
  });

  it("does not blame the file when storing the imported conversations fails", async () => {
    mockImportConversations.mockRejectedValue(new Error("quota exceeded"));
    const payload = JSON.stringify({
      conversations: [createMockConversation({ id: "imported-1" })],
      folders: [],
      documents: [],
    });
    const file = createMockFile("backup.json", payload, "application/json");
    Object.defineProperty(file, "text", {
      value: () => Promise.resolve(payload),
    });

    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    await act(async () => {
      await result.current.handleFileImport(fileInputChange(file));
    });

    expect(mockToast.error).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("exports the open conversation as a downloadable JSON file", () => {
    const clickedAnchors: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      clickedAnchors.push(this);
    });

    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    act(() => {
      result.current.handleExportConversation();
    });

    expect(clickedAnchors).toHaveLength(1);
    expect(clickedAnchors[0].getAttribute("download")).toBe(
      "conversation-conv-1.json"
    );

    const linkHref = clickedAnchors[0].getAttribute("href") ?? "";
    expect(linkHref).toContain("data:application/json");
    expect(decodeURIComponent(linkHref)).toContain("Test Conversation");
  });

  it("deletes the conversation and shows one success toast", async () => {
    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    await act(async () => {
      await result.current.handleDeleteConfirm();
    });

    expect(mockDeleteConversation).toHaveBeenCalledWith("conv-1");
    expect(mockToast.success).toHaveBeenCalledTimes(1);
    expect(mockToast.success).toHaveBeenCalledWith(
      "Conversation deleted successfully."
    );
    expect(mockNavigate).toHaveBeenCalledWith("/chat");
  });

  it("opens the delete dialog when the delete shortcut targets this conversation", () => {
    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    act(() => {
      document.dispatchEvent(
        new CustomEvent("conversation:delete", {
          detail: { conversationId: "conv-1" },
        })
      );
    });

    expect(result.current.deleteDialogOpen).toBe(true);
  });

  it("ignores a delete shortcut aimed at another conversation", () => {
    const { result } = renderHook(
      () => useHeaderActions({ conversationId: "conv-1" }),
      { wrapper }
    );

    act(() => {
      document.dispatchEvent(
        new CustomEvent("conversation:delete", {
          detail: { conversationId: "conv-2" },
        })
      );
    });

    expect(result.current.deleteDialogOpen).toBe(false);
  });
});
