import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLayoutShortcuts } from "./useLayoutShortcuts";

const mockSetOpen = vi.fn();
const mockHandleNewChat = vi.fn();
const mockTogglePinConversation = vi.fn();
const mockNavigate = vi.fn();

let mockOpen = false;
let mockConversationId: string | undefined = undefined;
let capturedShortcuts: Record<string, () => void> = {};

vi.mock("../../ui/sidebar", () => ({
  useSidebar: () => ({
    open: mockOpen,
    setOpen: mockSetOpen,
  }),
}));

vi.mock("@/components/chat/sidebar/hooks/useConversationList", () => ({
  useConversationList: () => ({
    handleNewChat: mockHandleNewChat,
  }),
}));

vi.mock("@/providers/ConversationsProvider", () => ({
  useConversations: () => ({
    togglePinConversation: mockTogglePinConversation,
  }),
}));

vi.mock("@/hooks/useConversationId", () => ({
  useConversationId: () => mockConversationId,
}));

let mockSearchParams = new URLSearchParams();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}));

vi.mock("@/hooks/useKeyboardShortcuts", () => ({
  useKeyboardShortcuts: (shortcuts: Record<string, () => void>) => {
    capturedShortcuts = shortcuts;
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe("useLayoutShortcuts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpen = false;
    mockConversationId = undefined;
    mockSearchParams = new URLSearchParams();
    capturedShortcuts = {};
  });

  describe("onToggleSidebar", () => {
    it("toggles sidebar from closed to open", () => {
      mockOpen = false;
      renderHook(() => useLayoutShortcuts());

      capturedShortcuts.onToggleSidebar?.();

      expect(mockSetOpen).toHaveBeenCalledWith(true);
    });

    it("toggles sidebar from open to closed", () => {
      mockOpen = true;
      renderHook(() => useLayoutShortcuts());

      capturedShortcuts.onToggleSidebar?.();

      expect(mockSetOpen).toHaveBeenCalledWith(false);
    });
  });

  describe("onNewChat", () => {
    it("calls handleNewChat from useConversationList", () => {
      renderHook(() => useLayoutShortcuts());

      capturedShortcuts.onNewChat?.();

      expect(mockHandleNewChat).toHaveBeenCalled();
    });
  });

  describe("onSearch", () => {
    it("dispatches focus-search custom event", () => {
      const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");

      renderHook(() => useLayoutShortcuts());

      capturedShortcuts.onSearch?.();

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.any(CustomEvent)
      );
      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe("app:focus-search");

      dispatchEventSpy.mockRestore();
    });
  });

  describe("onPinChat", () => {
    it("does nothing when no conversation is selected", () => {
      mockConversationId = undefined;
      renderHook(() => useLayoutShortcuts());

      capturedShortcuts.onPinChat?.();

      expect(mockTogglePinConversation).not.toHaveBeenCalled();
    });

    it("toggles pin when conversation is selected", () => {
      mockConversationId = "test-conv-id";
      renderHook(() => useLayoutShortcuts());

      capturedShortcuts.onPinChat?.();

      expect(mockTogglePinConversation).toHaveBeenCalledWith("test-conv-id");
    });
  });

  describe("onDeleteChat", () => {
    it("does nothing when no conversation is selected", () => {
      mockConversationId = undefined;
      const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");

      renderHook(() => useLayoutShortcuts());

      capturedShortcuts.onDeleteChat?.();

      expect(dispatchEventSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "conversation:delete" })
      );

      dispatchEventSpy.mockRestore();
    });

    it("dispatches delete event when conversation is selected", () => {
      mockConversationId = "test-conv-id";
      const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");

      renderHook(() => useLayoutShortcuts());

      capturedShortcuts.onDeleteChat?.();

      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe("conversation:delete");
      expect(event.detail).toEqual({ conversationId: "test-conv-id" });

      dispatchEventSpy.mockRestore();
    });
  });

  describe("onShowShortcuts", () => {
    it("opens shortcuts modal when not open", () => {
      mockSearchParams = new URLSearchParams();
      renderHook(() => useLayoutShortcuts());

      capturedShortcuts.onShowShortcuts?.();

      expect(mockNavigate).toHaveBeenCalledWith(
        { search: "?modal=shortcuts" },
        { replace: true }
      );
    });

    it("closes shortcuts modal when already open", () => {
      mockSearchParams = new URLSearchParams("modal=shortcuts");
      renderHook(() => useLayoutShortcuts());

      capturedShortcuts.onShowShortcuts?.();

      expect(mockNavigate).toHaveBeenCalledWith(
        { search: "" },
        { replace: true }
      );
    });
  });

  describe("onRenameChat", () => {
    it("dispatches rename event", () => {
      const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");

      renderHook(() => useLayoutShortcuts());

      capturedShortcuts.onRenameChat?.();

      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe("conversation:rename");

      dispatchEventSpy.mockRestore();
    });
  });
});
