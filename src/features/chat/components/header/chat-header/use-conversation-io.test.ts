import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConversationIO } from "./use-conversation-io";
import { mockNavigate, mockToast } from "@/testing/mocks/modules";
import { createMockConversation } from "@/testing/mocks/factories";
import type { Conversation } from "@/lib/db";

function createMockFile(content: string, name: string, type: string): File {
  const file = new File([content], name, { type });
  file.text = vi.fn().mockResolvedValue(content);
  return file;
}

function createFileEvent(file: File | null): React.ChangeEvent<HTMLInputElement> {
  return { target: { files: file ? [file] : null } } as React.ChangeEvent<HTMLInputElement>;
}

function createValidConversationJson(id = "imported-conv") {
  return JSON.stringify({
    id,
    title: "Imported",
    messages: [],
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

describe("useConversationIO", () => {
  const mockImportConversations = vi.fn();
  let mockConversation: Conversation;

  function renderIOHook(conversation?: Conversation) {
    return renderHook(() =>
      useConversationIO({
        conversation,
        importConversations: mockImportConversations,
      })
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockConversation = createMockConversation({ id: "conv-1", title: "Test Conversation" });
    mockImportConversations.mockResolvedValue(1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("handleFileImport", () => {
    it("shows error for non-JSON files", async () => {
      const { result } = renderIOHook(mockConversation);
      const textFile = createMockFile("content", "test.txt", "text/plain");

      await act(async () => {
        await result.current.handleFileImport(createFileEvent(textFile));
      });

      expect(mockToast.error).toHaveBeenCalledWith("Please select a valid JSON file.");
    });

    it("shows error for invalid conversation format", async () => {
      const { result } = renderIOHook(mockConversation);
      const invalidJson = createMockFile('{"invalid": true}', "conversation.json", "application/json");

      await act(async () => {
        await result.current.handleFileImport(createFileEvent(invalidJson));
      });

      expect(mockToast.error).toHaveBeenCalledWith(expect.stringContaining("Invalid conversation format"));
    });

    it("shows error for invalid JSON syntax", async () => {
      const { result } = renderIOHook(mockConversation);
      const brokenJson = createMockFile("not valid json {{{", "conversation.json", "application/json");

      await act(async () => {
        await result.current.handleFileImport(createFileEvent(brokenJson));
      });

      expect(mockToast.error).toHaveBeenCalledWith("Failed to parse conversation file. Invalid JSON.");
    });

    it("imports valid conversation and navigates", async () => {
      const { result } = renderIOHook(mockConversation);
      const validFile = createMockFile(createValidConversationJson("imported-conv"), "conversation.json", "application/json");

      await act(async () => {
        await result.current.handleFileImport(createFileEvent(validFile));
      });

      expect(mockImportConversations).toHaveBeenCalledWith([expect.objectContaining({ id: "imported-conv" })]);
      expect(mockToast.success).toHaveBeenCalledWith("Conversation imported successfully!");
      expect(mockNavigate).toHaveBeenCalledWith("/chat/imported-conv");
    });

    it("shows info toast when conversation already exists", async () => {
      mockImportConversations.mockResolvedValue(0);
      const { result } = renderIOHook(mockConversation);
      const validFile = createMockFile(createValidConversationJson("existing-conv"), "conversation.json", "application/json");

      await act(async () => {
        await result.current.handleFileImport(createFileEvent(validFile));
      });

      expect(mockToast.info).toHaveBeenCalledWith("Conversation already exists. No changes were made.");
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("does nothing when no file is selected", async () => {
      const { result } = renderIOHook(mockConversation);

      await act(async () => {
        await result.current.handleFileImport(createFileEvent(null));
      });

      expect(mockImportConversations).not.toHaveBeenCalled();
      expect(mockToast.error).not.toHaveBeenCalled();
    });
  });
});
