import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useActionButtons } from "./useActionButtons";

const mockSetTheme = vi.fn();
const mockTogglePin = vi.fn();

let mockTheme = "dark";
let mockConversations = [
  { id: "conv-1", title: "Test", pinned: false },
];

vi.mock("../useConversations", () => ({
  useConversations: () => ({
    conversations: mockConversations,
    togglePinConversation: mockTogglePin,
  }),
}));

vi.mock("../../providers/ThemeProvider", () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}));

describe("useActionButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = "dark";
    mockConversations = [
      { id: "conv-1", title: "Test", pinned: false },
    ];
    mockTogglePin.mockResolvedValue(undefined);
  });

  describe("initial state", () => {
    it("returns current theme", () => {
      const { result } = renderHook(() =>
        useActionButtons({ conversationId: "conv-1" })
      );

      expect(result.current.theme).toBe("dark");
    });

    it("returns isConversationPinned false when not pinned", () => {
      const { result } = renderHook(() =>
        useActionButtons({ conversationId: "conv-1" })
      );

      expect(result.current.isConversationPinned).toBe(false);
    });

    it("returns isConversationPinned true when pinned", () => {
      mockConversations = [
        { id: "conv-1", title: "Test", pinned: true },
      ];

      const { result } = renderHook(() =>
        useActionButtons({ conversationId: "conv-1" })
      );

      expect(result.current.isConversationPinned).toBe(true);
    });

    it("returns isConversationPinned false when no conversation found", () => {
      const { result } = renderHook(() =>
        useActionButtons({ conversationId: "non-existent" })
      );

      expect(result.current.isConversationPinned).toBe(false);
    });
  });

  describe("toggleTheme", () => {
    it("switches from dark to light", () => {
      mockTheme = "dark";

      const { result } = renderHook(() =>
        useActionButtons({ conversationId: "conv-1" })
      );

      act(() => {
        result.current.toggleTheme();
      });

      expect(mockSetTheme).toHaveBeenCalledWith("light");
    });

    it("switches from light to dark", () => {
      mockTheme = "light";

      const { result } = renderHook(() =>
        useActionButtons({ conversationId: "conv-1" })
      );

      act(() => {
        result.current.toggleTheme();
      });

      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });
  });

  describe("togglePinConversation", () => {
    it("calls togglePin with conversationId", async () => {
      const { result } = renderHook(() =>
        useActionButtons({ conversationId: "conv-1" })
      );

      await act(async () => {
        await result.current.togglePinConversation();
      });

      expect(mockTogglePin).toHaveBeenCalledWith("conv-1");
    });

    it("does nothing when no conversationId", async () => {
      const { result } = renderHook(() =>
        useActionButtons({ conversationId: undefined })
      );

      await act(async () => {
        await result.current.togglePinConversation();
      });

      expect(mockTogglePin).not.toHaveBeenCalled();
    });
  });

  describe("conversation lookup", () => {
    it("finds correct conversation by id", () => {
      mockConversations = [
        { id: "conv-1", title: "First", pinned: true },
        { id: "conv-2", title: "Second", pinned: false },
      ];

      const { result } = renderHook(() =>
        useActionButtons({ conversationId: "conv-2" })
      );

      expect(result.current.isConversationPinned).toBe(false);
    });

    it("handles null conversations array", () => {
      mockConversations = null as unknown as typeof mockConversations;

      const { result } = renderHook(() =>
        useActionButtons({ conversationId: "conv-1" })
      );

      expect(result.current.isConversationPinned).toBe(false);
    });
  });
});
