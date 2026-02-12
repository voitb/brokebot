import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
import { BrowserRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { mockNavigate } from "@/testing/mocks/modules";

let mockConversationId: string | null = null;

vi.mock("@/hooks/use-conversation-id", () => ({
  useConversationId: () => mockConversationId,
}));

function wrapper({ children }: { children: ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

function dispatchKey(key: string, options: Partial<KeyboardEvent> = {}) {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, ...options })
  );
}

describe("useKeyboardShortcuts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockConversationId = null;
  });

  describe("key sequences", () => {
    it("triggers onNewChat on g+n sequence", () => {
      const onNewChat = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNewChat }), { wrapper });

      act(() => {
        dispatchKey("g");
        dispatchKey("n");
      });

      expect(onNewChat).toHaveBeenCalledTimes(1);
    });

    it("navigates to /chat on g+n when onNewChat not provided", () => {
      renderHook(() => useKeyboardShortcuts({}), { wrapper });

      act(() => {
        dispatchKey("g");
        dispatchKey("n");
      });

      expect(mockNavigate).toHaveBeenCalledWith("/chat");
    });

    it("triggers onToggleSidebar on g+s and onSearch on g+f", () => {
      const onToggleSidebar = vi.fn();
      const onSearch = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onToggleSidebar, onSearch }), { wrapper });

      act(() => {
        dispatchKey("g");
        dispatchKey("s");
      });
      expect(onToggleSidebar).toHaveBeenCalledTimes(1);

      act(() => {
        dispatchKey("g");
        dispatchKey("f");
      });
      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it("triggers conversation actions only when conversationId exists", () => {
      const onPinChat = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onPinChat }), { wrapper });

      act(() => {
        dispatchKey("g");
        dispatchKey("p");
      });
      expect(onPinChat).not.toHaveBeenCalled();

      mockConversationId = "test-id";
      const { rerender } = renderHook(
        () => useKeyboardShortcuts({ onPinChat }),
        { wrapper }
      );
      rerender();

      act(() => {
        dispatchKey("g");
        dispatchKey("p");
      });
      expect(onPinChat).toHaveBeenCalledTimes(1);
    });
  });

  describe("single key shortcuts", () => {
    it("triggers onSearch on / and onShowShortcuts on ?", () => {
      const onSearch = vi.fn();
      const onShowShortcuts = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSearch, onShowShortcuts }), { wrapper });

      act(() => {
        dispatchKey("/");
      });
      expect(onSearch).toHaveBeenCalledTimes(1);

      act(() => {
        dispatchKey("?");
      });
      expect(onShowShortcuts).toHaveBeenCalledTimes(1);
    });

    it("resets sequence on Escape", () => {
      const onNewChat = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNewChat }), { wrapper });

      act(() => {
        dispatchKey("g");
        dispatchKey("Escape");
        dispatchKey("n");
      });

      expect(onNewChat).not.toHaveBeenCalled();
    });
  });

  describe("shortcuts disabled in input fields and with modifiers", () => {
    it("ignores shortcuts when typing in input fields or using modifier keys", () => {
      const onNewChat = vi.fn();
      const onSearch = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNewChat, onSearch }), { wrapper });

      const input = document.createElement("input");
      document.body.appendChild(input);

      const inputEvent = new KeyboardEvent("keydown", { key: "g", bubbles: true });
      Object.defineProperty(inputEvent, "target", { value: input });
      act(() => {
        document.dispatchEvent(inputEvent);
        dispatchKey("n");
      });
      expect(onNewChat).not.toHaveBeenCalled();

      act(() => {
        dispatchKey("g", { ctrlKey: true });
        dispatchKey("n");
        dispatchKey("/", { metaKey: true });
      });
      expect(onNewChat).not.toHaveBeenCalled();
      expect(onSearch).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });
  });

  describe("return values", () => {
    it("returns navigation functions and currentConversationId", () => {
      mockConversationId = "test-id";
      const { result } = renderHook(() => useKeyboardShortcuts({}), { wrapper });

      expect(result.current.currentConversationId).toBe("test-id");

      act(() => {
        result.current.createNewChat();
      });
      expect(mockNavigate).toHaveBeenCalledWith("/chat");

      act(() => {
        result.current.navigateHome();
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
