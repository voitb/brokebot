import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useLayoutShortcuts } from "./use-layout-shortcuts";
import { mockNavigate, mockSearchParams, mockToast } from "@/testing/mocks/modules";

const mockSetOpen = vi.fn();
const mockSetOpenMobile = vi.fn();
const mockHandleNewChat = vi.fn();
const mockTogglePinConversation = vi.fn();

let mockOpen = false;
let mockOpenMobile = false;
let mockIsMobile = false;
let mockConversationId: string | undefined = undefined;

vi.mock("@/components/ui/sidebar", async () => {
  const { createMockSidebarHook } = await import("@/testing/mocks/hooks");
  return {
    useSidebar: () => createMockSidebarHook({
      open: mockOpen,
      setOpen: mockSetOpen,
      openMobile: mockOpenMobile,
      setOpenMobile: mockSetOpenMobile,
      isMobile: mockIsMobile,
    }),
  };
});

vi.mock("@/hooks/use-conversation-list", () => ({
  useConversationList: () => ({
    handleNewChat: mockHandleNewChat,
  }),
}));

vi.mock("@/hooks/use-conversation-id", () => ({
  useConversationId: () => mockConversationId,
}));

vi.mock("@/app/providers/conversations-provider", async () => {
  const { createMockConversationsHook } = await import("@/testing/mocks/hooks");
  return {
    useConversations: () =>
      createMockConversationsHook({
        togglePinConversation: mockTogglePinConversation,
      }),
  };
});

function pressKey(key: string, options: KeyboardEventInit = {}): void {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, ...options })
  );
}

function pressSequence(first: string, second: string): void {
  pressKey(first);
  pressKey(second);
}

describe("useLayoutShortcuts", () => {
  let dispatchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOpen = false;
    mockOpenMobile = false;
    mockIsMobile = false;
    mockConversationId = undefined;
    mockTogglePinConversation.mockResolvedValue(undefined);
    dispatchSpy = vi.spyOn(document, "dispatchEvent");
  });

  afterEach(() => {
    pressKey("Escape");
    dispatchSpy.mockRestore();
  });

  it("g+s toggles the desktop sidebar above the mobile breakpoint", () => {
    mockOpen = false;
    renderHook(() => useLayoutShortcuts());
    pressSequence("g", "s");
    expect(mockSetOpen).toHaveBeenCalledWith(true);
    expect(mockSetOpenMobile).not.toHaveBeenCalled();
  });

  it("g+s toggles the mobile sidebar below the breakpoint", () => {
    mockIsMobile = true;
    mockOpenMobile = false;
    renderHook(() => useLayoutShortcuts());
    pressSequence("g", "s");
    expect(mockSetOpenMobile).toHaveBeenCalledWith(true);
    expect(mockSetOpen).not.toHaveBeenCalled();
  });

  it("g+n creates new chat", () => {
    renderHook(() => useLayoutShortcuts());
    pressSequence("g", "n");
    expect(mockHandleNewChat).toHaveBeenCalled();
  });

  it("g+f dispatches focus-search event", () => {
    renderHook(() => useLayoutShortcuts());
    pressSequence("g", "f");
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "app:focus-search" }));
  });

  it("g+p and g+d require active conversation", () => {
    mockConversationId = undefined;
    renderHook(() => useLayoutShortcuts());

    pressSequence("g", "p");
    expect(mockTogglePinConversation).not.toHaveBeenCalled();

    pressKey("Escape");
    pressSequence("g", "d");
    const deleteEvent = dispatchSpy.mock.calls.find(
      ([event]: [Event]) => event.type === "conversation:delete"
    );
    expect(deleteEvent).toBeUndefined();
  });

  it("g+p toggles pin with active conversation", async () => {
    mockConversationId = "conv-123";
    renderHook(() => useLayoutShortcuts());
    pressSequence("g", "p");
    expect(mockTogglePinConversation).toHaveBeenCalledWith("conv-123");
    expect(mockToast.success).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith("Conversation pin status updated.");
    });
  });

  it("g+d dispatches delete event with conversation id", () => {
    mockConversationId = "conv-123";
    renderHook(() => useLayoutShortcuts());
    pressSequence("g", "d");

    const deleteCall = dispatchSpy.mock.calls.find(
      ([event]: [Event]) => event.type === "conversation:delete"
    );
    expect(deleteCall).toBeDefined();
    const deleteEvent = deleteCall?.[0] as CustomEvent | undefined;
    expect(deleteEvent?.detail).toEqual({ conversationId: "conv-123" });
  });

  it("? toggles shortcuts modal", () => {
    renderHook(() => useLayoutShortcuts());
    pressKey("?", { shiftKey: true });
    expect(mockNavigate).toHaveBeenCalledWith(
      { search: "?modal=shortcuts" },
      { replace: true }
    );
  });

  it("? closes shortcuts modal when already open", () => {
    mockSearchParams.set("modal", "shortcuts");
    renderHook(() => useLayoutShortcuts());
    pressKey("?", { shiftKey: true });
    expect(mockNavigate).toHaveBeenCalledWith(
      { search: "" },
      { replace: true }
    );
  });
});
