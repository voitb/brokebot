import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
import { BrowserRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { mockNavigate } from "../test/mocks/modules";

let mockConversationId: string | null = null;

// react-router-dom is globally mocked in setup.ts

vi.mock("./use-conversation-id", () => ({
  useConversationId: () => mockConversationId,
}));

function wrapper({ children }: { children: ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

function createKeyboardEvent(key: string, options: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    ...options,
  });
}

function dispatchKey(key: string, options: Partial<KeyboardEvent> = {}) {
  document.dispatchEvent(createKeyboardEvent(key, options));
}

describe("useKeyboardShortcuts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockConversationId = null;
  });

  afterEach(() => {
    vi.useRealTimers();
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

    it("triggers onToggleSidebar on g+s sequence", () => {
      const onToggleSidebar = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onToggleSidebar }), { wrapper });

      act(() => {
        dispatchKey("g");
        dispatchKey("s");
      });

      expect(onToggleSidebar).toHaveBeenCalledTimes(1);
    });

    it("triggers onSearch on g+f sequence", () => {
      const onSearch = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSearch }), { wrapper });

      act(() => {
        dispatchKey("g");
        dispatchKey("f");
      });

      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it("triggers onPinChat on g+p sequence when conversationId exists", () => {
      mockConversationId = "test-conversation-id";
      const onPinChat = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onPinChat }), { wrapper });

      act(() => {
        dispatchKey("g");
        dispatchKey("p");
      });

      expect(onPinChat).toHaveBeenCalledTimes(1);
    });

    it("does not trigger onPinChat on g+p when no conversationId", () => {
      mockConversationId = null;
      const onPinChat = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onPinChat }), { wrapper });

      act(() => {
        dispatchKey("g");
        dispatchKey("p");
      });

      expect(onPinChat).not.toHaveBeenCalled();
    });

    it("triggers onRenameChat on g+r sequence when conversationId exists", () => {
      mockConversationId = "test-conversation-id";
      const onRenameChat = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onRenameChat }), { wrapper });

      act(() => {
        dispatchKey("g");
        dispatchKey("r");
      });

      expect(onRenameChat).toHaveBeenCalledTimes(1);
    });

    it("triggers onDeleteChat on g+d sequence when conversationId exists", () => {
      mockConversationId = "test-conversation-id";
      const onDeleteChat = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onDeleteChat }), { wrapper });

      act(() => {
        dispatchKey("g");
        dispatchKey("d");
      });

      expect(onDeleteChat).toHaveBeenCalledTimes(1);
    });

    it("does nothing on invalid g+x sequence", () => {
      const onNewChat = vi.fn();
      const onSearch = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNewChat, onSearch }), { wrapper });

      act(() => {
        dispatchKey("g");
        dispatchKey("x");
      });

      expect(onNewChat).not.toHaveBeenCalled();
      expect(onSearch).not.toHaveBeenCalled();
    });
  });

  describe("timeout behavior", () => {
    it("resets sequence after 2 seconds", () => {
      const onNewChat = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNewChat }), { wrapper });

      act(() => {
        dispatchKey("g");
        vi.advanceTimersByTime(2000);
        dispatchKey("n");
      });

      expect(onNewChat).not.toHaveBeenCalled();
    });

    it("works if second key pressed before timeout", () => {
      const onNewChat = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNewChat }), { wrapper });

      act(() => {
        dispatchKey("g");
        vi.advanceTimersByTime(1500);
        dispatchKey("n");
      });

      expect(onNewChat).toHaveBeenCalledTimes(1);
    });
  });

  describe("single key shortcuts", () => {
    it("triggers onSearch on / key", () => {
      const onSearch = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSearch }), { wrapper });

      act(() => {
        dispatchKey("/");
      });

      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it("triggers onShowShortcuts on ? key", () => {
      const onShowShortcuts = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onShowShortcuts }), { wrapper });

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

  describe("input field handling", () => {
    it("ignores shortcuts when typing in input", () => {
      const onNewChat = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNewChat }), { wrapper });

      const input = document.createElement("input");
      document.body.appendChild(input);

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "g",
          bubbles: true,
        });
        Object.defineProperty(event, "target", { value: input });
        document.dispatchEvent(event);

        const event2 = new KeyboardEvent("keydown", {
          key: "n",
          bubbles: true,
        });
        Object.defineProperty(event2, "target", { value: input });
        document.dispatchEvent(event2);
      });

      expect(onNewChat).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it("ignores shortcuts when typing in textarea", () => {
      const onSearch = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSearch }), { wrapper });

      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "/",
          bubbles: true,
        });
        Object.defineProperty(event, "target", { value: textarea });
        document.dispatchEvent(event);
      });

      expect(onSearch).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });

  });

  describe("modifier keys", () => {
    it("ignores g key with ctrl modifier", () => {
      const onNewChat = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNewChat }), { wrapper });

      act(() => {
        dispatchKey("g", { ctrlKey: true });
        dispatchKey("n");
      });

      expect(onNewChat).not.toHaveBeenCalled();
    });

    it("ignores g key with meta modifier", () => {
      const onNewChat = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNewChat }), { wrapper });

      act(() => {
        dispatchKey("g", { metaKey: true });
        dispatchKey("n");
      });

      expect(onNewChat).not.toHaveBeenCalled();
    });

    it("ignores / key with modifiers", () => {
      const onSearch = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSearch }), { wrapper });

      act(() => {
        dispatchKey("/", { ctrlKey: true });
      });

      expect(onSearch).not.toHaveBeenCalled();
    });
  });

  describe("return values", () => {
    it("returns createNewChat function", () => {
      const { result } = renderHook(() => useKeyboardShortcuts({}), { wrapper });

      act(() => {
        result.current.createNewChat();
      });

      expect(mockNavigate).toHaveBeenCalledWith("/chat");
    });

    it("returns navigateHome function", () => {
      const { result } = renderHook(() => useKeyboardShortcuts({}), { wrapper });

      act(() => {
        result.current.navigateHome();
      });

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("returns currentConversationId", () => {
      mockConversationId = "test-id";
      const { result } = renderHook(() => useKeyboardShortcuts({}), { wrapper });

      expect(result.current.currentConversationId).toBe("test-id");
    });
  });

  describe("cleanup", () => {
    it("removes event listener on unmount", () => {
      const onNewChat = vi.fn();
      const { unmount } = renderHook(() => useKeyboardShortcuts({ onNewChat }), { wrapper });

      unmount();

      act(() => {
        dispatchKey("g");
        dispatchKey("n");
      });

      expect(onNewChat).not.toHaveBeenCalled();
    });

    it("clears timeout on unmount", () => {
      const onNewChat = vi.fn();
      const { unmount } = renderHook(() => useKeyboardShortcuts({ onNewChat }), { wrapper });

      act(() => {
        dispatchKey("g");
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(2000);
      });
    });
  });
});
