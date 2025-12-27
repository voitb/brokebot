import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHeaderActions } from "./useHeaderActions";
import { mockNavigate, mockToast } from "../../../../test/mocks/modules";
import { createMockConversation } from "../../../../test/mocks/factories";
import type { Conversation } from "../../../../lib/db";

const mockTogglePinConversation = vi.fn();
const mockUpdateConversationTitle = vi.fn();
const mockCreateEmptyConversation = vi.fn();
const mockDeleteConversation = vi.fn();
const mockImportConversations = vi.fn();

let mockConversations: Conversation[] = [
  createMockConversation({ id: "conv-1", title: "Test Conversation", pinned: false }),
];
let mockConversation: Conversation = createMockConversation({ id: "conv-1", title: "Test Conversation" });

// react-router-dom is globally mocked in setup.ts

vi.mock("../../../../hooks/useConversations", async () => {
  const { createMockConversationsHook, createMockConversationHook } = await import(
    "../../../../test/mocks/hooks"
  );
  return {
    useConversations: () =>
      createMockConversationsHook({
        conversations: mockConversations,
        togglePinConversation: mockTogglePinConversation,
        updateConversationTitle: mockUpdateConversationTitle,
        createEmptyConversation: mockCreateEmptyConversation,
        deleteConversation: mockDeleteConversation,
      }),
    useConversation: () =>
      createMockConversationHook({
        conversation: mockConversation,
      }),
  };
});

vi.mock("../../../../hooks/useUserConfig", async () => {
  const { createMockUserConfigHook } = await import("../../../../test/mocks/hooks");
  return {
    useUserConfig: () => createMockUserConfigHook({
      importConversations: mockImportConversations,
    }),
  };
});

// sonner is globally mocked in setup.ts, use mockToast for assertions

describe("useHeaderActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConversations = [
      createMockConversation({ id: "conv-1", title: "Test Conversation", pinned: false }),
    ];
    mockConversation = createMockConversation({ id: "conv-1", title: "Test Conversation" });
    mockCreateEmptyConversation.mockResolvedValue("new-conv-id");
    mockDeleteConversation.mockResolvedValue(undefined);
    mockImportConversations.mockResolvedValue(1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("returns correct initial state", () => {
      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      expect(result.current.isEditingTitle).toBe(false);
      expect(result.current.conversationTitle).toBe("Test Conversation");
      expect(result.current.isConversationPinned).toBe(false);
      expect(result.current.deleteDialogOpen).toBe(false);
    });

    it("returns undefined title when no conversation", () => {
      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "non-existent" })
      );

      expect(result.current.conversationTitle).toBeUndefined();
    });

    it("shows pinned state correctly", () => {
      mockConversations = [
        createMockConversation({ id: "conv-1", title: "Pinned Conv", pinned: true }),
      ];

      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      expect(result.current.isConversationPinned).toBe(true);
    });
  });

  describe("handleNewChat", () => {
    it("creates new conversation and navigates", async () => {
      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      await act(async () => {
        await result.current.handleNewChat();
      });

      expect(mockCreateEmptyConversation).toHaveBeenCalledWith("New Conversation");
      expect(mockNavigate).toHaveBeenCalledWith("/chat/new-conv-id");
    });

    it("does not navigate if creation fails", async () => {
      mockCreateEmptyConversation.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      await act(async () => {
        await result.current.handleNewChat();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("title editing", () => {
    it("handleTitleClick enables editing mode", () => {
      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      act(() => {
        result.current.handleTitleClick();
      });

      expect(result.current.isEditingTitle).toBe(true);
    });

    it("handleSaveTitle updates title and exits edit mode", async () => {
      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      act(() => {
        result.current.handleTitleClick();
      });

      await act(async () => {
        await result.current.handleSaveTitle("New Title");
      });

      expect(mockUpdateConversationTitle).toHaveBeenCalledWith("conv-1", "New Title");
      expect(result.current.isEditingTitle).toBe(false);
    });

    it("handleSaveTitle trims whitespace", async () => {
      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      await act(async () => {
        await result.current.handleSaveTitle("  Trimmed Title  ");
      });

      expect(mockUpdateConversationTitle).toHaveBeenCalledWith("conv-1", "Trimmed Title");
    });

    it("handleCancelTitleEdit exits edit mode", () => {
      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      act(() => {
        result.current.handleTitleClick();
      });

      act(() => {
        result.current.handleCancelTitleEdit();
      });

      expect(result.current.isEditingTitle).toBe(false);
    });
  });

  describe("handleTogglePinConversation", () => {
    it("toggles pin state", async () => {
      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      await act(async () => {
        await result.current.handleTogglePinConversation();
      });

      expect(mockTogglePinConversation).toHaveBeenCalledWith("conv-1");
    });

    it("does nothing without conversationId", async () => {
      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: undefined })
      );

      await act(async () => {
        await result.current.handleTogglePinConversation();
      });

      expect(mockTogglePinConversation).not.toHaveBeenCalled();
    });
  });

  describe("delete conversation", () => {
    it("handleDeleteConversation opens dialog", () => {
      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      act(() => {
        result.current.handleDeleteConversation();
      });

      expect(result.current.deleteDialogOpen).toBe(true);
    });

    it("handleDeleteConfirm deletes and navigates", async () => {
      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      await act(async () => {
        await result.current.handleDeleteConfirm();
      });

      expect(mockDeleteConversation).toHaveBeenCalledWith("conv-1");
      expect(mockToast.success).toHaveBeenCalledWith("Conversation deleted successfully.");
      expect(mockNavigate).toHaveBeenCalledWith("/chat");
    });

    it("handleDeleteConfirm shows error on failure", async () => {
      mockDeleteConversation.mockRejectedValue(new Error("Delete failed"));

      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      await act(async () => {
        await result.current.handleDeleteConfirm();
      });

      expect(mockToast.error).toHaveBeenCalledWith("Failed to delete conversation.");
    });
  });

  describe("export conversation", () => {
    it("exports conversation as JSON", () => {
      // Mock the link element behavior
      const mockClick = vi.fn();
      const originalCreateElement = document.createElement.bind(document);

      vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
        if (tagName === "a") {
          const mockLink = {
            setAttribute: vi.fn(),
            click: mockClick,
          };
          return mockLink as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tagName);
      });

      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      act(() => {
        result.current.handleExportConversation();
      });

      expect(mockClick).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });

  describe("setDeleteDialogOpen", () => {
    it("controls dialog state", () => {
      const { result } = renderHook(() =>
        useHeaderActions({ conversationId: "conv-1" })
      );

      act(() => {
        result.current.setDeleteDialogOpen(true);
      });

      expect(result.current.deleteDialogOpen).toBe(true);

      act(() => {
        result.current.setDeleteDialogOpen(false);
      });

      expect(result.current.deleteDialogOpen).toBe(false);
    });
  });
});
