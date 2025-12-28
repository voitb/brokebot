import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useConversationId } from "./use-conversation-id";

function wrapper(initialPath: string) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        {children}
      </MemoryRouter>
    );
  };
}

describe("useConversationId", () => {
  it("returns conversation ID from /chat/:id route", () => {
    const { result } = renderHook(() => useConversationId(), {
      wrapper: wrapper("/chat/abc123"),
    });

    expect(result.current).toBe("abc123");
  });

  it("returns undefined for /chat route", () => {
    const { result } = renderHook(() => useConversationId(), {
      wrapper: wrapper("/chat"),
    });

    expect(result.current).toBeUndefined();
  });

  it("returns undefined for other routes", () => {
    const { result } = renderHook(() => useConversationId(), {
      wrapper: wrapper("/settings"),
    });

    expect(result.current).toBeUndefined();
  });

  it("handles UUIDs as conversation ID", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const { result } = renderHook(() => useConversationId(), {
      wrapper: wrapper(`/chat/${uuid}`),
    });

    expect(result.current).toBe(uuid);
  });

  it("returns undefined for /chat/ with trailing slash only", () => {
    const { result } = renderHook(() => useConversationId(), {
      wrapper: wrapper("/chat/"),
    });

    expect(result.current).toBeUndefined();
  });
});
