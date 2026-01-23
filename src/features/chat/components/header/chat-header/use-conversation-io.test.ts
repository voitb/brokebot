import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConversationIO } from "./use-conversation-io";
import { mockNavigate, mockToast } from "@/testing/mocks/modules";
import { createMockConversation } from "@/testing/mocks/factories";
import type { Conversation } from "@/lib/db";

describe("useConversationIO", () => {
  const mockImportConversations = vi.fn();
  let mockConversation: Conversation;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConversation = createMockConversation({
      id: "conv-1",
      title: "Test Conversation",
    });
    mockImportConversations.mockResolvedValue(1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("fileInputRef", () => {
    it("returns a ref object", () => {
      const { result } = renderHook(() =>
        useConversationIO({
          conversation: mockConversation,
          importConversations: mockImportConversations,
        })
      );

      expect(result.current.fileInputRef).toBeDefined();
      expect(result.current.fileInputRef.current).toBeNull();
    });
  });

  describe("handleExportConversation", () => {
    it("exports conversation as JSON file", () => {
      const mockClick = vi.fn();
      const mockSetAttribute = vi.fn();
      const originalCreateElement = document.createElement.bind(document);

      vi.spyOn(document, "createElement").mockImplementation(
        (tagName: string) => {
          if (tagName === "a") {
            return {
              setAttribute: mockSetAttribute,
              click: mockClick,
            } as unknown as HTMLAnchorElement;
          }
          return originalCreateElement(tagName);
        }
      );

      const { result } = renderHook(() =>
        useConversationIO({
          conversation: mockConversation,
          importConversations: mockImportConversations,
        })
      );

      act(() => {
        result.current.handleExportConversation();
      });

      expect(mockSetAttribute).toHaveBeenCalledWith(
        "href",
        expect.stringContaining("data:application/json")
      );
      expect(mockSetAttribute).toHaveBeenCalledWith(
        "download",
        `conversation-${mockConversation.id}.json`
      );
      expect(mockClick).toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it("does nothing when conversation is undefined", () => {
      const createElementSpy = vi.spyOn(document, "createElement");

      const { result } = renderHook(() =>
        useConversationIO({
          conversation: undefined,
          importConversations: mockImportConversations,
        })
      );

      act(() => {
        result.current.handleExportConversation();
      });

      expect(createElementSpy).not.toHaveBeenCalledWith("a");
    });

    it("shows error toast on export failure", () => {
      vi.spyOn(JSON, "stringify").mockImplementation(() => {
        throw new Error("Stringify failed");
      });

      const { result } = renderHook(() =>
        useConversationIO({
          conversation: mockConversation,
          importConversations: mockImportConversations,
        })
      );

      act(() => {
        result.current.handleExportConversation();
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to export conversation."
      );

      vi.restoreAllMocks();
    });
  });

  describe("handleImportConversation", () => {
    it("triggers file input click", () => {
      const { result } = renderHook(() =>
        useConversationIO({
          conversation: mockConversation,
          importConversations: mockImportConversations,
        })
      );

      const mockClick = vi.fn();
      Object.defineProperty(result.current.fileInputRef, "current", {
        value: { click: mockClick },
        writable: true,
      });

      act(() => {
        result.current.handleImportConversation();
      });

      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe("handleFileImport", () => {
    const createMockFileWithText = (
      content: string,
      name: string,
      type: string
    ): File => {
      const file = new File([content], name, { type });
      file.text = vi.fn().mockResolvedValue(content);
      return file;
    };

    const createFileChangeEvent = (
      file: File | null
    ): React.ChangeEvent<HTMLInputElement> => {
      return {
        target: {
          files: file ? [file] : null,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
    };

    it("shows error for non-JSON files", async () => {
      const { result } = renderHook(() =>
        useConversationIO({
          conversation: mockConversation,
          importConversations: mockImportConversations,
        })
      );

      const textFile = createMockFileWithText("content", "test.txt", "text/plain");

      await act(async () => {
        await result.current.handleFileImport(createFileChangeEvent(textFile));
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        "Please select a valid JSON file."
      );
    });

    it("shows error for invalid conversation format", async () => {
      const { result } = renderHook(() =>
        useConversationIO({
          conversation: mockConversation,
          importConversations: mockImportConversations,
        })
      );

      const invalidJson = createMockFileWithText(
        '{"invalid": true}',
        "conversation.json",
        "application/json"
      );

      await act(async () => {
        await result.current.handleFileImport(createFileChangeEvent(invalidJson));
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining("Invalid conversation format")
      );
    });

    it("imports valid conversation and navigates", async () => {
      const validConversation = {
        id: "imported-conv",
        title: "Imported",
        messages: [],
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { result } = renderHook(() =>
        useConversationIO({
          conversation: mockConversation,
          importConversations: mockImportConversations,
        })
      );

      const validFile = createMockFileWithText(
        JSON.stringify(validConversation),
        "conversation.json",
        "application/json"
      );

      await act(async () => {
        await result.current.handleFileImport(createFileChangeEvent(validFile));
      });

      expect(mockImportConversations).toHaveBeenCalledWith([
        expect.objectContaining({ id: "imported-conv" }),
      ]);
      expect(mockToast.success).toHaveBeenCalledWith(
        "Conversation imported successfully!"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/chat/imported-conv");
    });

    it("shows info toast when conversation already exists", async () => {
      mockImportConversations.mockResolvedValue(0);

      const validConversation = {
        id: "existing-conv",
        title: "Existing",
        messages: [],
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { result } = renderHook(() =>
        useConversationIO({
          conversation: mockConversation,
          importConversations: mockImportConversations,
        })
      );

      const validFile = createMockFileWithText(
        JSON.stringify(validConversation),
        "conversation.json",
        "application/json"
      );

      await act(async () => {
        await result.current.handleFileImport(createFileChangeEvent(validFile));
      });

      expect(mockToast.info).toHaveBeenCalledWith(
        "Conversation already exists. No changes were made."
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("shows error for invalid JSON", async () => {
      const { result } = renderHook(() =>
        useConversationIO({
          conversation: mockConversation,
          importConversations: mockImportConversations,
        })
      );

      const invalidJsonFile = createMockFileWithText(
        "not valid json {{{",
        "conversation.json",
        "application/json"
      );

      await act(async () => {
        await result.current.handleFileImport(
          createFileChangeEvent(invalidJsonFile)
        );
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to parse conversation file. Invalid JSON."
      );
    });

    it("does nothing when no file is selected", async () => {
      const { result } = renderHook(() =>
        useConversationIO({
          conversation: mockConversation,
          importConversations: mockImportConversations,
        })
      );

      await act(async () => {
        await result.current.handleFileImport(createFileChangeEvent(null));
      });

      expect(mockImportConversations).not.toHaveBeenCalled();
      expect(mockToast.error).not.toHaveBeenCalled();
    });
  });
});
